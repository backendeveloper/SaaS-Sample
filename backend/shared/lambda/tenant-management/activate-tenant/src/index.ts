import {APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context} from "aws-lambda";
import middy from "@middy/core";

import {
    LoggerService,
    injectLambdaContext,
    MetricService,
    TracerService,
    logMetrics,
    captureLambdaHandler,
    createSuccessResponse,
    createUnauthorizedResponse,
    InvokeManagement
} from '/opt/nodejs/node_modules/util-service';
import {
    UserRoles
} from '/opt/nodejs/node_modules/auth-service';
import {
    DatabaseManagement
} from '/opt/nodejs/node_modules/database-service';

const loggerService = new LoggerService();
const metricService = new MetricService();
const traceService = new TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT: ', {details: {event, context}});

    const region: string = process.env.AWS_REGION || '';
    const accountId: string = process.env.AWS_ACCESS_KEY_ID || '';
    const tenantUserDetailTableName: string | undefined = process.env.TENANT_USER_DETAIL_TABLE_NAME;
    // const urlDisableUsers: string | undefined = process.env.DISABLE_USERS_BY_TENANT;
    const enableLambdaName: string | undefined = process.env.ENABLE_LAMBDA_NAME;

    // const stageName = event.requestContext.stage; // TODO: Buraya bakilacak
    // const host = event.headers.host; // TODO: Buraya bakilacak
    // auth = utils.get_auth(host, region)
    // headers = utils.get_headers(event)

    const requestingTenantId = ''; // TODO: Buraya bakilacak
    const userRole = ''; // TODO: Buraya bakilacak
    const tenantId: string = event.pathParameters?.tenantId || '';

    traceService.tracer.putAnnotation('TenantId', tenantId);
    loggerService.logWithTenantContext('Request received to activate tenant', tenantId);

    const userRoles = new UserRoles(region, accountId);
    if ((userRoles.isTenantAdmin(userRole) && tenantId == requestingTenantId) || userRoles.isSystemAdmin(userRole)) {
        const databaseManagement = new DatabaseManagement(tenantUserDetailTableName, region);
        const responseUpdate = await databaseManagement.updateItem(
            {tenantId},
            'set isActive = :isActive',
            {
                ':isActive': true
            },
            'ALL_NEW'
        );

        loggerService.logWithTenantContext(JSON.stringify(responseUpdate), tenantId);

        const updateDetails = {
            tenantId,
            requestingTenantId,
            userRole
        };
        const errorMessage = 'Error occurred while enabling users for the tenant';
        const successMessage = 'Success invoking enable users';

        const invokeManagement = new InvokeManagement();
        const updateUserResponse = await invokeManagement.invoke(enableLambdaName, updateDetails, loggerService, errorMessage, successMessage);

        loggerService.logWithTenantContext(JSON.stringify(updateUserResponse), tenantId);
        loggerService.logWithTenantContext('Request completed to activate tenant', tenantId);

        return createSuccessResponse('Tenant Activated');
    } else {
        loggerService.logWithTenantContext('Request completed as unauthorized. Only tenant admin or system admin can activate tenant!', tenantId);

        return createUnauthorizedResponse();
    }
};

const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(traceService.tracer))
    .use(logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(injectLambdaContext(loggerService.logger));

export {handler};