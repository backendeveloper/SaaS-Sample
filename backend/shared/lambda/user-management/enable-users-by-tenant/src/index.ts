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
import {UserManagement, UserRoles,} from "/opt/nodejs/node_modules/auth-service";
import {DatabaseManagement} from "/opt/nodejs/node_modules/database-service";

const loggerService = new LoggerService();
const metricService = new MetricService();
const traceService = new TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT: ', {details: {event, context}});
    loggerService.info('Request received to enable users by tenant');

    const region: string = process.env.AWS_REGION || '';
    const accountId: string = process.env.AWS_ACCESS_KEY_ID || '';
    const userPoolId: string | undefined = process.env.TENANT_USER_POOL_ID;
    const tenantUserMappingTableName: string | undefined = process.env.TENANT_USER_MAPPING_TABLE_NAME;
    const tenantIdToUpdate = ''; // TODO: Buraya bakilacak
    const userRole = ''; // TODO: Buraya bakilacak

    traceService.tracer.putAnnotation('TenantId', tenantIdToUpdate);

    const userRoles = new UserRoles(region, accountId);
    const userManagement = new UserManagement();

    if (userRoles.isSystemAdmin(userRole)) {
        const databaseManagement = new DatabaseManagement(tenantUserMappingTableName, region);
        const response: any = await databaseManagement.query(`tenantId = ${tenantIdToUpdate}`);
        const users: any = response.Items || '';

        for (const user of users) {
            const response = await userManagement.adminDisableUser(userPoolId, user.userName);
            loggerService.info(JSON.stringify(response));
        }

        loggerService.info('Request completed to enable users');

        return createSuccessResponse('Users enables');
    } else {
        loggerService.info('Request completed as unauthorized. Only tenant admin or system admin can update!');

        return createUnauthorizedResponse();
    }
};

const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(traceService.tracer))
    .use(logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(injectLambdaContext(loggerService.logger));

export {handler};