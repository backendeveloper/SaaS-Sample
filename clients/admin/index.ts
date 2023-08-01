import {Construct} from "constructs";
import * as awsProvider from "@providers/aws";
import * as core from "@core/index";
import {Cloudfront} from "@modules/cloudfront";

import {BucketConstruct} from "./bucket";
import {CloudfrontConstruct} from "./cloudfront";
import {RoleConstruct} from "./role";
import {RequestLambdaConstruct} from "../core";

type AdminConfig = {
    variable: core.VariableResult;
    zone: awsProvider.dataAwsRoute53Zone.DataAwsRoute53Zone;
    awsGlobalRegionProvider: awsProvider.provider.AwsProvider;
    requestLambda: RequestLambdaConstruct;
}

export class AdminConstruct extends Construct {
    public readonly adminCloudfront: Cloudfront;

    constructor(scope: Construct, id: string, config: AdminConfig) {
        super(scope, id);

        const bucket = new BucketConstruct(this, 'bucket', {
            ...config,
        });

        const cloudfront = new CloudfrontConstruct(this, 'CDN', {
            ...config,
            bucket
        });

        new RoleConstruct(this, 'role', {
            ...config,
            bucket,
            cloudfront
        });

        this.adminCloudfront = cloudfront.resource;
    }
}