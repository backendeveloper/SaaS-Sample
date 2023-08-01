import {Construct} from "constructs";
import {AssetType, TerraformAsset} from "cdktf";
import * as path from 'path';
import * as awsProvider from "@providers/aws";
import * as core from "@core/index";
import {Lambda} from "@modules/lambda";

type RequestLambdaConfig = {
    variable: core.VariableResult;
    awsGlobalRegionProvider: awsProvider.provider.AwsProvider;
}

export class RequestLambdaConstruct extends Construct {
    public readonly resource: Lambda;

    constructor(scope: Construct, id: string, config: RequestLambdaConfig) {
        super(scope, id);

        this.resource = new Lambda(this, 'lambda', {
            functionName: `saas-request-lambda-at-edge_${config.variable.environment.value}`,
            description: `saas Request Edge Lambda - ${config.variable.environment.value}`,
            handler: 'index.handler',
            runtime: 'nodejs18.x',
            lambdaAtEdge: true,
            publish: true,
            createPackage: false,
            localExistingPackage: new TerraformAsset(this, 'lambda_asset', {
                path: path.resolve(__dirname, 'request/dist'),
                type: AssetType.ARCHIVE
            }).path,
            tracingMode: 'Active',
            providers: [config.awsGlobalRegionProvider],

            dependsOn: [config.variable.environment]
        });
    }
}