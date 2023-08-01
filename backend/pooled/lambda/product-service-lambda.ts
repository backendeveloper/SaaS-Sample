import {Construct} from "constructs";
import {AssetType, TerraformAsset} from "cdktf";
import * as path from 'path';
import {Lambda} from "@modules/lambda";
import * as core from "@core/index";

import {LayerConstruct} from "../../layer/layer";
import {DatabaseConstruct} from "../../database";

type ProductLambdaConfig = {
    variable: core.VariableResult;
    database: DatabaseConstruct;
    layers: LayerConstruct;
}

export class ProductLambdaConstruct extends Construct {
    // public readonly getProductLambda: Lambda;
    public readonly getProductsLambda: Lambda;
    // public readonly createProductLambda: Lambda;
    // public readonly updateProductLambda: Lambda;
    // public readonly deleteProductLambda: Lambda;
    public readonly integrations: { [key: string]: any };

    constructor(scope: Construct, id: string, config: ProductLambdaConfig) {
        super(scope, id);

        const rolePath = '/product-service/';
        const policyPath = '/product-service/';
        const policies = [
            'arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy',
            'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
            'arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess'
        ];
        const policyStatements = {
            dynamodb: {
                effect: 'Allow',
                actions: [
                    'dynamodb:GetItem',
                    'dynamodb:UpdateItem',
                    'dynamodb:PutItem',
                    'dynamodb:DeleteItem',
                    'dynamodb:Query'
                ],
                resources: [config.database.productTable.dynamodbTableArnOutput]
            }
        };
        const dependsOn = [
            config.variable.environment,
            config.variable.accountId,
            config.variable.region,

            config.layers.utilServiceLayer,
            config.layers.databaseServiceLayer,
            config.variable.layerInsightsExtensionArn,
            config.database.productTable
        ];
        const environmentVariables = {
            AWS_ACCOUNT_ID: config.variable.accountId.value,
            POWERTOOLS_SERVICE_NAME: 'ProductService',
            PRODUCT_TABLE_NAME: config.database.productTable.dynamodbTableIdOutput,
            LOG_LEVEL: 'DEBUG',
            POWERTOOLS_METRICS_NAMESPACE: 'ServerlessSaaS'
        };
        const layers = [
            config.variable.layerInsightsExtensionArn.value,
            config.layers.utilServiceLayer.lambdaLayerArnOutput,
            config.layers.databaseServiceLayer.lambdaLayerArnOutput
        ];
        const baseIntegrations = {
            integration_type: 'AWS_PROXY',
            payload_format_version: '2.0',
            authorizer_key: 'lambda',
            authorization_type: 'CUSTOM'
        };

        // const getProductLambda = new Lambda(this, 'get_product_lambda', {
        //     functionName: `saas-get-product-lambda_${config.variable.environment.value}`,
        //     description: `saas Get Product Lambda - ${config.variable.environment.value}`,
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //     createPackage: false,
        //     ignoreSourceCodeHash: true,
        //     localExistingPackage: new TerraformAsset(this, 'get_product_lambda_asset', {
        //         path: path.resolve(__dirname, 'product-service/get-product/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables,
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
        //     policyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [...dependsOn]
        // });
        const getProductsLambda = new Lambda(this, 'get_products_lambda', {
            functionName: `saas-get-products-lambda_${config.variable.environment.value}`,
            description: `saas Get Products Lambda - ${config.variable.environment.value}`,
            handler: 'index.handler',
            runtime: 'nodejs18.x',
            publish: true,
            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'get_products_lambda_asset', {
                path: path.resolve(__dirname, 'product-service/get-products/dist'),
                type: AssetType.ARCHIVE
            }).path,
            tracingMode: 'Active',
            timeout: 29,
            environmentVariables,
            layers,

            rolePath,
            policyPath,

            attachPolicies: true,
            policies,
            numberOfPolicies: policies.length,

            attachPolicyStatements: true,
            policyStatements,
            cloudwatchLogsRetentionInDays: 7,

            dependsOn: [...dependsOn]
        });
        // const createProductLambda = new Lambda(this, 'create_product_lambda', {
        //     functionName: `saas-create-product-lambda_${config.variable.environment.value}`,
        //     description: `saas Create Product Lambda - ${config.variable.environment.value}`,
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //
        //     createPackage: false,
        //     ignoreSourceCodeHash: true,
        //     localExistingPackage: new TerraformAsset(this, 'create_product_lambda_asset', {
        //         path: path.resolve(__dirname, 'product-service/create-product/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables,
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
        //     policyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [...dependsOn]
        // });
        // const updateProductLambda = new Lambda(this, 'update_product_lambda', {
        //     functionName: `saas-update-product-lambda_${config.variable.environment.value}`,
        //     description: `saas Update Product Lambda - ${config.variable.environment.value}`,
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //
        //     createPackage: false,
        //     ignoreSourceCodeHash: true,
        //     localExistingPackage: new TerraformAsset(this, 'update_product_lambda_asset', {
        //         path: path.resolve(__dirname, 'product-service/update-product/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables,
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
        //     policyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [...dependsOn]
        // });
        // const deleteProductLambda = new Lambda(this, 'delete_product_lambda', {
        //     functionName: `saas-delete-product-lambda_${config.variable.environment.value}`,
        //     description: `saas Delete Product Lambda - ${config.variable.environment.value}`,
        //     handler: 'index.handler',
        //     runtime: 'nodejs18.x',
        //     publish: true,
        //
        //     createPackage: false,
        //     ignoreSourceCodeHash: true,
        //     localExistingPackage: new TerraformAsset(this, 'delete_product_lambda_asset', {
        //         path: path.resolve(__dirname, 'product-service/delete-product/dist'),
        //         type: AssetType.ARCHIVE
        //     }).path,
        //     tracingMode: 'Active',
        //     timeout: 29,
        //     environmentVariables,
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
        //     policyStatements,
        //     cloudwatchLogsRetentionInDays: 7,
        //
        //     dependsOn: [...dependsOn]
        // });

        const integrations = {
            'GET /products': {
                description: 'Returns all products',
                lambda_arn: getProductsLambda.lambdaFunctionArnOutput,
                ...baseIntegrations
            },
            // 'GET /product/{id}': {
            //     description: 'Return a product by a product id',
            //     lambda_arn: getProductLambda.lambdaFunctionArnOutput,
            //     ...baseIntegrations
            // },
            // 'PUT /product/{id}': {
            //     description: 'Update a product by a product id',
            //     lambda_arn: updateProductLambda.lambdaFunctionArnOutput,
            //     ...baseIntegrations
            // },
            // 'DELETE /product/{id}': {
            //     description: 'Deletes a product by a product id',
            //     lambda_arn: deleteProductLambda.lambdaFunctionArnOutput,
            //     ...baseIntegrations
            // },
            // 'POST /product': {
            //     description: 'Create a product by a product id',
            //     lambda_arn: createProductLambda.lambdaFunctionArnOutput,
            //     ...baseIntegrations
            // }
        };

        // this.getProductLambda = getProductLambda;
        this.getProductsLambda = getProductsLambda;
        // this.createProductLambda = createProductLambda;
        // this.updateProductLambda = updateProductLambda;
        // this.deleteProductLambda = deleteProductLambda;
        this.integrations = integrations;
    }
}