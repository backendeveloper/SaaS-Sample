import {APIGatewayProxyStructuredResultV2, APIGatewayProxyEventV2} from "aws-lambda";
import middy from '@middy/core';
import {randomUUID} from 'crypto';
import * as Util from '/opt/nodejs/node_modules/util-service';
import * as Auth from '/opt/nodejs/node_modules/auth-service';

const loggerService = new Util.Helpers.LoggerService();
const metricService = new Util.Helpers.MetricService();
const traceService = new Util.Helpers.TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT', event);

    try {
        const region: string | undefined = process.env.AWS_REGION;
        const sharedApiDomainName: string | undefined = process.env.SHARED_API_DOMAIN_NAME;
        const createTenantAdminUserPath: string | undefined = process.env.CREATE_TENANT_ADMIN_USER_PATH;
        const createTenantPath: string | undefined = process.env.CREATE_TENANT_PATH;
        const registerAccessRoleArn: string | undefined = process.env.REGISTER_ACCESS_ROLE_ARN;

        const tenantId: string = randomUUID();
        const tenantDetails: Util.Models.TenantDetailModel = JSON.parse(event.body || '');
        tenantDetails.tenantId = tenantId;
        loggerService.info('Tenant Details', tenantDetails);

        const sessionManagement = new Auth.Helpers.SessionManagement(region);
        const credentials: Util.Models.Credentials | undefined = await sessionManagement.getSession(
            registerAccessRoleArn,
            'tenant-register-session',
            3600);
        loggerService.info('Credentials', credentials);

        loggerService.info('requestEndpoint', `${sharedApiDomainName}${createTenantAdminUserPath}`);

        const invokeManagement = new Util.Helpers.InvokeManagement(loggerService, region, credentials);
        const createUserResponse: Util.Models.CreateUserResponseModel = await invokeManagement.invoke(
            `${sharedApiDomainName}${createTenantAdminUserPath}`,
            'POST',
            tenantDetails,
            'Error occured while calling the create tenant admin user service');
        loggerService.info('Create User Response', createUserResponse.result);
        tenantDetails.tenantAdminUserName = createUserResponse.result?.tenantAdminUserName;

        const createTenantResponse = await invokeManagement.invoke(
            `${sharedApiDomainName}${createTenantPath}`,
            'POST',
            tenantDetails,
            'Error occured while creating the tenant record in table');
        loggerService.info('Create Tenant Response', createTenantResponse);

        return Util.Models.createSuccessResponse('You have been registered in our system');
    } catch (exception: any) {
        loggerService.error('Error registering a new tenant');
        throw new Error(exception);
    }
};

const handler = middy(lambdaHandler)
    .use(Util.captureLambdaHandler(traceService.tracer))
    .use(Util.logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(Util.injectLambdaContext(loggerService.logger));

export {handler};