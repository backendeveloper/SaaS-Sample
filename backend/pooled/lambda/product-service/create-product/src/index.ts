import {
    // APIGatewayIAMAuthorizerWithContextResult,
    APIGatewayRequestAuthorizerEventV2,
    Context
} from 'aws-lambda';
import middy from "@middy/core";

import {
    LoggerService,
    MetricService,
    TracerService,
    logMetrics,
    captureLambdaHandler,
    injectLambdaContext
} from '/opt/nodejs/node_modules/util-service';

const loggerService = new LoggerService();
const metricService = new MetricService();
const traceService = new TracerService();

// const lambdaHandler = async (event: APIGatewayRequestAuthorizerEventV2, context: Context): Promise<APIGatewayIAMAuthorizerWithContextResult<AuthContextResponse>> => {
const lambdaHandler = async (event: APIGatewayRequestAuthorizerEventV2, context: Context): Promise<null> => {
    loggerService.info('EVENT: ', {details: {event, context}});

    // const userPoolId: string = process.env.TENANT_USER_POOL || '';
    // const clientId: string = process.env.TENANT_APP_CLIENT || '';
    //
    // const verifier = CognitoJwtVerifier.create({
    //     userPoolId,
    //     clientId,
    //     tokenUse: 'id'
    // });
    //
    // const token = event.identitySource[0].replace('Bearer', '').trim();
    // if (!token)
    //     throw new Error('Authorization header should have a format Bearer <JWT> Token');
    //
    // const response = await verifier.verify(token);
    // loggerService.info('Unauthorized Claims', JSON.stringify(response));
    //
    // if (!response) {
    //     loggerService.error('Unauthorized');
    //     throw new Error('Unauthorized');
    // }
    //
    // loggerService.info('response: ', {response});

    // const principalId: string = response.sub;
    // const userName: string = response['cognito:username'];
    // const tenantId: any = response['custom:tenantId'];
    // const userRole: any = response['custom:userRole'];
    // const accountId: string = event.requestContext.accountId;
    // const region: string = process.env.AWS_REGION || '';
    //
    // const policy = new AuthPolicy(principalId, accountId);
    // policy.restApiId = event.requestContext.apiId;
    // policy.region = region;
    // policy.stage = event.requestContext.stage;
    //
    // await policy.allowAllMethods();
    // const authResponse = await policy.build();
    //
    // const userRoles = new UserRoles(userRole, 'BusinessServices', tenantId, region, accountId);
    // const iamPolicy = userRoles.getPolicyForUser();
    // loggerService.info('iamPolicy: ', {iamPolicy});
    //
    // const roleArn = `arn:aws:iam::${accountId}:role/authorizer-access-role`;
    //
    // const client = new STSClient({region});
    // const assumedRoleCommand = new AssumeRoleCommand({
    //     RoleArn: roleArn,
    //     RoleSessionName: 'tenant-aware-session',
    //     Policy: iamPolicy
    // });
    // const data = await client.send(assumedRoleCommand);
    // const credentials: Credentials | undefined = data.Credentials;
    //
    // authResponse.context = {
    //     accesskey: credentials?.AccessKeyId,
    //     secretkey: credentials?.SecretAccessKey,
    //     sessiontoken: credentials?.SessionToken,
    //     userPoolId: '',
    //     userRole: '',
    //     userName,
    //     tenantId,
    // };
    //
    // return authResponse;
    return null;
};

const handler = middy(lambdaHandler)
    .use(captureLambdaHandler(traceService.tracer))
    .use(logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(injectLambdaContext(loggerService.logger));

export {handler};