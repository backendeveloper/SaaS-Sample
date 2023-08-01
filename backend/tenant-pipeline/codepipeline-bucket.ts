import {Construct} from "constructs";
import {Fn} from "cdktf";
import {Bucket} from "@modules/bucket";
import * as core from "@core/index";

type CodepipelineBucketConfig = {
    variable: core.VariableResult;
    projectName: string;
};

export class CodepipelineBucketConstruct extends Construct {
    public readonly resource: Bucket;
    // public readonly codepipelineBucketVersioning: S3BucketVersioningA;

    constructor(scope: Construct, id: string, config: CodepipelineBucketConfig) {
        super(scope, id);

        // new Bucket(this, 'logs', {
        //     bucketPrefix: `logs-${config.projectName}`,
        //     forceDestroy: true,
        //
        //     accessLogDeliveryPolicySourceAccounts: [config.variable.accountId.value],
        //     accessLogDeliveryPolicySourceBuckets: ['arn:aws:s3:::' + ]
        // });

        this.resource = new Bucket(this, 'resource', {
            bucketPrefix: Fn.regex('[a-z0-9.-]+', Fn.lower(config.projectName)),
            forceDestroy: true,

            versioning: {
                status: 'true',
                mfa_delete: 'false'
            },

            // logging = {
            //     target_bucket = module.log_bucket.s3_bucket_id
            //     target_prefix = "log/"
            // }

            controlObjectOwnership: true,
            objectOwnership: 'BucketOwnerPreferred',
            expectedBucketOwner: config.variable.accountId.value,

            acl: 'private'
        });

        // const codepipelineBucket = new awsProvider.s3Bucket.S3Bucket(this, 'resource', {
        //     bucketPrefix: Fn.regex('[a-z0-9.-]+', Fn.lower(config.projectName)),
        //     forceDestroy: true
        // });

        // new awsProvider.s3BucketPublicAccessBlock.S3BucketPublicAccessBlock(this, 'access', {
        //     bucket: codepipelineBucket.id,
        //     ignorePublicAcls: true,
        //     restrictPublicBuckets: true,
        //     blockPublicAcls: true,
        //     blockPublicPolicy: true
        // });

        // const codepipelineBucketVersioning = new awsProvider.s3BucketVersioning.S3BucketVersioningA(this, 'versioning', {
        //     bucket: codepipelineBucket.id,
        //     versioningConfiguration: {
        //         status: 'Enabled'
        //     }
        // });

        // new awsProvider.s3BucketAcl.S3BucketAcl(this, 'acl', {
        //     bucket: codepipelineBucket.id,
        //     acl: 'private'
        // });

        // new awsProvider.s3BucketLogging.S3BucketLoggingA(this, 'logging', {
        //     bucket: codepipelineBucket.id,
        //     targetBucket: codepipelineBucket.id,
        //     targetPrefix: 'log/'
        // });
    }
}