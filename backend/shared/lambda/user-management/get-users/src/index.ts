import {
    APIGatewayAuthorizerResultContext,
    APIGatewayProxyHandlerV2WithLambdaAuthorizer,
    APIGatewayProxyStructuredResultV2,
    APIGatewayProxyEventV2WithLambdaAuthorizer
} from "aws-lambda";
import middy from "@middy/core";

import * as Util from '/opt/nodejs/node_modules/util-service';
import * as Auth from "/opt/nodejs/node_modules/auth-service";

type CustomAuth = APIGatewayAuthorizerResultContext & Auth.Models.AuthContextResponse;
const loggerService = new Util.Helpers.LoggerService();
const metricService = new Util.Helpers.MetricService();
const traceService = new Util.Helpers.TracerService();

const lambdaHandler: APIGatewayProxyHandlerV2WithLambdaAuthorizer<CustomAuth> = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<CustomAuth>): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT', event);

    const region: string | undefined = process.env.AWS_REGION;
    const accountId: string | undefined = process.env.AWS_ACCESS_KEY_ID;
    const userPoolId: string | undefined = process.env.TENANT_USER_POOL_ID;
    const tenantId: string | undefined = event.requestContext.authorizer.lambda.tenantId;
    const userRole: string | undefined = event.requestContext.authorizer.lambda.userRole;
    const users: Auth.UserType[] = [];

    if (tenantId == null || userRole == null)
        return Util.Models.createUnauthorizedResponse();

    traceService.tracer.putAnnotation('TenantId', tenantId);
    loggerService.logWithTenantContext('Request received to get users', tenantId);

    const userRoles: Auth.Helpers.UserRoles = new Auth.Helpers.UserRoles(region, accountId);
    const userManagement: Auth.UserManagement = new Auth.UserManagement(region);

    if (userRoles.isTenantAdmin(userRole) || userRoles.isSystemAdmin(userRole)) {
        const response = await userManagement.listUsers(userPoolId);

        loggerService.logWithTenantContext(JSON.stringify(response), tenantId);

        const userList: Auth.UserType[] = response.Users || [];
        const numOfUsers: number | undefined = userList?.length || 0;
        metricService.recordMetric(tenantId, 'Number of users', Util.MetricUnits.Count, numOfUsers);

        if (numOfUsers > 0) {
            userList.forEach((user: Auth.UserType) => {
                let isSameTenantUser = false;
                const userInfo = new Auth.UserInfo();
                user.Attributes?.forEach((attr: Auth.AttributeType) => {
                    if (attr.Name == 'custom:tenantId' && attr.Value == tenantId) {
                        isSameTenantUser = true;
                        userInfo.tenantId = attr.Value;
                    }

                    if (attr.Name == 'custom:userRole')
                        userInfo.userRole = attr.Value;

                    if (attr.Name == 'email')
                        userInfo.email = attr.Value;

                    if (isSameTenantUser)
                        users.push(user);
                });
            });
        }

        return Util.Models.generateResponse(users);
    }
    loggerService.logWithTenantContext('Request completed as unauthorized.', tenantId);

    return Util.Models.createUnauthorizedResponse();
};

const handler = middy(lambdaHandler)
    .use(Util.captureLambdaHandler(traceService.tracer))
    .use(Util.logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(Util.injectLambdaContext(loggerService.logger));

export {handler};