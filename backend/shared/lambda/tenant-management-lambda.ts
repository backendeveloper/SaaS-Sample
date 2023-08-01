import {Construct} from "constructs";
import {AssetType, Fn, TerraformAsset} from "cdktf";
import * as core from "@core/index";
import * as awsProvider from "@providers/aws";
import {IamRole} from "@providers/aws/iam-role";
import * as path from 'path';
import {Lambda} from "@modules/lambda";

import {DatabaseConstruct} from "../../database";
import {LayerConstruct} from "../../layer/layer";

type TenantManagementLambdaConfig = {
    variable: core.VariableResult;
    database: DatabaseConstruct;
    layers: LayerConstruct;
}

export class TenantManagementLambdaConstruct extends Construct {
    public readonly registerTenantLambda: Lambda;
    public readonly getTenantsLambda: Lambda;
    public readonly createTenantLambda: Lambda;
    // public readonly getTenantLambda: Lambda;
    // public readonly updateTenantLambda: Lambda;
    // public readonly activeTenantLambda: Lambda;
    // public readonly deactivateTenantLambda: Lambda;
    public readonly integrations: { [key: string]: any };
    public readonly registerLambdaAccessRole: IamRole;

    constructor(scope: Construct, id: string, config: TenantManagementLambdaConfig) {
        super(scope, id);

        const rolePath = '/tenant-management/';
        const policyPath = '/tenant-management/';
        const policies = [
            'arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy',
            'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
            'arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess'
        ];
        const policyStatements = {
            dynamodb: {
                effect: 'Allow',
                actions: [
                    'dynamodb:PutItem',
                    'dynamodb:GetItem',
                    'dynamodb:UpdateItem',
                    'dynamodb:Scan',
                    'dynamodb:Query'
                ],
                resources: [
                    config.database.tenantDetailsTable.dynamodbTableArnOutput,
                    `${config.database.tenantDetailsTable.dynamodbTableArnOutput}/index/*`
                ]
            }
        };
        const dependsOn = [
            config.variable.environment,
            config.variable.accountId,
            config.variable.region,

            config.layers.utilServiceLayer,
            config.variable.layerInsightsExtensionArn
        ];

        const registerLambdaNamePrefix = 'saas-register-tenant-lambda';
        const registerLambdaExecutionRole = new awsProvider.iamRole.IamRole(this, 'register_lambda_execution_role', {
            name: `saas-register-execution-role-${config.variable.region.value}-${config.variable.environment.value}`,
            path: '/register/',
            assumeRolePolicy: Fn.jsonencode({
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'sts:AssumeRole',
                        Effect: 'Allow',
                        Principal: {
                            Service: 'lambda.amazonaws.com'
                        }
                    },
                ]
            }),
            managedPolicyArns: policies,
            inlinePolicy: [
                {
                    name: `saas-register-execution-role-policy-${config.variable.region.value}-${config.variable.environment.value}`,
                    policy: Fn.jsonencode({
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Action: [
                                    'logs:PutLogEvents',
                                    'logs:CreateLogStream',
                                    'logs:CreateLogGroup'
                                ],
                                Resource: [
                                    `arn:aws:logs:${config.variable.region.value}:${config.variable.accountId.value}:log-group:/aws/lambda/${registerLambdaNamePrefix}_${config.variable.environment.value}:*:*`,
                                    `arn:aws:logs:${config.variable.region.value}:${config.variable.accountId.value}:log-group:/aws/lambda/${registerLambdaNamePrefix}_${config.variable.environment.value}:*`
                                ]
                            }
                        ]
                    }),
                }
            ],
            forceDetachPolicies: true,

            dependsOn: [
                ...dependsOn,
                config.database.tenantDetailsTable
            ]
        });
        const registerLambdaAccessRole = new awsProvider.iamRole.IamRole(this, 'register_lambda_access_role', {
            name: `saas-register-access-role-${config.variable.region.value}-${config.variable.environment.value}`,
            path: '/register/',
            assumeRolePolicy: Fn.jsonencode({
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'sts:AssumeRole',
                        Effect: 'Allow',
                        Principal: {
                            AWS: [registerLambdaExecutionRole.arn]
                        }
                    },
                ]
            }),
            forceDetachPolicies: true,

            dependsOn: [
                ...dependsOn,
                registerLambdaExecutionRole
            ]
        });

        const environmentVariables = {
            AWS_ACCOUNT_ID: config.variable.accountId.value,
            LOG_LEVEL: 'DEBUG',
            POWERTOOLS_METRICS_NAMESPACE: 'ServerlessSaaS'
        };
        const layers = [
            config.variable.layerInsightsExtensionArn.value,
            config.layers.utilServiceLayer.lambdaLayerArnOutput
        ];

        const createTenantLambda = new Lambda(this, 'create_tenant_lambda', {
            functionName: `saas-create-tenant-lambda_${config.variable.environment.value}`,
            description: 'saas Create Tenant Lambda',
            handler: 'index.handler',
            runtime: 'nodejs18.x',
            publish: true,
            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'create_tenant_lambda_asset', {
                path: path.resolve(__dirname, 'tenant-management/create-tenant/dist'),
                type: AssetType.ARCHIVE
            }).path,
            tracingMode: 'Active',
            timeout: 29,
            environmentVariables: {
                ...environmentVariables,
                TENANT_USER_DETAIL_TABLE_NAME: config.database.tenantDetailsTable.dynamodbTableIdOutput,
                POWERTOOLS_SERVICE_NAME: 'TenantManagement.CreateTenant'
            },
            layers: [
                ...layers,
                config.layers.databaseServiceLayer.lambdaLayerArnOutput
            ],

            rolePath,
            policyPath,

            attachPolicies: true,
            policies,
            numberOfPolicies: policies.length,

            attachPolicyStatements: true,
            policyStatements,
            cloudwatchLogsRetentionInDays: 7,

            dependsOn: [
                ...dependsOn,
                config.database.tenantDetailsTable,
                config.layers.databaseServiceLayer
            ]
        });
        const registerTenantLambda = new Lambda(this, 'register_tenant_lambda', {
            functionName: `${registerLambdaNamePrefix}_${config.variable.environment.value}`,
            description: 'saas Register Tenant Lambda',
            handler: 'index.handler',
            runtime: 'nodejs18.x',
            publish: true,
            createRole: false,
            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'register_tenant_lambda_asset', {
                path: path.resolve(__dirname, 'tenant-management/register-tenant/dist'),
                type: AssetType.ARCHIVE
            }).path,
            tracingMode: 'Active',
            timeout: 29,
            environmentVariables: {
                ...environmentVariables,
                SHARED_API_DOMAIN_NAME: `https://${core.getSubDomainWithEnvironment(config, config.variable.sharedApiSubDomainName.value)}.${config.variable.domainName.value}`,
                CREATE_TENANT_ADMIN_USER_PATH: '/user/tenant-admin',
                CREATE_TENANT_PATH: '/tenant',
                REGISTER_ACCESS_ROLE_ARN: registerLambdaAccessRole.arn,
                PROVISION_TENANT_RESOURCE_PATH: '/provisioning',
                POWERTOOLS_SERVICE_NAME: 'TenantManagement.RegisterTenant'
            },
            layers: [
                ...layers,
                config.layers.authServiceLayer.lambdaLayerArnOutput
            ],

            lambdaRole: registerLambdaExecutionRole.arn,
            cloudwatchLogsRetentionInDays: 7,

            dependsOn: [
                ...dependsOn,
                createTenantLambda,

                registerLambdaExecutionRole,
                registerLambdaAccessRole,

                config.layers.authServiceLayer,

                config.variable.sharedApiSubDomainName,
                config.variable.domainName
            ]
        });
        const getTenantsLambda = new Lambda(this, 'get_tenants_lambda', {
            functionName: `saas-get-tenants-lambda_${config.variable.environment.value}`,
            description: 'saas Get Tenants Lambda',
            handler: 'index.handler',
            runtime: 'nodejs18.x',
            publish: true,
            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'get_tenants_lambda_asset', {
                path: path.resolve(__dirname, 'tenant-management/get-tenants/dist'),
                type: AssetType.ARCHIVE
            }).path,
            tracingMode: 'Active',
            timeout: 29,
            environmentVariables: {
                ...environmentVariables,
                TENANT_USER_DETAIL_TABLE_NAME: config.database.tenantDetailsTable.dynamodbTableIdOutput,
                POWERTOOLS_SERVICE_NAME: 'TenantManagement.GetTenants'
            },
            layers: [
                ...layers,
                config.layers.databaseServiceLayer.lambdaLayerArnOutput
            ],

            rolePath,
            policyPath,

            attachPolicies: true,
            policies,
            numberOfPolicies: policies.length,

            attachPolicyStatements: true,
            policyStatements,
            cloudwatchLogsRetentionInDays: 7,

            dependsOn: [
                ...dependsOn,
                config.database.tenantDetailsTable,
                config.layers.databaseServiceLayer
            ]
        });
        // const getTenantLambda = new Lambda(this, 'get_tenant_lambda', {
        //     functionName: `saas-get-tenant-lambda_${config.variable.environment.value}`,
        //     description: 'saas Get Tenant Lambda',
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     localExistingPackage: new TerraformAsset(this, 'get_tenant_lambda_asset', {
        //         path: path.resolve(__dirname, 'tenant-management/get-tenant/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables: {
        //         ...environmentVariables,
        //         POWERTOOLS_SERVICE_NAME: 'TenantManagement.GetTenant'
        //     },
        //     layers: [
        //         ...layers,
        //         config.layers.databaseServiceLayer.lambdaLayerArnOutput,
        //         config.layers.authServiceLayer.lambdaLayerArnOutput
        //     ],
        //
        //     rolePath,
        //     policyPath,
        //
        //     attachPolicies: true,
        //     policies,
        //     numberOfPolicies: policies.length,
        //
        //     attachPolicyStatements: true,
        //     policyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [
        //         ...dependsOn,
        //         config.database.tenantDetailsTable,
        //         config.layers.databaseServiceLayer,
        //         config.layers.authServiceLayer
        //     ]
        // });
        // const updateTenantLambda = new Lambda(this, 'update_tenant_lambda', {
        //     functionName: `saas-update-tenant-lambda_${config.variable.environment.value}`,
        //     description: 'saas Update Tenant Lambda',
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     localExistingPackage: new TerraformAsset(this, 'update_tenant_lambda_asset', {
        //         path: path.resolve(__dirname, 'tenant-management/update-tenant/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables: {
        //         ...environmentVariables,
        //         POWERTOOLS_SERVICE_NAME: 'TenantManagement.UpdateTenant'
        //     },
        //     layers: [
        //         ...layers,
        //         config.layers.databaseServiceLayer.lambdaLayerArnOutput,
        //         config.layers.authServiceLayer.lambdaLayerArnOutput
        //     ],
        //
        //     rolePath,
        //     policyPath,
        //
        //     attachPolicies: true,
        //     policies,
        //     numberOfPolicies: policies.length,
        //
        //     attachPolicyStatements: true,
        //     policyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [
        //         ...dependsOn,
        //         config.database.tenantDetailsTable,
        //         config.layers.databaseServiceLayer,
        //         config.layers.authServiceLayer
        //     ]
        // });
        // const activeTenantLambda = new Lambda(this, 'activate_tenant_lambda', {
        //     functionName: `saas-activate-tenant-lambda_${config.variable.environment.value}`,
        //     description: 'saas Activate Tenant Lambda',
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     localExistingPackage: new TerraformAsset(this, 'activate_tenant_lambda_asset', {
        //         path: path.resolve(__dirname, 'tenant-management/activate-tenant/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables: {
        //         ...environmentVariables,
        //         ENABLE_USERS_BY_TENANT: '/users/enable',
        //         PROVISION_TENANT: '/provisioning/',
        //         POWERTOOLS_SERVICE_NAME: 'TenantManagement.ActivateTenant'
        //     },
        //     layers: [
        //         ...layers,
        //         config.layers.databaseServiceLayer.lambdaLayerArnOutput,
        //         config.layers.authServiceLayer.lambdaLayerArnOutput
        //     ],
        //
        //     rolePath,
        //     policyPath,
        //
        //     attachPolicies: true,
        //     policies,
        //     numberOfPolicies: policies.length,
        //
        //     attachPolicyStatements: true,
        //     policyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [
        //         ...dependsOn,
        //         config.database.tenantDetailsTable,
        //         config.layers.databaseServiceLayer,
        //         config.layers.authServiceLayer
        //     ]
        // });
        // const deactivateTenantLambda = new Lambda(this, 'deactivate_tenant_lambda', {
        //     functionName: `saas-deactivate-tenant-lambda_${config.variable.environment.value}`,
        //     description: 'saas Deactivate Tenant Lambda',
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     localExistingPackage: new TerraformAsset(this, 'deactivate_tenant_lambda_asset', {
        //         path: path.resolve(__dirname, 'tenant-management/deactivate-tenant/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables: {
        //         ...environmentVariables,
        //         DEPROVISION_TENANT: '/provisioning/',
        //         DISABLE_USERS_BY_TENANT: '/users/disable',
        //         POWERTOOLS_SERVICE_NAME: 'TenantManagement.DeactivateTenant'
        //     },
        //     layers: [
        //         ...layers,
        //         config.layers.databaseServiceLayer.lambdaLayerArnOutput,
        //         config.layers.authServiceLayer.lambdaLayerArnOutput
        //     ],
        //
        //     rolePath,
        //     policyPath,
        //
        //     attachPolicies: true,
        //     policies,
        //     numberOfPolicies: policies.length,
        //
        //     attachPolicyStatements: true,
        //     policyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [
        //         ...dependsOn,
        //         config.database.tenantDetailsTable,
        //         config.layers.databaseServiceLayer,
        //         config.layers.authServiceLayer
        //     ]
        // });

        const authorizerIntegrations = {
            integration_type: 'AWS_PROXY',
            payload_format_version: '2.0',
            authorizer_key: 'lambda',
            authorization_type: 'CUSTOM'
        };
        const iamIntegrations = {
            integration_type: 'AWS_PROXY',
            payload_format_version: '2.0',
            authorization_type: 'AWS_IAM'
        };

        const integrations = {
            'POST /tenant': {
                description: 'Creates a tenant',
                lambda_arn: createTenantLambda.lambdaFunctionArnOutput,
                ...iamIntegrations
            },
            'POST /registration': {
                description: 'Register a new tenant',
                lambda_arn: registerTenantLambda.lambdaFunctionArnOutput,
                integration_type: 'AWS_PROXY',
                payload_format_version: '2.0'
            },
            'GET /tenants': {
                description: 'Returns all tenants',
                lambda_arn: getTenantsLambda.lambdaFunctionArnOutput,
                ...authorizerIntegrations
            },
            // 'GET /tenant/{tenantid}': {
            //     description: 'Return a tenant by a tenant id',
            //     lambda_arn: getTenantLambda.lambdaFunctionArnOutput,
            //     integration_type: 'AWS_PROXY',
            //     payload_format_version: '2.0',
            //     authorizer_key: 'lambda',
            //     authorization_type: 'CUSTOM'
            // },
            // 'PUT /tenant/{tenantid}': {
            //     description: 'Updates a tenant',
            //     lambda_arn: updateTenantLambda.lambdaFunctionArnOutput,
            //     payload_format_version: '2.0',
            //     authorizer_key: 'lambda',
            //     authorization_type: 'CUSTOM'
            // },
            // 'PUT /tenant/activation/{tenantid}': {
            //     description: 'Activate an existing tenant',
            //     lambda_arn: activeTenantLambda.lambdaFunctionArnOutput,
            //     integration_type: 'AWS_PROXY',
            //     payload_format_version: '2.0',
            //     authorization_type: 'AWS_IAM'
            // },
            // 'DELETE /tenant/{tenantid}': {
            //     description: 'Disables a tenant by a tenant id',
            //     lambda_arn: deactivateTenantLambda.lambdaFunctionArnOutput,
            //     integration_type: 'AWS_PROXY',
            //     payload_format_version: '2.0',
            //     authorization_type: 'AWS_IAM'
            // },
        };

        this.registerTenantLambda = registerTenantLambda;
        this.getTenantsLambda = getTenantsLambda;
        this.createTenantLambda = createTenantLambda;
        // this.getTenantLambda = getTenantLambda;
        // this.updateTenantLambda = updateTenantLambda;
        // this.activeTenantLambda = activeTenantLambda;
        // this.deactivateTenantLambda = deactivateTenantLambda;
        this.integrations = integrations;
        this.registerLambdaAccessRole = registerLambdaAccessRole;
    }
}