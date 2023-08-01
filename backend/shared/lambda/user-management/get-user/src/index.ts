import {APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context} from "aws-lambda";
import middy from "@middy/core";

import {
    captureLambdaHandler,
    createSuccessResponse,
    createUnauthorizedResponse,
    injectLambdaContext,
    LoggerService,
    logMetrics,
    MetricService,
    TracerService
} from '/opt/nodejs/node_modules/util-service';
import {UserInfo, UserRoles} from "/opt/nodejs/node_modules/auth-service";

const loggerService = new LoggerService();
const metricService = new MetricService();
const traceService = new TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT: ', {details: {event, context}});

    const region: string = process.env.AWS_REGION || '';
    const accountId: string = process.env.AWS_ACCESS_KEY_ID || '';
    const userPoolId: string | undefined = process.env.TENANT_USER_POOL_ID;
    const requestingUserName = ''; // TODO: Buraya bakilacak
    const tenantId = ''; // TODO: Buraya bakilacak
    const userRole = ''; // TODO: Buraya bakilacak
    const userName: string | undefined = event.pathParameters?.username; // TODO: Buraya bakilacak

    traceService.tracer.putAnnotation('TenantId', tenantId);
    loggerService.logWithTenantContext('Request received to get user', tenantId);

    const userRoles = new UserRoles(region, accountId);
    if (userRoles.isTenantUser(userRole) || userName == requestingUserName) {
        loggerService.logWithTenantContext('Request completed as unauthorized. User can only get its information.', tenantId);

        return createUnauthorizedResponse();
    }
    else {
        let userInfo = new UserInfo();
        userInfo = await userInfo.getUserInfo(metricService, loggerService, tenantId, userPoolId, userName);
        if (!userRoles.isSystemAdmin(userRole) && userInfo.tenantId != tenantId) {
            loggerService.logWithTenantContext('Request completed as unauthorized. Users in other tenants cannot be accessed', tenantId);

            return createUnauthorizedResponse();
        }
        else {
            loggerService.logWithTenantContext('Request completed to get new user', tenantId);

            return createSuccessResponse(userInfo);
        }
    }
};

const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(traceService.tracer))
    .use(logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(injectLambdaContext(loggerService.logger));

export {handler};