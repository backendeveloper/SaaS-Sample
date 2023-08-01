import {Construct} from "constructs";
import {Fn} from "cdktf";
import * as awsProvider from "@providers/aws";
import * as core from "@core/index";

import {IamRole} from "@providers/aws/iam-role";
import {DatabaseConstruct} from "./database";

type AccessRoleConfig = {
    variable: core.VariableResult;
    database: DatabaseConstruct;
}

export class AccessRoleConstruct extends Construct {
    public readonly authorizerLambdaAccessRole: IamRole;
    public readonly authorizerLambdaExecutionRole: IamRole;

    constructor(scope: Construct, id: string, config: AccessRoleConfig) {
        super(scope, id);

        const managedPolicyArns = [
            'arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy',
            'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
            'arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess'
        ];
        const dependsOn = [
            config.variable.region,
            config.variable.environment,
            config.variable.accountId
        ];

        const authorizerLambdaExecutionRole = new awsProvider.iamRole.IamRole(this, 'authorizer_lambda_execution_role', {
            name: `saas-authorizer-execution-role-${config.variable.region.value}-${config.variable.environment.value}`,
            path: '/authorizer/',
            assumeRolePolicy: Fn.jsonencode({
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'sts:AssumeRole',
                        Effect: 'Allow',
                        Principal: {
                            Service: 'lambda.amazonaws.com'
                        }
                    },
                ]
            }),
            managedPolicyArns,
            inlinePolicy: [
                {
                    name: `saas-authorizer-execution-role-policy-${config.variable.region.value}-${config.variable.environment.value}`,
                    policy: Fn.jsonencode({
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Action: ['cognito-idp:List*'],
                                Resource: [`arn:aws:cognito-idp:${config.variable.region.value}:${config.variable.accountId.value}:userpool/*`]
                            },
                            {
                                Effect: 'Allow',
                                Action: ['dynamodb:GetItem'],
                                Resource: [config.database.tenantDetailsTable.dynamodbTableArnOutput]
                            },
                            {
                                Effect: 'Allow',
                                Action: [
                                    'logs:PutLogEvents',
                                    'logs:CreateLogStream',
                                    'logs:CreateLogGroup'
                                ],
                                Resource: [
                                    `arn:aws:logs:${config.variable.region.value}:${config.variable.accountId.value}:log-group:/aws/lambda/saas-authorizer-lambda_${config.variable.environment.value}:*:*`,
                                    `arn:aws:logs:${config.variable.region.value}:${config.variable.accountId.value}:log-group:/aws/lambda/saas-authorizer-lambda_${config.variable.environment.value}:*`
                                ]
                            }
                        ]
                    }),
                }
            ],
            forceDetachPolicies: true,

            dependsOn: [
                ...dependsOn,
                config.database.tenantDetailsTable
            ]
        });
        const authorizerLambdaAccessRole = new awsProvider.iamRole.IamRole(this, 'authorizer_lambda_access_role', {
            name: `saas-authorizer-access-role-${config.variable.region.value}-${config.variable.environment.value}`,
            path: '/authorizer/',
            assumeRolePolicy: Fn.jsonencode({
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'sts:AssumeRole',
                        Effect: 'Allow',
                        Principal: {
                            AWS: [authorizerLambdaExecutionRole.arn]
                        }
                    },
                ]
            }),
            managedPolicyArns,
            inlinePolicy: [
                {
                    name: `saas-authorizer-access-role-policy-${config.variable.region.value}-${config.variable.environment.value}`,
                    policy: Fn.jsonencode({
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Action: [
                                    'dynamodb:BatchGetItem',
                                    'dynamodb:GetItem',
                                    'dynamodb:PutItem',
                                    'dynamodb:DeleteItem',
                                    'dynamodb:UpdateItem',
                                    'dynamodb:Query',
                                    'dynamodb:Scan'
                                ],
                                Resource: [`arn:aws:dynamodb:${config.variable.region.value}:${config.variable.accountId.value}:table/*`]
                            },
                        ]
                    }),
                }
            ],
            forceDetachPolicies: true,

            dependsOn: [
                ...dependsOn,
                authorizerLambdaExecutionRole
            ]
        });

        this.authorizerLambdaExecutionRole = authorizerLambdaExecutionRole;
        this.authorizerLambdaAccessRole = authorizerLambdaAccessRole;
    }
}