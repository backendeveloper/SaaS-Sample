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
    createUnauthorizedResponse
} from '/opt/nodejs/node_modules/util-service';
import {
    UserRoles,
    TenantInfo
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
    const accountId: string = event.requestContext.accountId;
    const tenantUserDetailTableName: string | undefined = process.env.TENANT_DETAIL_TABLE_NAME;
    const requestingTenantId = ''; // TODO: Buraya bakilacak
    const userRole = ''; // TODO: Buraya bakilacak
    const tenantId: string = event.pathParameters?.tenantId || '';
    let tenantInfo = null;

    traceService.tracer.putAnnotation('TenantId', tenantId);
    loggerService.logWithTenantContext('Request received to get tenant details', tenantId);

    const userRoles = new UserRoles(region, accountId);
    if ((userRoles.isTenantAdmin(userRole) && tenantId == requestingTenantId) || userRoles.isSystemAdmin(userRole)) {
        const databaseManagement = new DatabaseManagement(tenantUserDetailTableName, region);
        const item = await databaseManagement.getItem({
            tenantId
        }, [
            'tenantName',
            'tenantAddress',
            'tenantEmail',
            'tenantPhone'
        ]);
        if (item !== null) {
            tenantInfo = new TenantInfo(item.items.tenantName, item.items.tenantAddress, item.items.tenantEmail, item.items.tenantPhone);
        }

        loggerService.logWithTenantContext(JSON.stringify(tenantInfo), tenantId);
        loggerService.logWithTenantContext('Request completed to get tenant details', tenantId);

        return createSuccessResponse(tenantInfo);
    } else {
        loggerService.logWithTenantContext('Request completed as unauthorized. Only tenant admin or system admin can deactivate tenant!', tenantId);

        return createUnauthorizedResponse();
    }
};

const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(traceService.tracer))
    .use(logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(injectLambdaContext(loggerService.logger));

export {handler};