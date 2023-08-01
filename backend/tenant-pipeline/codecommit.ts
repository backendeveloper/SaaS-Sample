import {Construct} from "constructs";
import {Fn} from "cdktf";
import * as awsProvider from "@providers/aws";
import {CodecommitRepository} from "@providers/aws/codecommit-repository";
import {CodecommitApprovalRuleTemplate} from "@providers/aws/codecommit-approval-rule-template";
import {CodecommitApprovalRuleTemplateAssociation} from "@providers/aws/codecommit-approval-rule-template-association";
import * as core from "@core/index";

type CodecommitConfig = {
    variable: core.VariableResult;
    sourceRepoName: string;
    sourceRepoBranch: string;
    repoApproversArn: string;
};

export class CodecommitConstruct extends Construct {
    public readonly sourceRepository: CodecommitRepository;
    public readonly sourceRepositoryApprovalRuleTemplate: CodecommitApprovalRuleTemplate;
    public readonly sourceRepositoryApprovalAssociation: CodecommitApprovalRuleTemplateAssociation;

    constructor(scope: Construct, id: string, config: CodecommitConfig) {
        super(scope, id);

        const sourceRepository = new awsProvider.codecommitRepository.CodecommitRepository(this, 'source_repository', {
            repositoryName: config.sourceRepoName,
            defaultBranch: config.sourceRepoBranch,
            description: 'Code Repository for hosting the terraform code and pipeline configuration files'
        });

        const sourceRepositoryApprovalRuleTemplate = new awsProvider.codecommitApprovalRuleTemplate.CodecommitApprovalRuleTemplate(this, 'source_repository_approval_rule_template', {
            name: `${config.sourceRepoName}-${config.sourceRepoBranch}-Rule`,
            description: 'Approval rule template for enabling approval process',

            content: Fn.jsonencode({
                Version: '2018-11-08',
                DestinationReferences: ['refs/heads/' + config.sourceRepoBranch],
                Statements: [
                    {
                        Type: 'Approvers',
                        NumberOfApprovalsNeeded: 2,
                        ApprovalPoolMembers: [config.repoApproversArn]
                    }
                ]
            })
        });

        const sourceRepositoryApprovalAssociation = new awsProvider.codecommitApprovalRuleTemplateAssociation.CodecommitApprovalRuleTemplateAssociation(this, 'source_repository_approval_association', {
            approvalRuleTemplateName: sourceRepositoryApprovalRuleTemplate.name,
            repositoryName: sourceRepository.repositoryName
        });

        this.sourceRepository = sourceRepository;
        this.sourceRepositoryApprovalRuleTemplate = sourceRepositoryApprovalRuleTemplate;
        this.sourceRepositoryApprovalAssociation = sourceRepositoryApprovalAssociation;
    }
}