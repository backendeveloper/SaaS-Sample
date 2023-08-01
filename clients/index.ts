import {Construct} from 'constructs';
import {DataAwsRoute53Zone} from "@providers/aws/data-aws-route53-zone";
import {AwsProvider} from "@providers/aws/provider";
import {Cloudfront} from "@modules/cloudfront";
import * as core from "@core/index";

import {AdminConstruct} from "./admin";
import {ApplicationConstruct} from "./application";
import {RequestLambdaConstruct} from "./core";

type ClientsConfig = {
    variable: core.VariableResult;
    zone: DataAwsRoute53Zone;
    awsGlobalRegionProvider: AwsProvider;
}

export class ClientsConstruct extends Construct {
    public readonly adminCloudfront: Cloudfront;
    public readonly applicationCloudfront: Cloudfront;

    constructor(scope: Construct, id: string, config: ClientsConfig) {
        super(scope, id);

        const requestLambda = new RequestLambdaConstruct(this, 'request', {
            ...config,
        });

        const admin = new AdminConstruct(this, 'admin', {
            ...config,
            requestLambda
        });

        const application = new ApplicationConstruct(this, 'application', {
            ...config,
            requestLambda
        });

        this.adminCloudfront = admin.adminCloudfront;
        this.applicationCloudfront = application.applicationCloudfront;
    }
}
