import {Construct} from 'constructs';
import {AwsProvider} from "@providers/aws/provider";
import {DataAwsRoute53Zone} from "@providers/aws/data-aws-route53-zone";
import * as core from "@core/index";
import {HttpApi} from "@modules/http-api";

import {LayerConstruct} from "./layer/layer";
import {ClientsConstruct} from "../clients";
import {SharedConstruct} from "./shared";
import {PooledConstruct} from "./pooled";
import {AuthConstruct} from "./auth";
import {CognitoUserPoolDomain} from "@providers/aws/cognito-user-pool-domain";
import {CognitoUserPoolClient} from "@providers/aws/cognito-user-pool-client";
import {AccessRoleConstruct} from "./access-role";
import {DatabaseConstruct} from "./database";
import {EmailConstruct} from "./email";
import {TenantPipelineConstruct} from "./tenant-pipeline";

type BackendConfig = {
    variable: core.VariableResult;
    awsGlobalRegionProvider: AwsProvider;
    zone: DataAwsRoute53Zone;
    clients: ClientsConstruct;
}

export class BackendConstruct extends Construct {
    public readonly operationUserPoolDomain: CognitoUserPoolDomain;
    public readonly pooledUserPoolDomain: CognitoUserPoolDomain;
    public readonly pooledTenantUserPoolClient: CognitoUserPoolClient;
    public readonly sharedApi: HttpApi;
    public readonly pooledApi: HttpApi;

    constructor(scope: Construct, id: string, config: BackendConfig) {
        super(scope, id);

        const layers = new LayerConstruct(this, 'layers');

        const auth = new AuthConstruct(this, 'auth', {
            ...config
        });

        const database = new DatabaseConstruct(this, 'database', {
            ...config
        });

        const accessRole = new AccessRoleConstruct(this, 'access_role', {
            ...config,
            database
        });

        const shared = new SharedConstruct(this, 'shared', {
            ...config,
            accessRole,
            database,
            auth,
            layers
        });

        const pooled = new PooledConstruct(this, 'pooled', {
            ...config,
            accessRole,
            database,
            auth,
            layers,
            shared
        });

        new EmailConstruct(this, 'email', {
            ...config,
        });

        new TenantPipelineConstruct(this, 'codepipeline', {
            ...config
        });

        this.sharedApi = shared.api;
        this.pooledApi = pooled.api;

        this.operationUserPoolDomain = auth.operationUserPoolDomain;
        this.pooledUserPoolDomain = auth.pooledUserPoolDomain;
        this.pooledTenantUserPoolClient = auth.pooledTenantUserPoolClient;
    }
}
