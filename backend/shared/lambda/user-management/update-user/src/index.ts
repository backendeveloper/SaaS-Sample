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
    MetricUnits,
    TracerService
} from '/opt/nodejs/node_modules/util-service';
import {UserInfo, UserManagement, UserRoles} from "/opt/nodejs/node_modules/auth-service";

const loggerService = new LoggerService();
const metricService = new MetricService();
const traceService = new TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT: ', {details: {event, context}});

    const region: string = process.env.AWS_REGION || '';
    const accountId: string = process.env.AWS_ACCESS_KEY_ID || '';
    const userPoolId: string | undefined = process.env.TENANT_USER_POOL_ID;
    const tenantId = ''; // TODO: Buraya bakilacak
    const userRole = ''; // TODO: Buraya bakilacak
    const userName: string | undefined = event.pathParameters?.username; // TODO: Buraya bakilacak
    const userDetails: any = JSON.parse(event.body || ''); // TODO: Buraya bakilacak

    traceService.tracer.putAnnotation('TenantId', tenantId);
    loggerService.logWithTenantContext('Request received to update user', tenantId);

    const userRoles = new UserRoles(region, accountId);
    if (userRoles.isTenantUser(userRole)) {
        loggerService.logWithTenantContext('Request completed as unauthorized. Only tenant admin or system admin can update user!', tenantId);

        return createUnauthorizedResponse();
    } else {
        let userInfo = new UserInfo();
        userInfo = await userInfo.getUserInfo(metricService, loggerService, tenantId, userPoolId, userName);

        if (!userRoles.isSystemAdmin(userRole) && userInfo.tenantId != tenantId) {
            loggerService.logWithTenantContext('Request completed as unauthorized. Users in other tenants cannot be accessed', tenantId);

            return createUnauthorizedResponse();
        } else {
            metricService.recordMetric(tenantId, 'UserUpdated', MetricUnits.Count, 1);
            const userManagement = new UserManagement();
            const response = await userManagement.adminUpdateUserAttributes(userPoolId, userName, [
                {
                    Name: 'email',
                    Value: userDetails.userEmail
                },
                {
                    Name: 'custom:userRole',
                    Value: userDetails.userRole
                }
            ])

            loggerService.logWithTenantContext(JSON.stringify(response), tenantId);
            loggerService.logWithTenantContext('Request completed to update user', tenantId);

            return createSuccessResponse('user updated');
        }
    }
};

const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(traceService.tracer))
    .use(logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(injectLambdaContext(loggerService.logger));

export {handler};