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
    DatabaseManagement
} from '/opt/nodejs/node_modules/database-service';
import {
    UserRoles
} from '/opt/nodejs/node_modules/auth-service';

const loggerService = new LoggerService();
const metricService = new MetricService();
const traceService = new TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT: ', {details: {event, context}});

    const region: string = process.env.AWS_REGION || '';
    const accountId: string = process.env.AWS_ACCESS_KEY_ID || '';
    const tenantUserDetailTableName: string | undefined = process.env.TENANT_USER_DETAIL_TABLE_NAME;
    const requestingTenantId = ''; // TODO: Buraya bakilacak
    const userRole = ''; // TODO: Buraya bakilacak
    const tenantId: string = event.pathParameters?.tenantId || '';
    const tenantDetails: any = JSON.parse(event.body || '');

    traceService.tracer.putAnnotation('TenantId', tenantId);
    loggerService.logWithTenantContext('Request received to update tenant', tenantId);

    const userRoles = new UserRoles(region, accountId);
    if ((userRoles.isTenantAdmin(userRole) && tenantId == requestingTenantId) || userRoles.isSystemAdmin(userRole)) {
        const databaseManagement = new DatabaseManagement(tenantUserDetailTableName, region);
        const responseUpdate = await databaseManagement.updateItem(
            {tenantId},
            'set tenantName = :tenantName, tenantAddress = :tenantAddress, tenantEmail = :tenantEmail, tenantPhone = :tenantPhone, tenantTier = :tenantTier',
            {
                ':tenantName': tenantDetails.tenantName,
                ':tenantAddress': tenantDetails.tenantAddress,
                ':tenantEmail': tenantDetails.tenantEmail,
                ':tenantPhone': tenantDetails.tenantPhone,
                ':tenantTier': tenantDetails.tenantTier
            },
            'UPDATED_NEW');

        loggerService.logWithTenantContext(JSON.stringify(responseUpdate), tenantId);
        loggerService.logWithTenantContext('Request completed to update tenant', tenantId);

        return createSuccessResponse('Tenant Updated');
    } else {
        loggerService.logWithTenantContext('Request completed as unauthorized. Only tenant admin or system admin can update tenant!', tenantId);

        return createUnauthorizedResponse();
    }
};

const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(traceService.tracer))
    .use(logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(injectLambdaContext(loggerService.logger));

export {handler};