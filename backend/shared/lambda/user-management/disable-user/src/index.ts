import {APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2} from "aws-lambda";
import middy from "@middy/core";

import * as Util from '/opt/nodejs/node_modules/util-service';
import * as Auth from "/opt/nodejs/node_modules/auth-service";

const loggerService = new Util.Helpers.LoggerService();
const metricService = new Util.Helpers.MetricService();
const traceService = new Util.Helpers.TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT', event);

    const region: string = process.env.AWS_REGION || '';
    const accountId: string = process.env.AWS_ACCESS_KEY_ID || '';
    const userPoolId: string | undefined = process.env.TENANT_USER_POOL_ID;
    const tenantId = ''; // TODO: Buraya bakilacak
    const userRole = ''; // TODO: Buraya bakilacak
    const userName: string | undefined = event.pathParameters?.username; // TODO: Buraya bakilacak

    traceService.tracer.putAnnotation('TenantId', tenantId);
    loggerService.logWithTenantContext('Request received to disable new user', tenantId);

    const userRoles = new Auth.Helpers.UserRoles(region, accountId);
    if (userRoles.isTenantAdmin(userRole) || userRoles.isSystemAdmin(userRole)) {
        let userInfo = new Auth.UserInfo();
        userInfo = await userInfo.getUserInfo(metricService, loggerService, tenantId, userPoolId, userName);

        if (!userRoles.isTenantAdmin(userRole) && userInfo.tenantId != tenantId) {
            loggerService.logWithTenantContext('Request completed as unauthorized. Users in other tenants cannot be accessed', tenantId);

            return Util.Models.createUnauthorizedResponse();
        }
        else {
            metricService.recordMetric(tenantId, 'UserDisabled', Util.MetricUnits.Count, 1);
            const userManagement = new Auth.UserManagement();
            const response = await userManagement.adminDisableUser(userPoolId, userName);

            loggerService.logWithTenantContext(JSON.stringify(response), tenantId);
            loggerService.logWithTenantContext('Request completed to disable new user', tenantId);

            return Util.Models.createSuccessResponse('user disabled');
        }
    }
    else {
        loggerService.logWithTenantContext('Request completed as unauthorized. Only tenant admin or system admin can disable user!', tenantId);

        return Util.Models.createUnauthorizedResponse();
    }
};

const handler = middy(lambdaHandler)
    .use(Util.captureLambdaHandler(traceService.tracer))
    .use(Util.logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(Util.injectLambdaContext(loggerService.logger));

export {handler};