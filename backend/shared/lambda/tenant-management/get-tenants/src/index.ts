import {
    APIGatewayProxyStructuredResultV2,
    APIGatewayProxyEventV2
} from "aws-lambda";
import middy from '@middy/core';
import * as Util from '/opt/nodejs/node_modules/util-service';
import * as Database from '/opt/nodejs/node_modules/database-service';

const loggerService = new Util.Helpers.LoggerService();
const metricService = new Util.Helpers.MetricService();
const tracerService = new Util.Helpers.TracerService();

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    loggerService.info('EVENT', event);

    const region: string = process.env.AWS_REGION || '';
    const tenantUserDetailTableName = process.env.TENANT_USER_DETAIL_TABLE_NAME;
    let response: Database.DatabaseResponse | null;

    try {
        const databaseManagement = new Database.DatabaseManagement(tenantUserDetailTableName, region);
        response = await databaseManagement.scan();

        loggerService.info('response', response?.items);
    } catch (exception: any) {
        loggerService.error('Error getting all tenants');
        throw new Error(exception);
    }

    return Util.Models.generateResponse(response?.items);
};

const handler = middy(lambdaHandler)
    .use(Util.captureLambdaHandler(tracerService.tracer))
    .use(Util.logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(Util.injectLambdaContext(loggerService.logger));

export {handler};