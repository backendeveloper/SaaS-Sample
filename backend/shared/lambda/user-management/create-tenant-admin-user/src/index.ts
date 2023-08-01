import {APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2} from "aws-lambda";
import middy from "@middy/core";

import * as Util from '/opt/nodejs/node_modules/util-service';
import * as Auth from "/opt/nodejs/node_modules/auth-service";
import {DatabaseManagement} from "/opt/nodejs/node_modules/database-service";

const loggerService = new Util.Helpers.LoggerService();
const metricService = new Util.Helpers.MetricService();
const traceService = new Util.Helpers.TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT', event);

    const region: string = process.env.AWS_REGION || '';
    let appClientId: string | undefined = process.env.TENANT_APP_CLIENT_ID;
    let userPoolId: string | undefined = process.env.TENANT_USER_POOL_ID;
    const tenantUserPoolCallbackUrl: string | undefined = process.env.TENANT_USER_POOL_CALLBACK_URL || '';
    const tenantUserMappingTableName: string | undefined = process.env.TENANT_USER_MAPPING_TABLE_NAME;

    const tenantDetails: Util.Models.TenantDetailModel = JSON.parse(event.body || '');
    const tenantId: string = tenantDetails.tenantId;
    const tenantEmail: string = tenantDetails.tenantEmail;
    loggerService.info('Tenant Details', tenantDetails);

    const userManagement = new Auth.UserManagement(region);
    if (tenantDetails.dedicatedTenancy == 'true') {
        const userPoolResponse = await userManagement.createUserPool(tenantId, tenantUserPoolCallbackUrl);
        const userPoolId = userPoolResponse.UserPool?.Id
        loggerService.info('User Pool Id', userPoolId);

        const appClientResponse = await userManagement.createUserPoolClient(tenantUserPoolCallbackUrl, userPoolId);
        loggerService.info('App Client Id', appClientResponse);

        appClientId = appClientResponse.UserPoolClient?.ClientId;
        await userManagement.createUserPoolDomain(tenantId, userPoolId);

        loggerService.info('New Tenant Created');
    }

    const tenantAdminUserName = `tenant-admin-${tenantId}`;

    const tenantUserGroupResponse = await userManagement.createUserGroup(tenantId, userPoolId, `User group for tenant ${tenantId}`);
    await userManagement.createTenantOrUserAdmin(tenantAdminUserName, userPoolId, tenantEmail, Auth.Types.UserRoleType.TENANT_ADMIN, tenantId);
    await userManagement.addUserToGroup(tenantUserGroupResponse.Group?.GroupName, userPoolId, tenantAdminUserName);

    const databaseManagement = new DatabaseManagement(tenantUserMappingTableName, region);
    await databaseManagement.putItem({
        tenantId,
        userName: tenantAdminUserName
    });

    loggerService.info('Create Success Response', {userPoolId, appClientId, tenantAdminUserName});

    return Util.Models.createSuccessResponse({
        userPoolId,
        appClientId,
        tenantAdminUserName
    });
};

const handler = middy(lambdaHandler)
    .use(Util.captureLambdaHandler(traceService.tracer))
    .use(Util.logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(Util.injectLambdaContext(loggerService.logger));

export {handler};