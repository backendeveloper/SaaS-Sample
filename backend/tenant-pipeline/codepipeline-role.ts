import {Construct} from "constructs";
import {Fn} from "cdktf";
import * as awsProvider from "@providers/aws";
import {IamRole} from "@providers/aws/iam-role";
import {KmsKey} from "@providers/aws/kms-key";
import * as core from "@core/index";

import {CodepipelineBucketConstruct} from "./codepipeline-bucket";
// import {ReplicationBucketConstruct} from "./replication-bucket";

type CodepipelineRoleConfig = {
    variable: core.VariableResult;
    codepipelineBucket: CodepipelineBucketConstruct;
    // replicationBucket: ReplicationBucketConstruct;
    projectName: string;
    // sourceRepoName: string;
};

export class CodepipelineRoleConstruct extends Construct {
    public readonly resource: IamRole;
    public readonly kmsKey: KmsKey;

    constructor(scope: Construct, id: string, config: CodepipelineRoleConfig) {
        super(scope, id);

        const awsPartition = new awsProvider.dataAwsPartition.DataAwsPartition(this, 'current', {});

        const codepipelineRole = new awsProvider.iamRole.IamRole(this, 'resource', {
            name: `${config.projectName}-codepipeline-role`,
            path: '/',
            assumeRolePolicy: Fn.jsonencode({
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Action: 'sts:AssumeRole',
                        Principal: {
                            'Service': 'codepipeline.amazonaws.com'
                        }
                    },
                    {
                        Effect: 'Allow',
                        Action: 'sts:AssumeRole',
                        Principal: {
                            'Service': 'codebuild.amazonaws.com'
                        }
                    }
                ]
            })
        });

        const bucketPolicyDocCodepipelineBucket = new awsProvider.dataAwsIamPolicyDocument.DataAwsIamPolicyDocument(this, 'policy_doc', {
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
                        config.codepipelineBucket.resource.s3BucketArnOutput,
                        `${config.codepipelineBucket.resource.s3BucketArnOutput}/*`
                    ],
                    principals: [
                        {
                            type: 'AWS',
                            identifiers: [codepipelineRole.arn]
                        }
                    ]
                }
            ]
        });

        new awsProvider.s3BucketPolicy.S3BucketPolicy(this, 'bucket_policy', {
            bucket: config.codepipelineBucket.resource.s3BucketIdOutput,
            policy: bucketPolicyDocCodepipelineBucket.json
        });

        const kmsKeyPolicy = new awsProvider.dataAwsIamPolicyDocument.DataAwsIamPolicyDocument(this, 'kms_key_policy_doc', {
            statement: [
                {
                    sid: 'Enable IAM User Permissions',
                    effect: 'Allow',
                    actions: ['kms:*'],
                    resources: ['*'],

                    principals: [
                        {
                            type: 'AWS',
                            identifiers: [`arn:aws:iam::${config.variable.accountId.value}:root`]
                        }
                    ]
                },
                {
                    sid: 'Allow access for Key Administrators',
                    effect: 'Allow',
                    actions: ['kms:*'],
                    resources: ['*'],

                    principals: [
                        {
                            type: 'AWS',
                            identifiers: [codepipelineRole.arn]
                        }
                    ]
                },
                {
                    sid: 'Allow use of the key',
                    effect: 'Allow',
                    actions: [
                        'kms:Encrypt',
                        'kms:Decrypt',
                        'kms:ReEncrypt*',
                        'kms:GenerateDataKey*',
                        'kms:DescribeKey'
                    ],
                    resources: ['*'],

                    principals: [
                        {
                            type: 'AWS',
                            identifiers: [codepipelineRole.arn]
                        }
                    ]
                },
                {
                    sid: 'Allow attachment of persistent resources',
                    effect: 'Allow',
                    actions: [
                        'kms:CreateGrant',
                        'kms:ListGrants',
                        'kms:RevokeGrant'
                    ],
                    resources: ['*'],

                    principals: [
                        {
                            type: 'AWS',
                            identifiers: [codepipelineRole.arn]
                        }
                    ],
                    condition: [
                        {
                            test: 'Bool',
                            variable: 'kms:GrantIsForAWSResource',
                            values: ['true']
                        }
                    ]
                }
            ]
        });

        const kmsKey = new awsProvider.kmsKey.KmsKey(this, 'kms_key', {
            description: 'This key is used to encrypt bucket objects',
            deletionWindowInDays: 10,
            policy: kmsKeyPolicy.json,
            enableKeyRotation: true
        });

        new awsProvider.s3BucketServerSideEncryptionConfiguration.S3BucketServerSideEncryptionConfigurationA(this, 'codepipeline_bucket_encryption', {
            bucket: config.codepipelineBucket.resource.s3BucketIdOutput,

            rule: [
                {
                    applyServerSideEncryptionByDefault: {
                        kmsMasterKeyId: kmsKey.arn,
                        sseAlgorithm: 'aws:kms'
                    }
                }
            ]
        });

        // new awsProvider.s3BucketServerSideEncryptionConfiguration.S3BucketServerSideEncryptionConfigurationA(this, 'replication_bucket_encryption', {
        //     // provider: 'aws.replication',
        //     bucket: config.replicationBucket.resource.bucket,
        //
        //     rule: [
        //         {
        //             applyServerSideEncryptionByDefault: {
        //                 kmsMasterKeyId: kmsKey.arn,
        //                 sseAlgorithm: 'aws:kms'
        //             }
        //         }
        //     ]
        // });

        const policy = new awsProvider.iamPolicy.IamPolicy(this, 'policy', {
            name: `${config.projectName}-codepipeline-policy`,
            description: 'Policy to allow codepipeline to execute',
            policy: Fn.jsonencode({
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Action: [
                            's3:GetObject',
                            's3:GetObjectVersion',
                            's3:PutObjectAcl',
                            's3:PutObject'
                        ],
                        Resource: [`${config.codepipelineBucket.resource.s3BucketArnOutput}/*`]
                    },
                    {
                        Effect: 'Allow',
                        Action: ['s3:GetBucketVersioning'],
                        Resource: [`${config.codepipelineBucket.resource.s3BucketArnOutput}/*`]
                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            'kms:DescribeKey',
                            'kms:GenerateDataKey*',
                            'kms:Encrypt',
                            'kms:ReEncrypt*',
                            'kms:Decrypt'
                        ],
                        Resource: [kmsKey.arn]
                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            'codecommit:GitPull',
                            'codecommit:GitPush',
                            'codecommit:GetBranch',
                            'codecommit:CreateCommit',
                            'codecommit:ListRepositories',
                            'codecommit:BatchGetCommits',
                            'codecommit:BatchGetRepositories',
                            'codecommit:GetCommit',
                            'codecommit:GetRepository',
                            'codecommit:GetUploadArchiveStatus',
                            'codecommit:ListBranches',
                            'codecommit:UploadArchive'
                        ],
                        Resource: [
                            // `arn:aws:codecommit:${config.variable.region.value}:${config.variable.accountId.value}:${config.sourceRepoName}`,
                            `arn:aws:codecommit:${config.variable.region.value}:${config.variable.accountId.value}:*`
                        ]
                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            'codebuild:BatchGetBuilds',
                            'codebuild:StartBuild',
                            'codebuild:BatchGetProjects'
                        ],
                        Resource: [`arn:aws:codebuild:${config.variable.region.value}:${config.variable.accountId.value}:project/${config.projectName}*`]
                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            'codebuild:CreateReportGroup',
                            'codebuild:CreateReport',
                            'codebuild:UpdateReport',
                            'codebuild:BatchPutTestCases'
                        ],
                        Resource: [`arn:aws:codebuild:${config.variable.region.value}:${config.variable.accountId.value}:report-group/${config.projectName}*`]
                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            'logs:CreateLogGroup',
                            'logs:CreateLogStream',
                            'logs:PutLogEvents'
                        ],
                        Resource: [`arn:${awsPartition.partition}:logs:${config.variable.region.value}:${config.variable.accountId.value}:log-group:*`]
                    }
                ]
            })
        });

        new awsProvider.iamRolePolicyAttachment.IamRolePolicyAttachment(this, 'role_attach', {
            role: codepipelineRole.name,
            policyArn: policy.arn
        });

        this.resource = codepipelineRole;
        this.kmsKey = kmsKey;
    }
}