import {Construct} from "constructs";
// import * as awsProvider from "@providers/aws";
import * as core from "@core/index";

import {CodepipelineRoleConstruct} from "./codepipeline-role";
import {CodepipelineBucketConstruct} from "./codepipeline-bucket";
import {CodecommitConstruct} from "./codecommit";

type TenantPipelineConfig = {
    variable: core.VariableResult;
};

export class TenantPipelineConstruct extends Construct {
    // public readonly tenantDetailsTable: DynamodbTable;

    constructor(scope: Construct, id: string, config: TenantPipelineConfig) {
        super(scope, id);

        const projectName = 'saas-project';
        const sourceRepoName = 'saas';
        const sourceRepoBranch = 'master';
        const repoApproversArn = `arn:aws:sts::${config.variable.accountId.value}:assumed-role/CodeCommitReview/*`;
        // const buildProjects = [''];

        const codepipelineBucket = new CodepipelineBucketConstruct(this, 'codepipeline_bucket', {
            ...config,
            projectName
        });

        // const replicationBucket = new ReplicationBucketConstruct(this, 'replication_bucket', {
        //     ...config,
        //     projectName,
        //     codepipelineBucket
        // });

        new CodepipelineRoleConstruct(this, 'codepipeline_role', {
            ...config,
            codepipelineBucket,
            // replicationBucket,
            projectName
        });

        new CodecommitConstruct(this, 'codecommit', {
            ...config,
            sourceRepoName,
            sourceRepoBranch,
            repoApproversArn
        });

        // const codebuild = new CodebuildConstruct(this, 'codebuild', {
        //     ...config,
        //     codepipelineRole,
        //     buildProjects,
        //     projectName,
        //     codecommit
        // });

        // new CodepipelineConstruct(this, 'codepipeline', {
        //     ...config,
        //     codepipelineRole,
        //     codepipelineBucket,
        //     replicationBucket,
        //     codebuild,
        //     sourceRepoName,
        //     sourceRepoBranch,
        //     projectName,
        // });


        // const bucket = new Bucket(this, 'artifacts_bucket', {
        //     bucketPrefix: 'test-codepipeline',
        //     acl: 'private'
        // });
        //
        // const s3KmsKey = new awsProvider.dataAwsKmsAlias.DataAwsKmsAlias(this, 'artifacts_bucket_kms_key', {
        //     name: 'alias/myKmsKey'
        // });

        // const codecommitRepository = new awsProvider.codecommitRepository.CodecommitRepository(this, 'codecommit_repository', {
        //     repositoryName: 'saas-repo',
        //     defaultBranch: 'master',
        //     description: 'Code Repository for hosting the terraform code and pipeline configuration files'
        // });
        //
        // const codecommitApprovalRuleTemplate = new awsProvider.codecommitApprovalRuleTemplate.CodecommitApprovalRuleTemplate(this, 'codecommit_approval_rule_template', {
        //     name: `${codecommitRepository.repositoryName}-${codecommitRepository.defaultBranch}-Rule`,
        //     description: 'Approval rule template for enabling approval process',
        //     content: Fn.jsonencode({
        //         Version: '2018-11-08',
        //         DestinationReferences: [`refs/heads/${codecommitRepository.defaultBranch}`],
        //         Statements: [
        //             {
        //                 Type: 'Approvers',
        //                 NumberOfApprovalsNeeded: 2,
        //                 ApprovalPoolMembers: [`arn:aws:sts::${config.variable.accountId.value}:assumed-role/CodeCommitReview/*`]
        //             }
        //         ]
        //     }),
        //
        //     dependsOn: [codecommitRepository, config.variable.accountId]
        // });
        //
        // new awsProvider.codecommitApprovalRuleTemplateAssociation.CodecommitApprovalRuleTemplateAssociation(this, 'codecommit_approval_rule_template_association', {
        //     approvalRuleTemplateName: codecommitApprovalRuleTemplate.name,
        //     repositoryName: codecommitRepository.repositoryName,
        //
        //     dependsOn: [codecommitApprovalRuleTemplate, codecommitRepository]
        // });

        // const codestarConnection = new awsProvider.codestarconnectionsConnection.CodestarconnectionsConnection(this, 'codestar_connection', {
        //     name: 'github-connection',
        //     providerType: 'GitHub'
        // });
        //
        // new awsProvider.codepipeline.Codepipeline(this, 'resource', {
        //     name: 'saas-pipeline',
        //     roleArn: codepipelineRole.resource.arn,
        //
        //     artifactStore: [
        //         {
        //             location: codepipelineBucket.resource.s3BucketIdOutput,
        //             type: 'S3',
        //
        //             encryptionKey: {
        //                 id: codepipelineRole.kmsKey.arn,
        //                 type: 'KMS'
        //             }
        //         }
        //     ],
        //
        //     stage: [
        //         {
        //             name: 'Source',
        //             action: [
        //                 {
        //                     name: 'Source',
        //                     category: 'Source',
        //                     owner: 'AWS',
        //                     provider: 'CodeStarSourceConnection',
        //                     version: '1',
        //                     namespace: 'SourceVariables',
        //                     outputArtifacts: ['SourceOutput'],
        //                     runOrder: 1,
        //
        //                     configuration: {
        //                         ConnectionArn: codestarConnection.arn,
        //                         FullRepositoryId: "Masraff/saas",
        //                         BranchName: "master"
        //                         // RepositoryName: codecommitRepository.repositoryName,
        //                         // BranchName: 'main',
        //                         // PollForSourceChanges: 'true'
        //                     }
        //                 }
        //             ]
        //         },
        //         {
        //             name: 'Stage-validate',
        //             action: [
        //                 {
        //                     name: 'Action-validate',
        //                     category: 'Test',
        //                     owner: 'AWS',
        //                     provider: 'CodeBuild',
        //                     version: '1',
        //                     inputArtifacts: ['SourceOutput'],
        //                     outputArtifacts: ['ValidateOutput'],
        //                     runOrder: 2,
        //
        //                     configuration: {
        //                         ProjectName: `${projectName}-validate`
        //                     }
        //                 }
        //             ]
        //         },
        //         // {
        //         //     name: 'Deploy',
        //         //     action: [
        //         //         {
        //         //             name: 'Deploy',
        //         //             category: 'Deploy',
        //         //             owner: 'AWS',
        //         //             provider: 'CloudFormation',
        //         //             version: '1',
        //         //             inputArtifacts: ['build_output'],
        //         //
        //         //             configuration: {
        //         //                 ActionMode: "REPLACE_ON_FAILURE",
        //         //                 Capabilities: "CAPABILITY_AUTO_EXPAND,CAPABILITY_IAM",
        //         //                 OutputFileName: "CreateStackOutput.json",
        //         //                 StackName: "MyStack",
        //         //                 TemplatePath: "build_output::sam-templated.yaml"
        //         //             }
        //         //         }
        //         //     ]
        //         // }
        //     ]
        // });
    }
}