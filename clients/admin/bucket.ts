import {Construct} from "constructs";
import * as core from "@core/index";
import {Bucket} from "@modules/bucket";

type BucketConfig = {
    variable: core.VariableResult;
}

export class BucketConstruct extends Construct {
    public readonly resource: Bucket;

    constructor(scope: Construct, id: string, config: BucketConfig) {
        super(scope, id);

        const logBucket = new Bucket(this, 'log', {
            bucket: config.variable.adminLogBucketName.value,  // TODO: degisecek
            forceDestroy: true,

            versioning: {
                status: 'true'
            },

            // server_side_encryption_configuration = {
            //     rule = {
            //         apply_server_side_encryption_by_default = {
            //             kms_master_key_id = aws_kms_key.objects.arn
            //             sse_algorithm     = "aws:kms"
            //         }
            //     }
            // }

            // controlObjectOwnership: true,
            // objectOwnership: 'BucketOwnerPreferred',
            // expectedBucketOwner: config.variable.accountId.value,
            // acl: 'private',

            dependsOn: [config.variable.adminLogBucketName]
        });

        this.resource = new Bucket(this, 'resource', {
            bucket: config.variable.adminBucketName.value,
            forceDestroy: true,

            logging: {
                target_bucket: logBucket.s3BucketIdOutput,
                target_prefix: 'log/'
            },

            dependsOn: [config.variable.adminBucketName, logBucket]
        });
    }
}