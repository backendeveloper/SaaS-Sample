import {Construct} from 'constructs';
import {Fn} from "cdktf";
import * as awsProvider from "@providers/aws";
import {DataAwsRoute53Zone} from "@providers/aws/data-aws-route53-zone";
import * as core from "@core/index";
import {HttpApi} from "@modules/http-api";
import {Certificate} from "@modules/certificate";

import {PooledAuthorizerLambdaConstruct, ProductLambdaConstruct} from "./lambda";

type PooledApiConfig = {
    variable: core.VariableResult;
    zone: DataAwsRoute53Zone;
    pooledAuthorizerLambda: PooledAuthorizerLambdaConstruct;
    productServiceLambda: ProductLambdaConstruct;
}

export class PooledApiConstruct extends Construct {
    public readonly resource: HttpApi;

    constructor(scope: Construct, id: string, config: PooledApiConfig) {
        super(scope, id);

        const pooledApiFullDomainName = `${core.getSubDomainWithEnvironment(config, config.variable.pooledApiSubDomainName.value)}.${config.variable.domainName.value}`;

        const certificate = new Certificate(this, 'certificate', {
            domainName: config.variable.domainName.value,
            zoneId: config.zone.zoneId,
            subjectAlternativeNames: [
                `${config.variable.pooledApiSubDomainName.value}.${config.variable.domainName.value}`,
                `*.${config.variable.pooledApiSubDomainName.value}.${config.variable.domainName.value}`,
            ],
            waitForValidation: true,
            validationMethod: 'DNS',

            dependsOn: [
                config.variable.domainName,
                config.variable.pooledApiSubDomainName,
                config.zone
            ]
        });

        const logGroup = new awsProvider.cloudwatchLogGroup.CloudwatchLogGroup(this, 'log_group', {
            name: `/aws/api-gateway/saas/pooled-${config.variable.environment.value}`,
            retentionInDays: 7,

            dependsOn: [config.variable.environment]
        });

        const api = new HttpApi(this, 'resource', {
            name: pooledApiFullDomainName,
            description: `SaaS Pooled API - ${config.variable.environment.value}`,
            protocolType: 'HTTP',

            corsConfiguration: {
                allow_headers: ['authorization', 'content-type', 'x-amz-date', 'x-amz-security-token', 'x-amz-content-sha256'],
                allow_methods: ['GET', 'HEAD', 'OPTIONS', 'POST'],
                allow_origins: [
                    `https://${core.getSubDomainWithEnvironment(config, config.variable.adminClientSubDomainName.value)}.${config.variable.domainName.value}`,
                    `https://${core.getSubDomainWithEnvironment(config, config.variable.applicationClientSubDomainName.value)}.${config.variable.domainName.value}`
                ],
                allow_credentials: true
            },

            // mutualTlsAuthentication: {
            //     truststore_uri: 's3://${aws_s3_bucket.truststore.bucket}/${aws_s3_object.truststore.id}',
            //     truststore_version: aws_s3_object.truststore.version_id
            // }

            domainName: pooledApiFullDomainName,
            domainNameCertificateArn: certificate.acmCertificateArnOutput,

            defaultStageAccessLogDestinationArn: logGroup.arn,
            defaultStageAccessLogFormat: Fn.jsonencode({
                requestId: '$context.requestId',
                extendedRequestId: '$context.extendedRequestId',
                ip: '$context.identity.sourceIp',
                caller: '$context.identity.caller',
                user: '$context.identity.user',
                requestTime: '$context.requestTime',
                httpMethod: '$context.httpMethod',
                resourcePath: '$context.resourcePath',
                status: '$context.status',
                protocol: '$context.protocol',
                responseLength: '$context.responseLength',
                authorizerError: '$context.authorizer.error'
            }),
            defaultRouteSettings: {
                detailed_metrics_enabled: 'true',
                throttling_burst_limit: '100',
                throttling_rate_limit: '100'
            },

            authorizers: {
                'lambda': {
                    name: 'pooled-api-authorizer',
                    authorizer_type: 'REQUEST',
                    authorizer_uri: `arn:aws:apigateway:${config.variable.region.value}:lambda:path/2015-03-31/functions/${config.pooledAuthorizerLambda.resource.lambdaFunctionArnOutput}/invocations`,
                    identity_sources: ['$request.header.Authorization'],
                    authorizer_payload_format_version: '2.0',
                    authorizer_result_ttl_in_seconds: 60,
                    enable_simple_responses: false
                }
            },

            integrations: {
                ...config.productServiceLambda.integrations,
                // ...config.userManagementLambda.integrations
            },

            dependsOn: [
                config.variable.environment,
                config.variable.region,
                config.variable.domainName,
                config.variable.sharedApiSubDomainName,

                config.pooledAuthorizerLambda.resource,
                config.productServiceLambda.getProductsLambda,

                // config.userManagementLambda.createUserLambda,
                certificate
            ]
        });

        new awsProvider.route53Record.Route53Record(this, 'record', {
            zoneId: config.zone.zoneId,
            name: api.apigatewayv2DomainNameIdOutput,
            type: 'A',

            alias: {
                name: api.apigatewayv2DomainNameTargetDomainNameOutput,
                zoneId: api.apigatewayv2DomainNameHostedZoneIdOutput,
                evaluateTargetHealth: false
            },

            dependsOn: [api, config.zone]
        });

        this.resource = api;
    }
}
