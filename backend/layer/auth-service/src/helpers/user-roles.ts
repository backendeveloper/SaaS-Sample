import {EffectType, ServiceIdentifierType, UserRoleType} from "../types";
import {IPolicyDocument, IStatement} from "../interfaces";
import {Fn} from "cdktf";

export class UserRoles {
    private readonly region: string | undefined;
    private readonly accountId: string | undefined;
    private readonly version: string;
    private readonly tenantUserMappingTableArn: string;
    private readonly tenantDetailsTableArn: string;
    private readonly productTableArn: string;
    private readonly orderTableArn: string;

    constructor(region: string | undefined, accountId: string | undefined, tenantUserMappingTableArn?: string, tenantDetailsTableArn?: string, productTableArn?: string, orderTableArn?: string) {
        if (region === null || accountId === null) {
            throw new Error('region or accountId not found');
        }

        this.region = region;
        this.accountId = accountId;
        this.version = '2012-10-17';
        this.tenantUserMappingTableArn = tenantUserMappingTableArn || '';
        this.tenantDetailsTableArn = tenantDetailsTableArn || '';
        this.productTableArn = Fn.replace(productTableArn || '', 'pooled', '*');
        this.orderTableArn = Fn.replace(orderTableArn || '', 'pooled', '*');
    }

    public isTenantAdmin = (userRole: string): boolean => userRole == UserRoleType.TENANT_ADMIN;
    public isSystemAdmin = (userRole: string): boolean => userRole == UserRoleType.SYSTEM_ADMIN;
    public isSaaSProvider = (userRole: string): boolean => userRole == UserRoleType.SYSTEM_ADMIN || userRole == UserRoleType.CUSTOMER_SUPPORT;
    public isTenantUser = (userRole: string): boolean => userRole == UserRoleType.TENANT_USER;

    public getPolicyForUser = (userRole: string, serviceIdentifier: ServiceIdentifierType, tenantId: string): string => {
        switch (userRole) {
            case UserRoleType.SYSTEM_ADMIN:
                return this.getPolicyForSystemAdmin();
            case UserRoleType.TENANT_ADMIN:
                return this.getPolicyForTenantAdmin(tenantId, serviceIdentifier);
            case UserRoleType.TENANT_USER:
                return this.getPolicyForTenantUser(tenantId);

            default:
                throw new Error(`Non-existent size in switch: ${userRole}`);
        }
    };

    private getPolicyForSystemAdmin = (): string => {
        const policy: IPolicyDocument = {
            Version: this.version,
            Statement: [
                {
                    Effect: EffectType.ALLOW,
                    Action: [
                        'dynamodb:UpdateItem',
                        'dynamodb:GetItem',
                        'dynamodb:PutItem',
                        'dynamodb:DeleteItem',
                        'dynamodb:Query',
                        'dynamodb:Scan'
                    ],
                    Resource: [
                        `arn:aws:dynamodb:${this.region}:${this.accountId}:table/*`,
                    ]
                }
            ]
        };

        return JSON.stringify(policy);
    };

    private getPolicyForTenantAdmin = (tenantId: string, serviceIdentifier: ServiceIdentifierType): string => {
        let policy: IPolicyDocument = {
            Version: this.version,
            Statement: []
        };

        if (serviceIdentifier == ServiceIdentifierType.SHARED_SERVICES) {
            const baseStatement: IStatement = {
                Effect: EffectType.ALLOW,
                Action: [
                    'dynamodb:UpdateItem',
                    'dynamodb:PutItem',
                    'dynamodb:DeleteItem',
                    'dynamodb:Query'
                ],
                Resource: []
            };

            policy.Statement = [
                {
                    ...baseStatement,
                    Resource: [
                        this.tenantUserMappingTableArn,
                        this.tenantDetailsTableArn
                    ],
                    Condition: {
                        'ForAllValues:StringEquals': {
                            // 'dynamodb:LeadingKeys': [`${tenantId}-*`]
                            'dynamodb:LeadingKeys': [tenantId]
                        }
                    }
                },
                {
                    ...baseStatement,
                    Action: [
                        ...baseStatement.Action,
                        'dynamodb:DeleteItem'
                    ],
                    Resource: [
                        `arn:aws:dynamodb:${this.region}:${this.accountId}:table/ServerlessSaaS-TenantStackMapping`,
                        `arn:aws:dynamodb:${this.region}:${this.accountId}:table/ServerlessSaaS-Settings`
                    ]
                }
            ];
        } else if (serviceIdentifier == ServiceIdentifierType.BUSINESS_SERVICES) {
            const baseStatement: IStatement = {
                Effect: EffectType.ALLOW,
                Action: [
                    'dynamodb:UpdateItem',
                    'dynamodb:GetItem',
                    'dynamodb:PutItem',
                    'dynamodb:DeleteItem',
                    'dynamodb:Query'
                ],
                Resource: [],
                Condition: {
                    'ForAllValues:StringEquals': {
                        'dynamodb:LeadingKeys': [`${tenantId}-*`]
                    }
                }
            };

            policy.Statement = [
                {
                    ...baseStatement,
                    Resource: [this.productTableArn]
                },
                {
                    ...baseStatement,
                    Resource: [this.orderTableArn]
                }
            ];
        } else {
            throw new Error(`Non-existent size in switch: ${serviceIdentifier}`);
        }

        return JSON.stringify(policy);
    };

    private getPolicyForTenantUser = (tenantId: string): string => {
        const baseStatement: IStatement = {
            Effect: EffectType.ALLOW,
            Action: [
                'dynamodb:UpdateItem',
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query'
            ],
            Resource: [],
            Condition: {
                'ForAllValues:StringEquals': {
                    'dynamodb:LeadingKeys': [`${tenantId}-*`]
                }
            }
        };

        const policy: IPolicyDocument = {
            Version: this.version,
            Statement: [
                {
                    ...baseStatement,
                    Resource: [this.productTableArn]
                },
                {
                    ...baseStatement,
                    Resource: [this.orderTableArn]
                }
            ]
        };

        return JSON.stringify(policy);
    };
}