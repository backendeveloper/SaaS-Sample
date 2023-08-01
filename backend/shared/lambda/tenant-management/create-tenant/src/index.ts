import {APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2} from "aws-lambda";
import middy from "@middy/core";

import * as Util from '/opt/nodejs/node_modules/util-service';
import * as Database from '/opt/nodejs/node_modules/database-service';

const loggerService = new Util.Helpers.LoggerService();
const metricService = new Util.Helpers.MetricService();
const traceService = new Util.Helpers.TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT', event);

    const region: string = process.env.AWS_REGION || '';
    const tenantUserDetailTableName: string | undefined = process.env.TENANT_USER_DETAIL_TABLE_NAME;
    const tenantDetails: Util.Models.TenantDetailModel = JSON.parse(event.body || '');

    try {
        const databaseManagement = new Database.DatabaseManagement(tenantUserDetailTableName, region);
        await databaseManagement.putItem({
            ...tenantDetails,
            isActive: true
        });
    } catch (exception: any) {
        throw new Error(exception);
    }

    return Util.Models.createSuccessResponse('Tenant Created');
};

const handler = middy(lambdaHandler)
    .use(Util.captureLambdaHandler(traceService.tracer))
    .use(Util.logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(Util.injectLambdaContext(loggerService.logger));

export {handler};