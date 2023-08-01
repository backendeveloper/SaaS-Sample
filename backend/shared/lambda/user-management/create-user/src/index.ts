import {
    APIGatewayAuthorizerResultContext,
    APIGatewayProxyEventV2WithLambdaAuthorizer,
    APIGatewayProxyHandlerV2WithLambdaAuthorizer,
    APIGatewayProxyStructuredResultV2
} from "aws-lambda";
import middy from "@middy/core";

import * as Util from '/opt/nodejs/node_modules/util-service';
import * as Auth from "/opt/nodejs/node_modules/auth-service";
import {DatabaseManagement} from "/opt/nodejs/node_modules/database-service";

type CustomAuth = APIGatewayAuthorizerResultContext & Auth.Models.AuthContextResponse;
const loggerService = new Util.Helpers.LoggerService();
const metricService = new Util.Helpers.MetricService();
const traceService = new Util.Helpers.TracerService();

const lambdaHandler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<CustomAuth> = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<CustomAuth>): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT', event);

    const region: string = process.env.AWS_REGION || '';
    const accountId: string = process.env.AWS_ACCESS_KEY_ID || '';
    const userPoolId: string | undefined = process.env.TENANT_USER_POOL_ID;
    const tenantUserMappingTableName: string | undefined = process.env.TENANT_USER_MAPPING_TABLE_NAME;

    const tenantId: string = event.requestContext.authorizer.lambda.tenantId || '';
    const userRole: string = event.requestContext.authorizer.lambda.userRole || '';
    const userDetails: Util.Models.UserDetailsModel = JSON.parse(event.body || '');

    let userTenantId: string;

    const userManagement = new Auth.UserManagement(region);
    traceService.tracer.putAnnotation('TenantId', tenantId);
    loggerService.logWithTenantContext('Request received to create new user', tenantId);

    const userRoles = new Auth.Helpers.UserRoles(region, accountId);
    if (userRoles.isSystemAdmin(userRole))
        userTenantId = userDetails.tenantId;
    else
        userTenantId = tenantId;

    if (userRoles.isTenantAdmin(userRole) || userRoles.isSystemAdmin(userRole)) {
        metricService.recordMetric(tenantId, 'UserCreated', Util.MetricUnits.Count, 1);
        const response = await userManagement.createTenantOrUserAdmin(userDetails.userName, userPoolId, userDetails.userEmail, userDetails.userRole, userTenantId);
        loggerService.logWithTenantContext(JSON.stringify(response), tenantId);

        await userManagement.addUserToGroup(userTenantId, userPoolId, userDetails.userName);

        const databaseManagement = new DatabaseManagement(tenantUserMappingTableName, region);
        await databaseManagement.putItem({
            tenantId: userTenantId,
            userName: userDetails.userName
        });
        loggerService.logWithTenantContext('Request completed to create new user', tenantId);

        return Util.Models.createSuccessResponse('New user created');
    }
    loggerService.logWithTenantContext('Request completed as unauthorized. Only tenant admin or system admin can create user!', tenantId);

    return Util.Models.createUnauthorizedResponse();
};

const handler = middy(lambdaHandler)
    .use(Util.captureLambdaHandler(traceService.tracer))
    .use(Util.logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(Util.injectLambdaContext(loggerService.logger));

export {handler};