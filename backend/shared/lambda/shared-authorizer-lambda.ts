import {Construct} from "constructs";
import {AssetType, TerraformAsset} from "cdktf";
import * as path from 'path';
import * as core from "@core/index";
import {Lambda} from "@modules/lambda";

import {LayerConstruct} from "../../layer/layer";
import {AuthConstruct} from "../../auth";
import {AccessRoleConstruct} from "../../access-role";
import {DatabaseConstruct} from "../../database";

type SharedAuthorizerLambdaConfig = {
    variable: core.VariableResult;
    layers: LayerConstruct;
    auth: AuthConstruct;
    database: DatabaseConstruct;
    accessRole: AccessRoleConstruct;
}

export class SharedAuthorizerLambdaConstruct extends Construct {
    public readonly resource: Lambda;

    constructor(scope: Construct, id: string, config: SharedAuthorizerLambdaConfig) {
        super(scope, id);

        const dependsOn = [
            config.variable.region,
            config.variable.environment,
            config.variable.accountId
        ];

        this.resource = new Lambda(this, 'lambda', {
            functionName: `saas-shared-authorizer-lambda_${config.variable.environment.value}`,
            description: `saas Shared Authorizer Lambda - ${config.variable.environment.value}`,
            handler: 'index.handler',
            runtime: 'nodejs18.x',
            publish: true,
            createRole: false,
            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'lambda_asset', {
                path: path.resolve(__dirname, 'shared-authorizer/dist'),
                type: AssetType.ARCHIVE
            }).path,
            tracingMode: 'Active',
            timeout: 29,
            memorySize: 256,
            environmentVariables: {
                AWS_ACCOUNT_ID: config.variable.accountId.value,
                LOG_LEVEL: 'DEBUG',
                POWERTOOLS_METRICS_NAMESPACE: 'ServerlessSaaS',
                POWERTOOLS_SERVICE_NAME: 'N/A',

                TENANT_USER_POOL: config.auth.pooledTenantUserPool.id,
                TENANT_APP_CLIENT: config.auth.pooledTenantUserPoolClient.id,
                OPERATION_USERS_USER_POOL: config.auth.operationUsersUserPool.id,
                OPERATION_USERS_APP_CLIENT: config.auth.operationUsersUserPoolClient.id,
                AUTHORIZER_ACCESS_ROLE_ARN: config.accessRole.authorizerLambdaAccessRole.arn,

                TENANT_USER_MAPPING_TABLE_ARN: config.database.tenantUserMappingTable.dynamodbTableArnOutput,
                TENANT_USER_DETAILS_TABLE_ARN: config.database.tenantDetailsTable.dynamodbTableArnOutput,
                PRODUCT_TABLE_ARN: config.database.productTable.dynamodbTableArnOutput,
                ORDER_TABLE_ARN: config.database.orderTable.dynamodbTableArnOutput
            },
            layers: [
                config.variable.layerInsightsExtensionArn.value,
                config.layers.authServiceLayer.lambdaLayerArnOutput,
                config.layers.utilServiceLayer.lambdaLayerArnOutput
            ],

            lambdaRole: config.accessRole.authorizerLambdaExecutionRole.arn,
            cloudwatchLogsRetentionInDays: 7,

            dependsOn: [
                ...dependsOn,
                config.accessRole.authorizerLambdaExecutionRole,
                config.accessRole.authorizerLambdaAccessRole,

                config.layers.utilServiceLayer,
                config.layers.authServiceLayer,
                config.variable.layerInsightsExtensionArn,

                config.auth.pooledTenantUserPool,
                config.auth.pooledTenantUserPoolClient,
                config.auth.operationUsersUserPool,
                config.auth.operationUsersUserPoolClient,

                config.database.tenantUserMappingTable,
                config.database.tenantDetailsTable,
                config.database.productTable,
                config.database.orderTable
            ]
        });
    }
}