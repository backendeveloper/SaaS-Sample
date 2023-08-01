import {Construct} from "constructs";
import {Fn, TerraformCount} from "cdktf";
import * as awsProvider from "@providers/aws";
import {CodebuildProject} from "@providers/aws/codebuild-project";
import * as core from "@core/index";

import {CodepipelineRoleConstruct} from "./codepipeline-role";
import {CodecommitConstruct} from "./codecommit";

type CodebuildConfig = {
    variable: core.VariableResult;
    buildProjects: string[];
    projectName: string;
    codepipelineRole: CodepipelineRoleConstruct;
    codecommit: CodecommitConstruct;
};

export class CodebuildConstruct extends Construct {
    public readonly resource: CodebuildProject;

    constructor(scope: Construct, id: string, config: CodebuildConfig) {
        super(scope, id);

        const buildProjectsCount = TerraformCount.of(config.buildProjects.length);
        this.resource = new awsProvider.codebuildProject.CodebuildProject(this, 'resource', {
            count: buildProjectsCount,

            name: `${config.projectName}-${buildProjectsCount.index}`,
            serviceRole: config.codepipelineRole.resource.arn,
            encryptionKey: config.codepipelineRole.kmsKey.arn,

            artifacts: {
                type: 'CODEPIPELINE'
            },
            environment: {
                computeType: 'BUILD_GENERAL1_SMALL',
                image: 'aws/codebuild/amazonlinux2-x86_64-standard:3.0',
                type: 'LINUX_CONTAINER',
                privilegedMode: true,
                imagePullCredentialsType: 'CODEBUILD'
            },
            logsConfig: {
                cloudwatchLogs: {
                    status: 'ENABLED'
                }
            },
            source: {
                type: 'CODEPIPELINE',
                buildspec: `./templates/buildspec_${Fn.element(config.buildProjects, buildProjectsCount.index)}.yml`
            },

            dependsOn: [
                config.codecommit.sourceRepository,
                config.codecommit.sourceRepositoryApprovalRuleTemplate,
                config.codecommit.sourceRepositoryApprovalAssociation
            ]
        });
    }
}