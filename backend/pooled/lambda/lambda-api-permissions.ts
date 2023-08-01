import {Construct} from "constructs";
import {Fn} from "cdktf";
import * as core from "@core/index";
import * as awsProvider from "@providers/aws";

import {PooledAuthorizerLambdaConstruct} from "./pooled-authorizer-lambda";
import {ProductLambdaConstruct} from "./product-service-lambda";
import {PooledApiConstruct} from "../api";

type LambdaApiPermissionsConfig = {
    variable: core.VariableResult;
    api: PooledApiConstruct;
    pooledAuthorizerLambda: PooledAuthorizerLambdaConstruct;
    productServiceLambda: ProductLambdaConstruct;
}

export class LambdaApiPermissionsConstruct extends Construct {

    constructor(scope: Construct, id: string, config: LambdaApiPermissionsConfig) {
        super(scope, id);

        const action = 'lambda:InvokeFunction';
        const principal = 'apigateway.amazonaws.com';
        const statementIdPrefix = `${config.api.resource.apigatewayv2ApiIdOutput}-invoke-permissions`;

        // new awsProvider.lambdaPermission.LambdaPermission(this, 'permission', {
        //     count: routeList.length,
        //
        //     functionName: config.tenantManagementLambdaConstruct.getTenantsLambda.lambdaFunctionArnOutput,
        //     sourceArn: `${config.apiConstruct.api.apigatewayv2ApiExecutionArnOutput}/*/${Fn.lookup(Fn.element(routeList, Token.asNumber('count.index')), 'method', '')}${Fn.lookup(Fn.element(routeList, Token.asNumber('count.index')), 'path', '')}`,
        //     statementId: `${statementIdPrefix}-${config.tenantManagementLambdaConstruct.getTenantsLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [config.apiConstruct.api, config.tenantManagementLambdaConstruct.getTenantsLambda]
        // });

        new awsProvider.lambdaPermission.LambdaPermission(this, 'authorizer_permission', {
            functionName: config.pooledAuthorizerLambda.resource.lambdaFunctionNameOutput,
            sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/authorizers/${Fn.lookup(config.api.resource.apigatewayv2AuthorizerIdOutput, "lambda", "")}`,
            statementId: `${statementIdPrefix}-${config.pooledAuthorizerLambda.resource.lambdaFunctionNameOutput}`,
            action,
            principal,

            dependsOn: [
                config.api.resource,
                config.pooledAuthorizerLambda.resource
            ]
        });

        new awsProvider.lambdaPermission.LambdaPermission(this, 'get_products_permission', {
            functionName: config.productServiceLambda.getProductsLambda.lambdaFunctionArnOutput,
            sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/GET/products`,
            statementId: `${statementIdPrefix}-${config.productServiceLambda.getProductsLambda.lambdaFunctionNameOutput}`,
            action,
            principal,

            dependsOn: [
                config.api.resource,
                config.productServiceLambda.getProductsLambda
            ]
        });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'register_tenant_lambda', {
        //     functionName: config.tenantManagementLambda.registerTenantLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/POST/registration`,
        //     statementId: `${statementIdPrefix}-${config.tenantManagementLambda.registerTenantLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.tenantManagementLambda.registerTenantLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'get_tenants_permission', {
        //     functionName: config.tenantManagementLambda.getTenantsLambda.lambdaFunctionArnOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/GET/tenants`,
        //     statementId: `${statementIdPrefix}-${config.tenantManagementLambda.getTenantsLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [config.api.resource, config.tenantManagementLambda.getTenantsLambda]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'get_tenant_lambda', {
        //     functionName: config.tenantManagementLambda.getTenantLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/GET/tenant/*`,
        //     statementId: `${statementIdPrefix}-${config.tenantManagementLambda.getTenantLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.tenantManagementLambda.getTenantLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'update_tenant_lambda', {
        //     functionName: config.tenantManagementLambda.updateTenantLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/PUT/tenant/*`,
        //     statementId: `${statementIdPrefix}-${config.tenantManagementLambda.updateTenantLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.tenantManagementLambda.updateTenantLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'activate_tenant_lambda', {
        //     functionName: config.tenantManagementLambda.activeTenantLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.aapi.resource.apigatewayv2ApiExecutionArnOutput}/*/PUT/tenant/activation/*`,
        //     statementId: `${statementIdPrefix}-${config.tenantManagementLambda.activeTenantLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.tenantManagementLambda.activeTenantLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'deactivate_tenant_lambda', {
        //     functionName: config.tenantManagementLambda.deactivateTenantLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/DELETE/tenant/*`,
        //     statementId: `${statementIdPrefix}-${config.tenantManagementLambda.deactivateTenantLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.tenantManagementLambda.deactivateTenantLambda,
        //         config.api.resource
        //     ]
        // });

        // new awsProvider.lambdaPermission.LambdaPermission(this, 'create_tenant_admin_lambda', {
        //     functionName: config.userManagementLambda.createTenantAdminUserLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/POST/user/tenant-admin`,
        //     statementId: `${statementIdPrefix}-${config.userManagementLambda.createTenantAdminUserLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.userManagementLambda.createTenantAdminUserLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'create_user_lambda', {
        //     functionName: config.userManagementLambda.createUserLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/POST/user`,
        //     statementId: `${statementIdPrefix}-${config.userManagementLambda.createUserLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.userManagementLambda.createUserLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'get_users_lambda', {
        //     functionName: config.userManagementLambda.getUsersLambda.lambdaFunctionArnOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/GET/users`,
        //     statementId: `${statementIdPrefix}-${config.userManagementLambda.getUsersLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.userManagementLambda.getUsersLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'get_user_lambda', {
        //     functionName: config.userManagementLambda.getUserLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/GET/user`,
        //     statementId: `${statementIdPrefix}-${config.userManagementLambda.getUserLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.userManagementLambda.getUserLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'update_user_lambda', {
        //     functionName: config.userManagementLambda.updateUserLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/PUT/*`,
        //     statementId: `${statementIdPrefix}-${config.userManagementLambda.updateUserLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.userManagementLambda.updateUserLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'enable_users_by_tenant_user_lambda', {
        //     functionName: config.userManagementLambda.enableUsersByTenantUserLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/PUT/*`,
        //     statementId: `${statementIdPrefix}-${config.userManagementLambda.enableUsersByTenantUserLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.userManagementLambda.enableUsersByTenantUserLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'disable_users_by_tenant_user_lambda', {
        //     functionName: config.userManagementLambda.disableUsersByTenantUserLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/PUT/*`,
        //     statementId: `${statementIdPrefix}-${config.userManagementLambda.disableUsersByTenantUserLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.userManagementLambda.disableUsersByTenantUserLambda,
        //         config.api.resource
        //     ]
        // });
        // new awsProvider.lambdaPermission.LambdaPermission(this, 'disable_user_lambda', {
        //     functionName: config.userManagementLambda.disableUserLambda.lambdaFunctionNameOutput,
        //     sourceArn: `${config.api.resource.apigatewayv2ApiExecutionArnOutput}/*/DELETE/*`,
        //     statementId: `${statementIdPrefix}-${config.userManagementLambda.disableUserLambda.lambdaFunctionNameOutput}`,
        //     action,
        //     principal,
        //
        //     dependsOn: [
        //         config.userManagementLambda.disableUserLambda,
        //         config.api.resource
        //     ]
        // });
    }
}