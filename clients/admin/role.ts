import {Construct} from "constructs";
import {Fn} from "cdktf";
import * as awsProvider from "@providers/aws";
import * as core from "@core/index";

import {CloudfrontConstruct} from "./cloudfront";
import {BucketConstruct} from "./bucket";

type RoleConfig = {
    variable: core.VariableResult;
    bucket: BucketConstruct;
    cloudfront: CloudfrontConstruct;
}

export class RoleConstruct extends Construct {
    constructor(scope: Construct, id: string, config: RoleConfig) {
        super(scope, id);

        const s3Policy = new awsProvider.dataAwsIamPolicyDocument.DataAwsIamPolicyDocument(this, 's3_policy_document', {
            version: '2012-10-17',
            statement: [
                {
                    effect: 'Allow',
                    actions: ['s3:GetObject'],
                    resources: [`${config.bucket.resource.s3BucketArnOutput}/*`],
                    principals: [
                        {
                            type: 'AWS',
                            identifiers: Fn.tolist(config.cloudfront.resource.cloudfrontOriginAccessIdentityIamArnsOutput)
                        }
                    ]
                },
                {
                    effect: 'Allow',
                    actions: ['s3:GetObject'],
                    resources: [`${config.bucket.resource.s3BucketArnOutput}/*`],
                    principals: [
                        {
                            type: 'Service',
                            identifiers: ['cloudfront.amazonaws.com']
                        }
                    ],
                    condition: [
                        {
                            test: 'StringEquals',
                            variable: 'aws:SourceArn',
                            values: [config.cloudfront.resource.cloudfrontDistributionArnOutput]
                        }
                    ]
                }
            ],

            dependsOn: [
                config.bucket.resource,
                config.cloudfront.resource
            ]
        });

        new awsProvider.s3BucketPolicy.S3BucketPolicy(this, 's3_policy', {
            bucket: config.bucket.resource.s3BucketIdOutput,
            policy: s3Policy.json,

            dependsOn: [config.bucket.resource, s3Policy]
        });
    }
}