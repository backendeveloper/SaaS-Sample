import {
    AdminAddUserToGroupCommand,
    AdminAddUserToGroupCommandOutput,
    AdminCreateUserCommand,
    AdminCreateUserResponse,
    AdminDisableUserCommand,
    AdminDisableUserCommandOutput,
    AdminGetUserCommand,
    AdminGetUserCommandOutput,
    AdminUpdateUserAttributesCommand,
    AdminUpdateUserAttributesCommandOutput,
    AttributeType,
    CognitoIdentityProviderClient,
    CreateGroupCommand,
    CreateGroupResponse,
    CreateUserPoolClientCommand,
    CreateUserPoolCommand,
    CreateUserPoolDomainCommand,
    ListUsersCommand,
    ListUsersCommandOutput,
    CreateUserPoolCommandOutput,
    CreateUserPoolClientCommandOutput,
    CreateUserPoolDomainCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";

export class UserManagement {
    private readonly cognitoClient: CognitoIdentityProviderClient;

    constructor(region: string | undefined) {
        if (region === null) {
            throw new Error('region not found');
        }

        this.cognitoClient = new CognitoIdentityProviderClient({region});
    }

    public createUserPool = async (tenantId: string, tenantUserpoolCallbackUrl: string): Promise<CreateUserPoolCommandOutput> => {
        const createUserPoolCommand = new CreateUserPoolCommand({
            PoolName: `${tenantId}-ServerlessSaaSUserPool`,
            AutoVerifiedAttributes: ['email'],
            AccountRecoverySetting: {
                RecoveryMechanisms: [
                    {
                        Priority: 1,
                        Name: 'verified_email'
                    }
                ]
            },
            Schema: [
                {
                    Name: 'email',
                    AttributeDataType: 'String',
                    Required: true
                },
                {
                    Name: 'tenantId',
                    AttributeDataType: 'String',
                    Required: false
                },
                {
                    Name: 'userRole',
                    AttributeDataType: 'String',
                    Required: false
                }
            ],
            AdminCreateUserConfig: {
                InviteMessageTemplate: {
                    EmailMessage: `Login into tenant UI application at ${tenantUserpoolCallbackUrl} with username {username} and temporary password {####}`,
                    EmailSubject: 'Your temporary password for tenant UI application'
                }
            }
        })

        return await this.commandExec(createUserPoolCommand);
    }

    public createUserPoolClient = async (tenantUserpoolCallbackUrl: string, userPoolId?: string): Promise<CreateUserPoolClientCommandOutput> => {
        const createUserPoolClientCommand = new CreateUserPoolClientCommand({
            UserPoolId: userPoolId,
            ClientName: 'ServerlessSaaSClient',
            GenerateSecret: false,
            AllowedOAuthFlowsUserPoolClient: true,
            AllowedOAuthFlows: ['code', 'implicit'],
            SupportedIdentityProviders: ['COGNITO'],
            CallbackURLs: [tenantUserpoolCallbackUrl],
            LogoutURLs: [tenantUserpoolCallbackUrl],
            AllowedOAuthScopes: ['email', 'openid', 'profile'],
            WriteAttributes: ['email', 'custom:tenantId']
        });

        return await this.commandExec(createUserPoolClientCommand);
    }

    public createUserPoolDomain = async (tenantId: string, userPoolId?: string): Promise<CreateUserPoolDomainCommandOutput> => {
        const createUserPoolDomainCommand = new CreateUserPoolDomainCommand({
            Domain: `${tenantId}-serverlesssaas`,
            UserPoolId: userPoolId
        });

        return await this.commandExec(createUserPoolDomainCommand);
    }

    public createUserGroup = async (groupName: string, userPoolId: string | undefined, description?: string): Promise<CreateGroupResponse> => {
        const createGroupCommand = new CreateGroupCommand({
            GroupName: groupName,
            UserPoolId: userPoolId,
            Description: description,
            Precedence: 0
        });

        return await this.commandExec(createGroupCommand);
    };

    public createTenantOrUserAdmin = async (userName: string, userPoolId: string | undefined, email: string, userRole: string, tenantId: string): Promise<AdminCreateUserResponse> => {
        const adminCreateUserCommand = new AdminCreateUserCommand({
            Username: userName,
            UserPoolId: userPoolId,
            ForceAliasCreation: true,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                },
                {
                    Name: 'email_verified',
                    Value: 'true'
                },
                {
                    Name: 'custom:userRole',
                    Value: userRole
                },
                {
                    Name: 'custom:tenantId',
                    Value: tenantId
                }
            ]
        });

        return await this.commandExec(adminCreateUserCommand);
    };

    public addUserToGroup = async (groupName: string | undefined, userPoolId: string | undefined, username: string): Promise<AdminAddUserToGroupCommandOutput> => {
        const adminAddUserToGroupCommand = new AdminAddUserToGroupCommand({
            GroupName: groupName,
            UserPoolId: userPoolId,
            Username: username
        });

        return await this.commandExec(adminAddUserToGroupCommand);
    };

    public listUsers = async (userPoolId: string | undefined): Promise<ListUsersCommandOutput> => {
        const listUsersCommand = new ListUsersCommand({
            UserPoolId: userPoolId
        });

        return await this.commandExec(listUsersCommand);
    };

    public getUserInfo = async (userPoolId: string | undefined, userName: string | undefined): Promise<AdminGetUserCommandOutput> => {
        const adminGetUserCommand = new AdminGetUserCommand({
            UserPoolId: userPoolId,
            Username: userName
        });

        return await this.commandExec(adminGetUserCommand);
    };

    public adminUpdateUserAttributes = async (userPoolId: string | undefined, userName: string | undefined, updatedUserAttributes: AttributeType[] | undefined): Promise<AdminUpdateUserAttributesCommandOutput> => {
        const adminUpdateUserAttributesCommand = new AdminUpdateUserAttributesCommand({
            UserPoolId: userPoolId,
            Username: userName,
            UserAttributes: updatedUserAttributes
        });

        return await this.commandExec(adminUpdateUserAttributesCommand);
    };

    public adminDisableUser = async (userPoolId: string | undefined, userName: string | undefined): Promise<AdminDisableUserCommandOutput> => {
        const adminDisableUserCommand = new AdminDisableUserCommand({
            UserPoolId: userPoolId,
            Username: userName
        });

        return await this.commandExec(adminDisableUserCommand);
    };

    private commandExec = async (command: any): Promise<any> => {
        return await this.cognitoClient.send(command);
    }
}