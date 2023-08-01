import {Construct} from "constructs";
import {TerraformVariable} from 'cdktf';
import {VariableResult} from "@core/models";

export class VariableConstruct extends Construct {
    public readonly resource: VariableResult;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const region = new TerraformVariable(scope, 'region', {
            default: 'eu-west-1',
            type: "string",
        });

        const accessKey = new TerraformVariable(scope, 'AWS_ACCESS_KEY_ID', {
            default: "",
            type: "string",
        });

        const secretKey = new TerraformVariable(scope, 'AWS_SECRET_ACCESS_KEY', {
            default: "",
            type: "string",
        });

        const domainName = new TerraformVariable(scope, 'DOMAIN_NAME', {
            default: 'masraff.io',
            type: "string",
        });

        const environment = new TerraformVariable(scope, 'ENVIRONMENT', {
            default: 'dev',
            type: "string",
        });

        const accountId = new TerraformVariable(scope, 'ACCOUNT_ID', {
            default: '933968378937',
            type: "string",
        });

        const adminMainUserEmail = new TerraformVariable(scope, 'ADMIN_MAIN_USER_EMAIL', {
            default: 'kaan@masraff.co',
            type: "string",
        });

        const adminMainUserRoleName = new TerraformVariable(scope, 'ADMIN_MAIN_USER_ROLE_NAME', {
            default: 'SystemAdmin',
            type: "string",
        });

        const layerInsightsExtensionArn = new TerraformVariable(scope, "INSIGHTS_EXTENSION_LAYER_ARN", {
            default: 'arn:aws:lambda:eu-west-1:580247275435:layer:LambdaInsightsExtension:33',
            type: "string",
        });

        const adminBucketName = new TerraformVariable(scope, "ADMIN_BUCKET_NAME", {
            default: 'saas-admin-client-bucket',
            type: "string",
        });

        const adminLogBucketName = new TerraformVariable(scope, "ADMIN_LOG_BUCKET_NAME", {
            default: 'saas-admin-client-logs-bucket',
            type: "string",
        });

        const applicationBucketName = new TerraformVariable(scope, "APPLICATION_BUCKET_NAME", {
            default: 'saas-application-client-bucket',
            type: "string",
        });

        const applicationLogBucketName = new TerraformVariable(scope, "APPLICATION_LOG_BUCKET_NAME", {
            default: 'saas-application-client-logs-bucket',
            type: "string",
        });

        const defaultCacheBehaviorCachePolicyId = new TerraformVariable(scope, "DEFAULT_CACHE_BEHAVIOR_CACHE_POLICY_ID", {
            default: '658327ea-f89d-4fab-a63d-7e88639e58f6',
            description: 'Managed-CachingOptimized',
            type: "string",
        });

        const defaultCacheBehaviorOriginRequestPolicyId = new TerraformVariable(scope, "DEFAULT_CACHE_BEHAVIOR_ORIGIN_REQUEST_POLICY_ID", {
            default: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
            description: 'Managed-CORS-S3Origin',
            type: "string",
        });

        const defaultCacheBehaviorResponseHeadersPolicyId = new TerraformVariable(scope, "DEFAULT_CACHE_BEHAVIOR_RESPONSE_HEADERS_POLICY_ID", {
            default: '67f7725c-6f97-4210-82d7-5512b31e9d03',
            description: 'Managed-SecurityHeadersPolicy',
            type: "string",
        });

        const sharedApiSubDomainName = new TerraformVariable(scope, 'SHARED_API_SUBDOMAIN_NAME', {
            default: 'shared.api',
            type: "string",
        });

        const pooledApiSubDomainName = new TerraformVariable(scope, 'POOLED_API_SUBDOMAIN_NAME', {
            default: 'pooled.api',
            type: "string",
        });

        const adminClientSubDomainName = new TerraformVariable(scope, "ADMIN_CLIENT_SUBDOMAIN_NAME", {
            default: 'admins',
            description: 'https://dev.admins.masraff.io',
            type: "string",
        });

        const applicationClientSubDomainName = new TerraformVariable(scope, "APPLICATION_CLIENT_SUBDOMAIN_NAME", {
            default: 'application',
            description: 'https://dev.application.masraff.io',
            type: "string",
        });

        const operationUserpoolSubDomainName = new TerraformVariable(scope, "OPERATION_USERPOOL_SUBDOMAIN_NAME", {
            default: 'operation-auth',
            type: "string",
        });

        const pooledUserpoolSubDomainName = new TerraformVariable(scope, "POOLED_USERPOOL_SUBDOMAIN_NAME", {
            default: 'pooled-auth',
            type: "string",
        });

        this.resource = {
            region: region,
            accessKey: accessKey,
            secretKey: secretKey,
            accountId: accountId,
            environment: environment,
            domainName: domainName,

            sharedApiSubDomainName: sharedApiSubDomainName,
            pooledApiSubDomainName: pooledApiSubDomainName,

            adminMainUserEmail: adminMainUserEmail,
            adminMainUserRoleName: adminMainUserRoleName,

            adminBucketName: adminBucketName,
            adminLogBucketName: adminLogBucketName,
            adminClientSubDomainName: adminClientSubDomainName,

            applicationBucketName: applicationBucketName,
            applicationLogBucketName: applicationLogBucketName,
            applicationClientSubDomainName: applicationClientSubDomainName,

            layerInsightsExtensionArn: layerInsightsExtensionArn,
            defaultCacheBehaviorCachePolicyId: defaultCacheBehaviorCachePolicyId,
            defaultCacheBehaviorOriginRequestPolicyId: defaultCacheBehaviorOriginRequestPolicyId,
            defaultCacheBehaviorResponseHeadersPolicyId: defaultCacheBehaviorResponseHeadersPolicyId,
            operationUserpoolSubDomainName: operationUserpoolSubDomainName,
            pooledUserpoolSubDomainName: pooledUserpoolSubDomainName
        }
    }
}
