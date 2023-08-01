import {Construct} from "constructs";
import * as awsProvider from "@providers/aws";
import * as core from "@core/index";

import {CodepipelineRoleConstruct} from "./codepipeline-role";
import {CodepipelineBucketConstruct} from "./codepipeline-bucket";
import {CodebuildConstruct} from "./codebuild";
import {ReplicationBucketConstruct} from "./replication-bucket";

type CodepipelineConfig = {
    variable: core.VariableResult;
    projectName: string;
    codepipelineRole: CodepipelineRoleConstruct;
    codepipelineBucket: CodepipelineBucketConstruct;
    replicationBucket: ReplicationBucketConstruct;
    codebuild: CodebuildConstruct;
    sourceRepoName: string;
    sourceRepoBranch: string;
};

export class CodepipelineConstruct extends Construct {

    constructor(scope: Construct, id: string, config: CodepipelineConfig) {
        super(scope, id);

        new awsProvider.codepipeline.Codepipeline(this, 'resource', {
            name: `${config.projectName}-pipeline`,
            roleArn: config.codepipelineRole.resource.arn,

            artifactStore: [
                {
                    location: config.codepipelineBucket.resource.bucket,
                    type: 'S3',
                    encryptionKey: {
                        id: config.codepipelineRole.kmsKey.arn,
                        type: 'KMS'
                    }
                }
            ],

            stage: [
                {
                    name: 'Source',
                    action: [
                        {
                            name: 'Download-Source',
                            category: 'Source',
                            owner: 'AWS',
                            version: '1',
                            provider: 'CodeCommit',
                            namespace: 'SourceVariables',
                            outputArtifacts: ['SourceOutput'],
                            runOrder: 1,

                            configuration: {
                                RepositoryName: config.sourceRepoName,
                                BranchName: config.sourceRepoBranch,
                                PollForSourceChanges: 'true'
                            }
                        }
                    ]
                },
                {
                    name: 'Stage-validate',
                    action: [
                        {
                            name: 'Action-validate',
                            category: 'Test',
                            owner: 'AWS',
                            version: '1',
                            provider: 'CodeBuild',
                            inputArtifacts: ['SourceOutput'],
                            outputArtifacts: ['ValidateOutput'],
                            runOrder: 2,

                            configuration: {
                                ProjectName: `${config.projectName}-validate`
                            }
                        }
                    ]
                },
                {
                    name: 'Stage-plan',
                    action: [
                        {
                            name: 'Action-plan',
                            category: 'Test',
                            owner: 'AWS',
                            version: '1',
                            provider: 'CodeBuild',
                            inputArtifacts: ['ValidateOutput'],
                            outputArtifacts: ['PlanOutput'],
                            runOrder: 3,

                            configuration: {
                                ProjectName: `${config.projectName}-plan`
                            }
                        }
                    ]
                },
                {
                    name: 'Stage-apply',
                    action: [
                        {
                            name: 'Action-apply',
                            category: 'Build',
                            owner: 'AWS',
                            version: '1',
                            provider: 'CodeBuild',
                            inputArtifacts: ['PlanOutput'],
                            outputArtifacts: ['ApplyOutput'],
                            runOrder: 4,

                            configuration: {
                                ProjectName: `${config.projectName}-apply`
                            }
                        }
                    ]
                },
                // {
                //     name: 'Stage-destroy',
                //     action: [
                //         {
                //             name: 'Action-destroy',
                //             category: 'Build',
                //             owner: 'AWS',
                //             version: '1',
                //             provider: 'CodeBuild',
                //             inputArtifacts: ['ApplyOutput'],
                //             outputArtifacts: ['DestroyOutput'],
                //             runOrder: 5,
                //
                //             configuration: {
                //                 ProjectName: `${config.projectName}-destroy`
                //             }
                //         }
                //     ]
                // }
            ],

            dependsOn: [
                config.codebuild.resource,
                config.codepipelineRole.resource,
                config.replicationBucket.resource
            ]
        });
    }
}