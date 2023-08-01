import {Construct} from "constructs";
import {AssetType, TerraformAsset} from "cdktf";
import * as path from 'path';
import * as core from "@core/index";
import {Lambda} from "@modules/lambda";

import {DatabaseConstruct} from "../../database";
import {AuthConstruct} from "../../auth";
import {LayerConstruct} from "../../layer/layer";

interface IUserManagementLambdaConfig {
    variable: core.VariableResult;
    database: DatabaseConstruct;
    auth: AuthConstruct;
    layers: LayerConstruct;
}

export class UserManagementLambdaConstruct extends Construct {
    public readonly createTenantAdminUserLambda: Lambda;
    public readonly createUserLambda: Lambda;
    public readonly getUsersLambda: Lambda;
    // public readonly getUserLambda: Lambda;
    // public readonly updateUserLambda: Lambda;
    // public readonly enableUsersByTenantUserLambda: Lambda;
    // public readonly disableUsersByTenantUserLambda: Lambda;
    // public readonly disableUserLambda: Lambda;
    public readonly integrations: { [key: string]: any };

    constructor(scope: Construct, id: string, config: IUserManagementLambdaConfig) {
        super(scope, id);

        const rolePath = '/user-management/';
        const policyPath = '/user-management/';
        const policies = [
            'arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy',
            'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
            'arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess'
        ];
        const tenantUserPoolLambdaExecutionPolicyStatements = {
            cognito: {
                effect: 'Allow',
                actions: ['cognito-idp:*'],
                resources: ['*']
            },
            tenantDetailsTable: {
                effect: 'Allow',
                actions: ['dynamodb:GetItem'],
                resources: [config.database.tenantDetailsTable.dynamodbTableArnOutput]
            },
            tenantUserMappingTable: {
                effect: 'Allow',
                actions: [
                    'dynamodb:GetItem',
                    'dynamodb:Query'
                ],
                resources: [config.database.tenantUserMappingTable.dynamodbTableArnOutput]
            }
        };
        const createUserLambdaExecutionPolicyStatements = {
            cognito: {
                effect: 'Allow',
                actions: ['cognito-idp:*'],
                resources: ['*']
            },
            tenantDetailsTable: {
                effect: 'Allow',
                actions: ['dynamodb:GetItem'],
                resources: [config.database.tenantDetailsTable.dynamodbTableArnOutput]
            },
            tenantUserMappingTable: {
                effect: 'Allow',
                actions: ['dynamodb:PutItem'],
                resources: [config.database.tenantUserMappingTable.dynamodbTableArnOutput]
            }
        };
        const dependsOn = [
            config.variable.environment,
            config.variable.accountId,

            config.layers.utilServiceLayer,
            config.layers.authServiceLayer,
            config.variable.layerInsightsExtensionArn
        ];
        const environmentVariables = {
            AWS_ACCOUNT_ID: config.variable.accountId.value,
            LOG_LEVEL: 'DEBUG',
            POWERTOOLS_METRICS_NAMESPACE: 'ServerlessSaaS'
        };
        const layers = [
            config.variable.layerInsightsExtensionArn.value,
            config.layers.authServiceLayer.lambdaLayerArnOutput,
            config.layers.utilServiceLayer.lambdaLayerArnOutput
        ];

        const createTenantAdminUserLambda = new Lambda(this, 'create_tenant_admin_lambda', {
            functionName: `saas-create-tenant-admin-user-lambda_${config.variable.environment.value}`,
            description: 'saas Create Tenant Admin User Lambda',
            handler: 'index.handler',
            runtime: 'nodejs18.x',
            publish: true,
            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'create_tenant_admin_lambda_asset', {
                path: path.resolve(__dirname, 'user-management/create-tenant-admin-user/dist'),
                type: AssetType.ARCHIVE
            }).path,
            tracingMode: 'Active',
            timeout: 29,
            environmentVariables: {
                ...environmentVariables,
                TENANT_USER_POOL_ID: config.auth.pooledTenantUserPool.id,
                TENANT_APP_CLIENT_ID: config.auth.pooledTenantUserPoolClient.id,
                TENANT_USER_MAPPING_TABLE_NAME: config.database.tenantUserMappingTable.dynamodbTableIdOutput,
                POWERTOOLS_SERVICE_NAME: 'UserManagement.CreateTenantAdmin'
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
            policyStatements: createUserLambdaExecutionPolicyStatements,
            cloudwatchLogsRetentionInDays: 7,

            dependsOn: [
                ...dependsOn,
                config.layers.databaseServiceLayer,
                config.auth.pooledTenantUserPool,
                config.auth.pooledTenantUserPoolClient,
                config.database.tenantUserMappingTable
            ]
        });
        const createUserLambda = new Lambda(this, 'create_user_lambda', {
            functionName: `saas-create-user-lambda_${config.variable.environment.value}`,
            description: 'saas Create User Lambda',
            handler: 'index.handler',
            runtime: 'nodejs18.x',
            publish: true,
            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'create_user_lambda_asset', {
                path: path.resolve(__dirname, 'user-management/create-user/dist'),
                type: AssetType.ARCHIVE
            }).path,
            tracingMode: 'Active',
            timeout: 29,
            environmentVariables: {
                ...environmentVariables,
                TENANT_USER_POOL_ID: config.auth.pooledTenantUserPool.id,
                POWERTOOLS_SERVICE_NAME: 'UserManagement.CreateUser'
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
            policyStatements: createUserLambdaExecutionPolicyStatements,
            cloudwatchLogsRetentionInDays: 7,

            dependsOn: [
                ...dependsOn,
                config.layers.databaseServiceLayer,
                config.auth.pooledTenantUserPool
            ]
        });
        const getUsersLambda = new Lambda(this, 'get_users_lambda', {
            functionName: `saas-get-users-lambda_${config.variable.environment.value}`,
            description: 'saas Get Users Lambda',
            handler: 'index.handler',
            runtime: 'nodejs18.x',
            publish: true,
            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'get_users_lambda_asset', {
                path: path.resolve(__dirname, 'user-management/get-users/dist'),
                type: AssetType.ARCHIVE
            }).path,
            tracingMode: 'Active',
            timeout: 29,
            environmentVariables: {
                ...environmentVariables,
                TENANT_USER_POOL_ID: config.auth.pooledTenantUserPool.id,
                POWERTOOLS_SERVICE_NAME: 'UserManagement.GetUsers'
            },
            layers,

            rolePath,
            policyPath,

            attachPolicies: true,
            policies,
            numberOfPolicies: policies.length,

            attachPolicyStatements: true,
            policyStatements: tenantUserPoolLambdaExecutionPolicyStatements,
            cloudwatchLogsRetentionInDays: 7,

            dependsOn: [
                ...dependsOn,
                config.auth.pooledTenantUserPool
            ]
        });
        // const getUserLambda = new Lambda(this, 'get_user_lambda', {
        //     functionName: `saas-get-user-lambda_${config.variable.environment.value}`,
        //     description: 'saas Get User Lambda',
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     localExistingPackage: new TerraformAsset(this, 'get_user_lambda_asset', {
        //         path: path.resolve(__dirname, 'user-management/get-user/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables: {
        //         ...environmentVariables,
        //         TENANT_USER_POOL_ID: config.auth.pooledTenantUserPool.id,
        //         POWERTOOLS_SERVICE_NAME: 'UserManagement.GetUser'
        //     },
        //     layers,
        //
        //     rolePath,
        //     policyPath,
        //
        //     attachPolicies: true,
        //     policies,
        //     numberOfPolicies: policies.length,
        //
        //     attachPolicyStatements: true,
        //     policyStatements: tenantUserPoolLambdaExecutionPolicyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [
        //         ...dependsOn,
        //         config.auth.pooledTenantUserPool
        //     ]
        // });
        // const updateUserLambda = new Lambda(this, 'update_user_lambda', {
        //     functionName: `saas-update-user-lambda_${config.variable.environment.value}`,
        //     description: 'saas Update User Lambda',
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     localExistingPackage: new TerraformAsset(this, 'update_user_lambda_asset', {
        //         path: path.resolve(__dirname, 'user-management/update-user/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables: {
        //         ...environmentVariables,
        //         TENANT_USER_POOL_ID: config.auth.pooledTenantUserPool.id,
        //         POWERTOOLS_SERVICE_NAME: 'UserManagement.UpdateUser'
        //     },
        //     layers,
        //
        //     rolePath,
        //     policyPath,
        //
        //     attachPolicies: true,
        //     policies,
        //     numberOfPolicies: policies.length,
        //
        //     attachPolicyStatements: true,
        //     policyStatements: tenantUserPoolLambdaExecutionPolicyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [
        //         ...dependsOn,
        //         config.auth.pooledTenantUserPool
        //     ]
        // });
        // const enableUsersByTenantUserLambda = new Lambda(this, 'enable_users_by_tenant_user_lambda', {
        //     functionName: `saas-enable-users-by-tenant-lambda_${config.variable.environment.value}`,
        //     description: 'saas Enable Users By Tenant Lambda',
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     localExistingPackage: new TerraformAsset(this, 'enable_users_by_tenant_user_lambda_asset', {
        //         path: path.resolve(__dirname, 'user-management/enable-users-by-tenant/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables: {
        //         ...environmentVariables,
        //         TENANT_USER_POOL_ID: config.auth.pooledTenantUserPool.id,
        //         TENANT_USER_MAPPING_TABLE_NAME: config.database.tenantUserMappingTable.dynamodbTableIdOutput,
        //         POWERTOOLS_SERVICE_NAME: 'UserManagement.EnableUsersByTenant'
        //     },
        //     layers: [
        //         ...layers,
        //         config.layers.databaseServiceLayer.lambdaLayerArnOutput
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
        //     policyStatements: tenantUserPoolLambdaExecutionPolicyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [
        //         ...dependsOn,
        //         config.auth.pooledTenantUserPool,
        //         config.database.tenantUserMappingTable,
        //         config.layers.databaseServiceLayer
        //     ]
        // });
        // const disableUsersByTenantUserLambda = new Lambda(this, 'disable_users_by_tenant_user_lambda', {
        //     functionName: `saas-disable-users-by-tenant-lambda_${config.variable.environment.value}`,
        //     description: 'saas Disable Users By Tenant Lambda',
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     localExistingPackage: new TerraformAsset(this, 'disable_users_by_tenant_user_lambda_asset', {
        //         path: path.resolve(__dirname, 'user-management/disable-users-by-tenant/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables: {
        //         ...environmentVariables,
        //         TENANT_USER_POOL_ID: config.auth.pooledTenantUserPool.id,
        //         TENANT_USER_MAPPING_TABLE_NAME: config.database.tenantUserMappingTable.dynamodbTableIdOutput,
        //         POWERTOOLS_SERVICE_NAME: 'UserManagement.DisableUsersByTenant'
        //     },
        //     layers: [
        //         ...layers,
        //         config.layers.databaseServiceLayer.lambdaLayerArnOutput
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
        //     policyStatements: tenantUserPoolLambdaExecutionPolicyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [
        //         ...dependsOn,
        //         config.auth.pooledTenantUserPool,
        //         config.database.tenantUserMappingTable,
        //         config.layers.databaseServiceLayer
        //     ]
        // });
        // const disableUserLambda = new Lambda(this, 'disable_user_lambda', {
        //     functionName: `saas-disable-user-lambda_${config.variable.environment.value}`,
        //     description: 'saas Disable User Lambda',
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     localExistingPackage: new TerraformAsset(this, 'disable_user_lambda_asset', {
        //         path: path.resolve(__dirname, 'user-management/disable-user/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables: {
        //         ...environmentVariables,
        //         TENANT_USER_POOL_ID: config.auth.pooledTenantUserPool.id,
        //         POWERTOOLS_SERVICE_NAME: 'UserManagement.DisableUser'
        //     },
        //     layers,
        //
        //     rolePath,
        //     policyPath,
        //
        //     attachPolicies: true,
        //     policies,
        //     numberOfPolicies: policies.length,
        //
        //     attachPolicyStatements: true,
        //     policyStatements: tenantUserPoolLambdaExecutionPolicyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [
        //         ...dependsOn,
        //         config.auth.pooledTenantUserPool
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
            'POST /user/tenant-admin': {
                description: 'Creates a tenant admin user',
                lambda_arn: createTenantAdminUserLambda.lambdaFunctionArnOutput,
                ...iamIntegrations
            },
            'POST /user': {
                description: 'Create a user by a user id',
                lambda_arn: createUserLambda.lambdaFunctionArnOutput,
                ...authorizerIntegrations
            },
            'GET /users': {
                description: 'Get all users by tenantId',
                lambda_arn: getUsersLambda.lambdaFunctionArnOutput,
                ...authorizerIntegrations
            },
            // 'GET /user/{username}': {
            //     description: 'Return a user by a user id',
            //     lambda_arn: getUserLambda.lambdaFunctionArnOutput,
            //     integration_type: 'AWS_PROXY',
            //     payload_format_version: '2.0',
            //     authorizer_key: 'lambda',
            //     authorization_type: 'CUSTOM'
            // },
            // 'PUT /user/{username}': {
            //     lambda_arn: updateUserLambda.lambdaFunctionArnOutput,
            //     integration_type: 'AWS_PROXY',
            //     payload_format_version: '2.0',
            //     authorizer_key: 'lambda',
            //     authorization_type: 'CUSTOM'
            // },
            // 'PUT /users/enable/{tenantid}': {
            //     description: 'Enable users by tenant id',
            //     lambda_arn: enableUsersByTenantUserLambda.lambdaFunctionArnOutput,
            //     integration_type: 'AWS_PROXY',
            //     payload_format_version: '2.0',
            //     authorization_type: 'AWS_IAM'
            // },
            // 'PUT /users/disable/{tenantid}': {
            //     description: 'Disable users by tenant id',
            //     lambda_arn: disableUsersByTenantUserLambda.lambdaFunctionArnOutput,
            //     integration_type: 'AWS_PROXY',
            //     payload_format_version: '2.0',
            //     authorization_type: 'AWS_IAM'
            // },
            // 'DELETE /user/{username}': {
            //     description: 'Disable a user by a user id',
            //     lambda_arn: disableUserLambda.lambdaFunctionArnOutput,
            //     integration_type: 'AWS_PROXY',
            //     payload_format_version: '2.0',
            //     authorizer_key: 'lambda',
            //     authorization_type: 'CUSTOM'
            // }
        };

        this.createTenantAdminUserLambda = createTenantAdminUserLambda;
        this.createUserLambda = createUserLambda;

        this.getUsersLambda = getUsersLambda;
        // this.getUserLambda = getUserLambda;
        // this.updateUserLambda = updateUserLambda;
        // this.enableUsersByTenantUserLambda = enableUsersByTenantUserLambda;
        // this.disableUsersByTenantUserLambda = disableUsersByTenantUserLambda;
        // this.disableUserLambda = disableUserLambda;

        this.integrations = integrations;
    }
}