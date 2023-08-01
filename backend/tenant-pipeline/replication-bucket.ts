import {Construct} from "constructs";
import * as awsProvider from "@providers/aws";
import * as core from "@core/index";
import {Fn} from "cdktf";

import {CodepipelineBucketConstruct} from "./codepipeline-bucket";
import {S3Bucket} from "@providers/aws/s3-bucket";

type ReplicationBucketConfig = {
    variable: core.VariableResult;
    codepipelineBucket: CodepipelineBucketConstruct;
    projectName: string;
};

export class ReplicationBucketConstruct extends Construct {
    public readonly resource: S3Bucket;

    constructor(scope: Construct, id: string, config: ReplicationBucketConfig) {
        super(scope, id);

        const replicationBucket = new awsProvider.s3Bucket.S3Bucket(this, 'resource', {
            // provider      = aws.replication
            bucketPrefix: `${Fn.regex('[a-z0-9.-]+', Fn.lower(config.projectName))}-rpl`
        });

        new awsProvider.s3BucketAcl.S3BucketAcl(this, 'acl', {
            // provider = aws.replication
            bucket: replicationBucket.id,
            acl: 'private'
        });

        new awsProvider.s3BucketVersioning.S3BucketVersioningA(this, 'versioning', {
            // provider = aws.replication
            bucket: replicationBucket.id,
            versioningConfiguration: {
                status: 'Enabled'
            }
        });

        new awsProvider.s3BucketLogging.S3BucketLoggingA(this, 'logging', {
            // provider      = aws.replication
            bucket: replicationBucket.id,
            targetBucket: replicationBucket.id,
            targetPrefix: 'log/'
        });

        const replicationS3Role = new awsProvider.iamRole.IamRole(this, 'role', {
            name: `${config.projectName}-replication-role`,
            assumeRolePolicy: Fn.jsonencode({
                Version: '2012-10-17',
                Statement: [
                    {
                        Sid: '',
                        Effect: 'Allow',
                        Action: 'sts:AssumeRole',
                        Principal: {
                            Service: 's3.amazonaws.com',
                        }
                    }
                ]
            })

        });

        const replicationS3Policy = new awsProvider.iamPolicy.IamPolicy(this, 'policy', {
            name: `${config.projectName}-replication-policy`,
            policy: Fn.jsonencode({
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Action: [
                            's3:GetReplicationConfiguration',
                            's3:ListBucket'
                        ],
                        Resource: [config.codepipelineBucket.resource.arn]
                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            's3:GetObjectVersionForReplication',
                            's3:GetObjectVersionAcl',
                            's3:GetObjectVersionTagging'
                        ],
                        Resource: [`${config.codepipelineBucket.resource.arn}/*`]
                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            's3:ReplicateObject',
                            's3:ReplicateDelete',
                            's3:ReplicateTags'
                        ],
                        Resource: [`${replicationBucket.arn}/*`]
                    }
                ]
            })
        });

        new awsProvider.iamRolePolicyAttachment.IamRolePolicyAttachment(this, 'role_attach', {
            role: replicationS3Role.name,
            policyArn: replicationS3Policy.arn
        });

        new awsProvider.s3BucketReplicationConfiguration.S3BucketReplicationConfigurationA(this, 'config', {
            // provider = aws.replication
            role: replicationS3Role.arn,
            bucket: config.codepipelineBucket.resource.id,

            rule: [
                {
                    id: `${config.projectName}-replication-rule`,
                    filter: {},
                    deleteMarkerReplication: {
                        status: 'Enabled'
                    },
                    status: 'Enabled',
                    destination: {
                        bucket: replicationBucket.arn,
                        storageClass: 'STANDARD'
                    }
                }
            ],

            dependsOn: [config.codepipelineBucket.codepipelineBucketVersioning]
        });

        new awsProvider.s3BucketPublicAccessBlock.S3BucketPublicAccessBlock(this, 'access', {
            // provider                = aws.replication
            bucket: replicationBucket.id,
            ignorePublicAcls: true,
            restrictPublicBuckets: true,
            blockPublicAcls: true,
            blockPublicPolicy: true
        });

        const bucketPolicyDocReplicationBucket = new awsProvider.dataAwsIamPolicyDocument.DataAwsIamPolicyDocument(this, 'policy_doc', {
            // provider = aws.replication
            statement: [
                {
                    actions: [
                        's3:Get*',
                        's3:List*',
                        's3:ReplicateObject',
                        's3:PutObject',
                        's3:RestoreObject',
                        's3:PutObjectVersionTagging',
                        's3:PutObjectTagging',
                        's3:PutObjectAcl'
                    ],
                    resources: [
                        replicationBucket.arn,
                        `${replicationBucket.arn}/*`
                    ],
                    principals: [
                        {
                            type: 'AWS',
                            identifiers: [config.codepipelineBucket.resource.arn]
                        }
                    ]
                }
            ]
        });

        new awsProvider.s3BucketPolicy.S3BucketPolicy(this, 'bucket_policy', {
            // provider = aws.replication
            bucket: replicationBucket.id,
            policy:bucketPolicyDocReplicationBucket.json
        });

        this.resource = replicationBucket;
    }
}