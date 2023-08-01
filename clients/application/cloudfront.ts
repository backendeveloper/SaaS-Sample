import {Construct} from "constructs";
import * as awsProvider from "@providers/aws";
import * as core from "@core/index";
import {Cloudfront} from "@modules/cloudfront";
import {Records} from "@modules/records";

import {BucketConstruct} from "./bucket";
import {RequestLambdaConstruct} from "../core";
import {Certificate} from "@modules/certificate";

type CloudfrontConfig = {
    variable: core.VariableResult;
    zone: awsProvider.dataAwsRoute53Zone.DataAwsRoute53Zone;
    awsGlobalRegionProvider: awsProvider.provider.AwsProvider;
    bucket: BucketConstruct;
    requestLambda: RequestLambdaConstruct;
}

export class CloudfrontConstruct extends Construct {
    public readonly resource: Cloudfront;

    constructor(scope: Construct, id: string, config: CloudfrontConfig) {
        super(scope, id);

        const applicationClientFullDomainName = `${config.variable.applicationClientSubDomainName.value}.${config.variable.domainName.value}`;
        const certificate = new Certificate(this, 'certificate', {
            domainName: config.variable.domainName.value,
            zoneId: config.zone.zoneId,
            subjectAlternativeNames: [
                `${applicationClientFullDomainName}`,
                `*.${applicationClientFullDomainName}`
            ],
            waitForValidation: true,
            validationMethod: 'DNS',

            providers: [config.awsGlobalRegionProvider],

            dependsOn: [
                config.variable.domainName,
                config.zone
            ]
        });

        const applicationCloudfront = new Cloudfront(this, 'resource', {
            aliases: [`${core.getSubDomainWithEnvironment(config, config.variable.applicationClientSubDomainName.value)}.${config.variable.domainName.value}`],

            comment: 'Application Client Distribution',
            enabled: true,
            isIpv6Enabled: true,
            httpVersion: 'http2and3',
            priceClass: 'PriceClass_All',
            retainOnDelete: false,
            waitForDeployment: false,
            defaultRootObject: 'index.html',

            // loggingConfig: {
            //     bucket: 'logs-my-cdn.s3.amazonaws.com'
            // },

            createOriginAccessIdentity: true,
            originAccessIdentities: {
                s3_bucket_one: 'Application client distribution can access'
            },

            origin: {
                s3_one: {
                    domain_name: config.bucket.resource.s3BucketBucketRegionalDomainNameOutput,
                    s3_origin_config: {
                        origin_access_identity: 's3_bucket_one'
                    }
                },
                // shared_api: {
                //     domain_name: `${config.variable.sharedApiSubDomainName.value}.${config.variable.domainName.value}`,
                //     custom_origin_config: {
                //         http_port: 80,
                //         https_port: 443,
                //         origin_protocol_policy: 'https-only',
                //         origin_ssl_protocols: ["TLSv1", "TLSv1.1", "TLSv1.2"]
                //     }
                // }
            },

            // originGroup: {
            //     group_one: {
            //         failover_status_codes: [403, 404, 500, 502],
            //         primary_member_origin_id: "shared_api",
            //         secondary_member_origin_id: "s3_one"
            //     }
            // },

            defaultCacheBehavior: {
                target_origin_id: 's3_one',
                viewer_protocol_policy: 'redirect-to-https',

                cache_policy_id: config.variable.defaultCacheBehaviorCachePolicyId.value,
                origin_request_policy_id: config.variable.defaultCacheBehaviorOriginRequestPolicyId.value,
                response_headers_policy_id: config.variable.defaultCacheBehaviorResponseHeadersPolicyId.value,

                use_forwarded_values: false,
                compress: true,

                lambda_function_association: {
                    'viewer-request': {
                        lambda_arn: config.requestLambda.resource.lambdaFunctionQualifiedArnOutput,
                    },

                    'origin-request': {
                        lambda_arn: config.requestLambda.resource.lambdaFunctionQualifiedArnOutput
                    }
                }
            },

            // orderedCacheBehavior: [
            //     {
            //         path_pattern: '/_next/static/*',
            //         target_origin_id: "s3_one",
            //         viewer_protocol_policy: "https-only",
            //
            //         // cache_policy_id: '658327ea-f89d-4fab-a63d-7e88639e58f6',
            //         // origin_request_policy_id: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
            //         // response_headers_policy_id: '67f7725c-6f97-4210-82d7-5512b31e9d03',
            //         query_string: false,
            //         // use_forwarded_values: false,
            //         compress: true
            //     },
            //     {
            //         path_pattern: '/static/*',
            //         target_origin_id: "s3_one",
            //         viewer_protocol_policy: "https-only",
            //
            //         // cache_policy_id: '658327ea-f89d-4fab-a63d-7e88639e58f6',
            //         // origin_request_policy_id: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
            //         // response_headers_policy_id: '67f7725c-6f97-4210-82d7-5512b31e9d03',
            //
            //         // use_forwarded_values: false,
            //         query_string: false,
            //         compress: true
            //     }
            // ],

            customErrorResponse: [
                {
                    error_code: 403,
                    response_code: 200,
                    error_caching_min_ttl: 300,
                    response_page_path: '/404.html'
                },
                {
                    error_code: 404,
                    response_code: 200,
                    error_caching_min_ttl: 300,
                    response_page_path: '/404.html'
                }
            ],

            viewerCertificate: {
                acm_certificate_arn: certificate.acmCertificateArnOutput,
                ssl_support_method: "sni-only",
                minimum_protocol_version: 'TLSv1.2_2021'
            },

            providers: [config.awsGlobalRegionProvider],

            dependsOn: [
                config.variable.applicationClientSubDomainName,
                config.variable.domainName,

                config.variable.defaultCacheBehaviorCachePolicyId,
                config.variable.defaultCacheBehaviorOriginRequestPolicyId,
                config.variable.defaultCacheBehaviorResponseHeadersPolicyId,

                config.bucket.resource,
                config.requestLambda.resource,
                certificate
            ]
        });

        new Records(this, 'record', {
            zoneId: config.zone.zoneId,

            records: [
                {
                    name: `${core.getSubDomainWithEnvironment(config, config.variable.applicationClientSubDomainName.value)}`,
                    type: "A",
                    alias: {
                        name: applicationCloudfront.cloudfrontDistributionDomainNameOutput,
                        zone_id: applicationCloudfront.cloudfrontDistributionHostedZoneIdOutput
                    }
                }
            ],

            dependsOn: [
                config.zone,
                config.variable.applicationClientSubDomainName,
                applicationCloudfront
            ]
        });

        this.resource = applicationCloudfront;
    }
}