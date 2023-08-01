import {Construct} from "constructs";
import * as awsProvider from "@providers/aws";
import * as core from "@core/index";
import {Cloudfront} from "@modules/cloudfront";

import {BucketConstruct} from "./bucket";
import {RequestLambdaConstruct} from "../core";
import {CloudfrontConstruct} from "./cloudfront";
import {RoleConstruct} from "./role";

type ApplicationConfig = {
    variable: core.VariableResult;
    zone: awsProvider.dataAwsRoute53Zone.DataAwsRoute53Zone;
    awsGlobalRegionProvider: awsProvider.provider.AwsProvider;
    requestLambda: RequestLambdaConstruct;
}

export class ApplicationConstruct extends Construct {
    public readonly applicationCloudfront: Cloudfront;

    constructor(scope: Construct, id: string, config: ApplicationConfig) {
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

        this.applicationCloudfront = cloudfront.resource;
    }
}