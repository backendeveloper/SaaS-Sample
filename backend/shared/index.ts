import {Construct} from 'constructs';
import {AwsProvider} from "@providers/aws/provider";
import {DataAwsRoute53Zone} from "@providers/aws/data-aws-route53-zone";
import * as core from "@core/index";
import {HttpApi} from "@modules/http-api";

import {DatabaseConstruct} from "../database";
import {LayerConstruct} from "../layer/layer";
import {AuthConstruct} from "../auth";
import {ClientsConstruct} from "../../clients";
import {
    UserManagementLambdaConstruct,
    TenantManagementLambdaConstruct,
    LambdaApiPermissionsConstruct,
    SharedAuthorizerLambdaConstruct
} from "./lambda";
import {SharedApiConstruct} from "./api";
import {AccessRoleConstruct} from "../access-role";

type SharedConfig = {
    variable: core.VariableResult;
    awsGlobalRegionProvider: AwsProvider;
    zone: DataAwsRoute53Zone;
    clients: ClientsConstruct;
    layers: LayerConstruct;
    auth: AuthConstruct;
    accessRole: AccessRoleConstruct;
    database: DatabaseConstruct;
}

export class SharedConstruct extends Construct {
    public readonly api: HttpApi;

    constructor(scope: Construct, id: string, config: SharedConfig) {
        super(scope, id);

        const userManagementLambda = new UserManagementLambdaConstruct(this, 'user_management', {
            ...config
        });

        const tenantManagementLambda = new TenantManagementLambdaConstruct(this, 'tenant_management', {
            ...config
        });

        const authorizerLambda = new SharedAuthorizerLambdaConstruct(this, 'authorizer', {
            ...config
        });

        const api = new SharedApiConstruct(this, 'api', {
            ...config,
            authorizerLambda,
            userManagementLambda,
            tenantManagementLambda
        });

        new LambdaApiPermissionsConstruct(this, 'permissions', {
            ...config,
            api,
            authorizerLambda,
            userManagementLambda,
            tenantManagementLambda
        });

        this.api = api.resource;
    }
}
