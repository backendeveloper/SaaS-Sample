import {Construct} from "constructs";
import * as awsProvider from "@providers/aws";
import {AwsProvider} from "@providers/aws/provider";
import {DataAwsRoute53Zone} from "@providers/aws/data-aws-route53-zone";
import {CognitoUserPool} from "@providers/aws/cognito-user-pool";
import {CognitoUserPoolClient} from "@providers/aws/cognito-user-pool-client";
import {CognitoUserPoolDomain} from "@providers/aws/cognito-user-pool-domain";
import {Certificate} from "@modules/certificate";
import * as core from "@core/index";

import {ClientsConstruct} from "../clients";

type AuthConfig = {
    variable: core.VariableResult;
    zone: DataAwsRoute53Zone;
    awsGlobalRegionProvider: AwsProvider;
    clients: ClientsConstruct;
}

export class AuthConstruct extends Construct {
    public readonly pooledTenantUserPool: CognitoUserPool;
    public readonly pooledTenantUserPoolClient: CognitoUserPoolClient;
    public readonly pooledUserPoolDomain: CognitoUserPoolDomain;

    public readonly operationUsersUserPool: CognitoUserPool;
    public readonly operationUsersUserPoolClient: CognitoUserPoolClient;
    public readonly operationUserPoolDomain: CognitoUserPoolDomain;

    constructor(scope: Construct, id: string, config: AuthConfig) {
        super(scope, id);

        const pooledUserpoolDomainName = `${core.getSubDomainWithEnvironment(config, config.variable.pooledUserpoolSubDomainName.value, '-')}.${config.variable.domainName.value}`
        const operationUserpoolDomainName = `${core.getSubDomainWithEnvironment(config, config.variable.operationUserpoolSubDomainName.value, '-')}.${config.variable.domainName.value}`
        const certificate = new Certificate(this, 'certificate', {
            domainName: config.variable.domainName.value,
            zoneId: config.zone.zoneId,
            subjectAlternativeNames: [
                `${pooledUserpoolDomainName}`,
                `${operationUserpoolDomainName}`
            ],
            waitForValidation: true,
            validationMethod: 'DNS',

            providers: [config.awsGlobalRegionProvider],

            dependsOn: [
                config.variable.domainName,
                config.variable.pooledUserpoolSubDomainName,
                config.variable.operationUserpoolSubDomainName,
                config.zone
            ]
        });

        const pooledTenantUserPool = new awsProvider.cognitoUserPool.CognitoUserPool(this, 'pooled_tenant_user_pool', {
            name: `saas-pooled-tenant-user-pool_${config.variable.environment.value}`,
            autoVerifiedAttributes: ['email'],
            accountRecoverySetting: {
                recoveryMechanism: [
                    {
                        name: 'verified_email',
                        priority: 1
                    }
                ]
            },
            adminCreateUserConfig: {
                inviteMessageTemplate: {
                    emailMessage: `Login into tenant UI application at https://${config.clients.applicationCloudfront.cloudfrontDistributionDomainNameOutput}/ with username {username} and temporary password {####}`,
                    smsMessage: `Login into tenant UI application at https://${config.clients.applicationCloudfront.cloudfrontDistributionDomainNameOutput}/ with username {username} and temporary password {####}`,
                    emailSubject: 'Your temporary password for tenant UI application'
                }
            },
            schema: [
                {
                    name: 'email',
                    attributeDataType: 'String',
                    required: true,
                    mutable: true,
                    stringAttributeConstraints: {
                        minLength: '1',
                        maxLength: '256'
                    }
                },
                {
                    name: 'tenantId',
                    attributeDataType: 'String',
                    stringAttributeConstraints: {
                        minLength: '1',
                        maxLength: '256'
                    }
                },
                {
                    name: 'userRole',
                    attributeDataType: 'String',
                    required: false,
                    mutable: true,
                    stringAttributeConstraints: {
                        minLength: '1',
                        maxLength: '256'
                    }
                },
            ],

            dependsOn: [config.variable.environment, config.clients.applicationCloudfront]
        });
        const pooledTenantUserPoolClient = new awsProvider.cognitoUserPoolClient.CognitoUserPoolClient(this, 'pooled_tenant_user_pool_client', {
            name: `saas-pooled-tenant-user-pool-client_${config.variable.environment.value}`,
            generateSecret: false,
            userPoolId: pooledTenantUserPool.id,
            allowedOauthFlowsUserPoolClient: true,
            allowedOauthFlows: ['code', 'implicit'],
            supportedIdentityProviders: ['COGNITO'],
            callbackUrls: [`https://${config.clients.applicationCloudfront.cloudfrontDistributionDomainNameOutput}/`],
            logoutUrls: [`https://${config.clients.applicationCloudfront.cloudfrontDistributionDomainNameOutput}/`],
            allowedOauthScopes: ['email', 'openid', 'profile'],
            writeAttributes: ['email', 'custom:tenantId', 'custom:userRole'],

            dependsOn: [pooledTenantUserPool, config.variable.environment, config.clients.applicationCloudfront]
        });
        const pooledUserPoolDomain = new awsProvider.cognitoUserPoolDomain.CognitoUserPoolDomain(this, 'pooled_tenant_user_pool_domain', {
            domain: pooledUserpoolDomainName,
            userPoolId: pooledTenantUserPool.id,
            certificateArn: certificate.acmCertificateArnOutput,

            dependsOn: [
                pooledTenantUserPool,
                config.variable.accountId,
                config.variable.domainName,
                config.variable.pooledUserpoolSubDomainName,
                certificate
            ]
        });

        const operationUserPool = new awsProvider.cognitoUserPool.CognitoUserPool(this, 'operation_user_pool', {
            name: `saas-operation-tenant-user-pool_${config.variable.environment.value}`,
            autoVerifiedAttributes: ['email'],
            accountRecoverySetting: {
                recoveryMechanism: [
                    {
                        name: 'verified_email',
                        priority: 1
                    }
                ]
            },
            adminCreateUserConfig: {
                inviteMessageTemplate: {
                    emailMessage: `Login into admin UI application at https://${config.clients.adminCloudfront.cloudfrontDistributionDomainNameOutput}/ with username {username} and temporary password {####}`,
                    smsMessage: `Login into admin UI application at https://${config.clients.adminCloudfront.cloudfrontDistributionDomainNameOutput}/ with username {username} and temporary password {####}`,
                    emailSubject: 'Your temporary password for admin UI application'
                }
            },
            schema: [
                {
                    name: 'email',
                    attributeDataType: 'String',
                    required: true,
                    mutable: true,
                    stringAttributeConstraints: {
                        minLength: '1',
                        maxLength: '256'
                    }
                },
                {
                    name: 'tenantId',
                    attributeDataType: 'String',
                    stringAttributeConstraints: {
                        minLength: '1',
                        maxLength: '256'
                    }
                },
                {
                    name: 'userRole',
                    attributeDataType: 'String',
                    required: false,
                    mutable: true,
                    stringAttributeConstraints: {
                        minLength: '1',
                        maxLength: '256'
                    }
                },
            ],

            dependsOn: [config.variable.environment, config.clients.adminCloudfront]
        });
        const operationUserPoolClient = new awsProvider.cognitoUserPoolClient.CognitoUserPoolClient(this, 'operation_user_pool_client', {
            name: `saas-operation-tenant-user-pool-client_${config.variable.environment.value}`,
            generateSecret: false,
            userPoolId: operationUserPool.id,
            allowedOauthFlowsUserPoolClient: true,
            allowedOauthFlows: ['code', 'implicit'],
            supportedIdentityProviders: ['COGNITO'],
            callbackUrls: [`https://${config.clients.adminCloudfront.cloudfrontDistributionDomainNameOutput}/`],
            logoutUrls: [`https://${config.clients.adminCloudfront.cloudfrontDistributionDomainNameOutput}/`],
            allowedOauthScopes: ['email', 'openid', 'profile'],
            writeAttributes: ['email', 'custom:tenantId', 'custom:userRole'],

            dependsOn: [operationUserPool, config.variable.environment, config.clients.adminCloudfront]
        });
        const operationUserPoolDomain = new awsProvider.cognitoUserPoolDomain.CognitoUserPoolDomain(this, 'operation_user_pool_domain', {
            domain: operationUserpoolDomainName,
            userPoolId: operationUserPool.id,
            certificateArn: certificate.acmCertificateArnOutput,

            dependsOn: [
                operationUserPool,
                config.variable.accountId,
                config.variable.domainName,
                config.variable.operationUserpoolSubDomainName,
                certificate
            ]
        });

        // Create Group Command:
        // aws cognito-idp create-group --group-name SystemAdmins --user-pool-id eu-west-1_ALPcaNdKx --description "Admin user group" --precedence 0

        // Create Admin User Command:
        // aws cognito-idp admin-create-user --user-pool-id eu-west-1_ALPcaNdKx \
        // --username admin --temporary-password K8ULfajZy5TTaJ@ \
        // --user-attributes Name="email",Value="kaan@masraff.co" Name="custom:tenantId",Value="system_admins" Name="custom:userRole",Value="SystemAdmin" \
        // --validation-data Name="email",Value="kaan@masraff.co" \
        // --force-alias-creation

        // Add User To Group Command:
        // aws cognito-idp admin-add-user-to-group \
        // --user-pool-id eu-west-1_ALPcaNdKx \
        // --username admin \
        // --group-name SystemAdmins

        new awsProvider.route53Record.Route53Record(this, 'pooled_record', {
            zoneId: config.zone.zoneId,
            name: pooledUserPoolDomain.cloudfrontDistribution,
            type: 'A',

            alias: {
                name: pooledUserPoolDomain.cloudfrontDistribution,
                zoneId: pooledUserPoolDomain.cloudfrontDistributionZoneId,
                evaluateTargetHealth: false
            },

            dependsOn: [pooledUserPoolDomain, config.zone]
        });
        new awsProvider.route53Record.Route53Record(this, 'operation_record', {
            zoneId: config.zone.zoneId,
            name: operationUserPoolDomain.cloudfrontDistribution,
            type: 'A',

            alias: {
                name: operationUserPoolDomain.cloudfrontDistribution,
                zoneId: operationUserPoolDomain.cloudfrontDistributionZoneId,
                evaluateTargetHealth: false
            },

            dependsOn: [operationUserPoolDomain, config.zone]
        });

        this.operationUsersUserPool = operationUserPool;
        this.operationUsersUserPoolClient = operationUserPoolClient;
        this.operationUserPoolDomain = operationUserPoolDomain;

        this.pooledTenantUserPool = pooledTenantUserPool;
        this.pooledTenantUserPoolClient = pooledTenantUserPoolClient;
        this.pooledUserPoolDomain = pooledUserPoolDomain;
    }
}