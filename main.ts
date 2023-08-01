import {Construct} from "constructs";
import {App, TerraformStack, CloudBackend, NamedCloudWorkspace} from "cdktf";
import * as awsProvider from "@providers/aws";
import * as core from "@core/index";

import {ClientsConstruct} from "./clients";
import {BackendConstruct} from "./backend";

class MainStack extends TerraformStack {
    constructor(scope: Construct, id: string, env: string) {
        super(scope, id);

        const variable = new core.VariableConstruct(this, `${env}_variable`).resource;

        new CloudBackend(this, {
            hostname: "app.terraform.io",
            organization: "masraff",
            workspaces: new NamedCloudWorkspace("saas-dev")
        });

        const accessKey = variable.accessKey.value;
        const secretKey = variable.secretKey.value;
        new awsProvider.provider.AwsProvider(this, `${env}_aws_provider`, {
            region: variable.region.value,
            accessKey,
            secretKey
        });
        const awsGlobalRegionProvider = new awsProvider.provider.AwsProvider(this, `${env}_aws_global_provider`, {
            region: 'us-east-1',
            alias: 'global_region',
            accessKey,
            secretKey
        });

        const zone = new awsProvider.dataAwsRoute53Zone.DataAwsRoute53Zone(this, `${env}_zone`, {
            name: variable.domainName.value,
            privateZone: false,

            dependsOn: [variable.domainName]
        });

        const clients = new ClientsConstruct(this, `${env}_clients`, {
            variable,
            zone,
            awsGlobalRegionProvider
        });

        const backend = new BackendConstruct(this, `${env}_backend`, {
            variable,
            zone,
            clients,
            awsGlobalRegionProvider
        });

        new core.OutputConstruct(this, `${env}_outputs`, {
            variable,
            clients,
            backend
        });
    }
}

const app = new App();
new MainStack(app, "saas-dev", 'dev');
app.synth();
