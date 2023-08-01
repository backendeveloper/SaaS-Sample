import {
    APIGatewayIAMAuthorizerWithContextResult,
    APIGatewayRequestAuthorizerEventV2
} from 'aws-lambda';
import middy from "@middy/core";
import jwt_decode from "jwt-decode";
import {CognitoJwtVerifier} from "aws-jwt-verify";
import {CognitoIdTokenPayload} from 'aws-jwt-verify/jwt-model';

import * as Util from '/opt/nodejs/node_modules/util-service';
import * as Auth from '/opt/nodejs/node_modules/auth-service';

const loggerService = new Util.Helpers.LoggerService();
const metricService = new Util.Helpers.MetricService();
const tracerService = new Util.Helpers.TracerService();

const lambdaHandler = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewayIAMAuthorizerWithContextResult<Auth.Models.AuthContextResponse>> => {
    loggerService.info('EVENT', event);

    const region: string = process.env.AWS_REGION || '';
    const accountId: string = event.requestContext.accountId;

    const userPoolId: string = process.env.TENANT_USER_POOL || '';
    const clientId: string = process.env.TENANT_APP_CLIENT || '';
    const authorizerAccessRoleArn: string = process.env.AUTHORIZER_ACCESS_ROLE_ARN || '';

    const tenantUserMappingTableArn = process.env.TENANT_USER_MAPPING_TABLE_ARN;
    const tenantDetailsTableArn = process.env.TENANT_USER_DETAILS_TABLE_ARN;
    const productTableArn = process.env.PRODUCT_TABLE_ARN;
    const orderTableArn = process.env.ORDER_TABLE_ARN;

    const idToken: string | undefined = event.headers?.authorization?.replace('Bearer', '').trim();
    if (!idToken)
        throw new Error('Authorization header should have a format Bearer <JWT> Token');

    const claims = jwt_decode<Auth.Models.TokenModel>(idToken);
    loggerService.info('Decode Claims', {claims});

    const verifier = CognitoJwtVerifier.create({
        userPoolId,
        clientId,
        tokenUse: 'id'
    });

    const verifyResult: CognitoIdTokenPayload = await verifier.verify(idToken);
    loggerService.info('Unauthorized Claims', verifyResult);

    if (!verifyResult) {
        loggerService.error('Unauthorized');
        throw new Error('Unauthorized');
    }

    const principalId: string = verifyResult.sub;
    const userName: string = verifyResult['cognito:username'];
    const tenantId: any = verifyResult['custom:tenantId'];
    const userRole: any = verifyResult['custom:userRole'];

    const authPolicy = new Auth.Helpers.AuthPolicy(principalId, accountId);
    authPolicy.restApiId = event.requestContext.apiId;
    authPolicy.region = region;
    authPolicy.stage = event.requestContext.stage;
    await authPolicy.allowMethod(Auth.Types.HttpVerbType.ALL, '*');
    const authResponse = await authPolicy.build();

    const userRoles = new Auth.Helpers.UserRoles(region, accountId, tenantUserMappingTableArn, tenantDetailsTableArn, productTableArn, orderTableArn);
    const iamPolicy = userRoles.getPolicyForUser(userRole, Auth.Types.ServiceIdentifierType.BUSINESS_SERVICES, tenantId);
    loggerService.info('IAM Policy', iamPolicy);

    const sessionManagement = new Auth.Helpers.SessionManagement(region);
    const credentials: Util.Models.Credentials | undefined = await sessionManagement.getSession(
        authorizerAccessRoleArn,
        'pooled-aware-session',
        3600,
        iamPolicy);

    authResponse.context = {
        accessKeyId: credentials?.AccessKeyId,
        secretAccessKey: credentials?.SecretAccessKey,
        sessionToken: credentials?.SessionToken,
        userPoolId,
        userRole,
        userName,
        tenantId
    };
    loggerService.info('Auth Response', authResponse);

    return authResponse;
};

const handler = middy(lambdaHandler)
    .use(Util.captureLambdaHandler(tracerService.tracer))
    .use(Util.logMetrics(metricService.metrics, {captureColdStartMetric: true}))
    .use(Util.injectLambdaContext(loggerService.logger));

export {handler};