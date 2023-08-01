import {TerraformVariable} from "cdktf";

export type VariableResult = {
    region: TerraformVariable;
    accessKey: TerraformVariable;
    secretKey: TerraformVariable;
    accountId: TerraformVariable;
    environment: TerraformVariable;
    domainName: TerraformVariable

    sharedApiSubDomainName: TerraformVariable;
    pooledApiSubDomainName: TerraformVariable;

    adminBucketName: TerraformVariable;
    adminLogBucketName: TerraformVariable;
    adminClientSubDomainName: TerraformVariable;
    applicationBucketName: TerraformVariable;
    applicationLogBucketName: TerraformVariable;
    applicationClientSubDomainName: TerraformVariable;

    operationUserpoolSubDomainName: TerraformVariable;
    pooledUserpoolSubDomainName: TerraformVariable;
    adminMainUserEmail: TerraformVariable;
    adminMainUserRoleName: TerraformVariable;

    layerInsightsExtensionArn: TerraformVariable;
    defaultCacheBehaviorCachePolicyId: TerraformVariable;
    defaultCacheBehaviorOriginRequestPolicyId: TerraformVariable;
    defaultCacheBehaviorResponseHeadersPolicyId: TerraformVariable;
}