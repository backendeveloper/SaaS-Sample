import {Construct} from 'constructs';
import {DataAwsRoute53Zone} from "@providers/aws/data-aws-route53-zone";
import * as core from "@core/index";
import {HttpApi} from "@modules/http-api";

import {LayerConstruct} from "../layer/layer";
import {ClientsConstruct} from "../../clients";
import {SharedConstruct} from "../shared";
import {LambdaApiPermissionsConstruct, PooledAuthorizerLambdaConstruct, ProductLambdaConstruct} from "./lambda";
import {PooledApiConstruct} from "./api";
import {AuthConstruct} from "../auth";
import {AccessRoleConstruct} from "../access-role";
import {DatabaseConstruct} from "../database";

type PooledConfig = {
    variable: core.VariableResult;
    layers: LayerConstruct;
    shared: SharedConstruct;
    zone: DataAwsRoute53Zone;
    clients: ClientsConstruct;
    auth: AuthConstruct;
    accessRole: AccessRoleConstruct;
    database: DatabaseConstruct;
}

export class PooledConstruct extends Construct {
    public readonly api: HttpApi;

    constructor(scope: Construct, id: string, config: PooledConfig) {
        super(scope, id);

        const pooledAuthorizerLambda = new PooledAuthorizerLambdaConstruct(this, 'authorizer', {
            ...config
        });

        const productServiceLambda = new ProductLambdaConstruct(this, 'product', {
            ...config
        });

        const api = new PooledApiConstruct(this, 'api', {
            ...config,
            pooledAuthorizerLambda,
            productServiceLambda
        });

        new LambdaApiPermissionsConstruct(this, 'permissions', {
            ...config,
            api,
            pooledAuthorizerLambda,
            productServiceLambda
        });

        this.api = api.resource;
    }
}
