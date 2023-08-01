import {APIGatewayIAMAuthorizerWithContextResult, ConditionBlock, Statement} from 'aws-lambda';

import {AuthContextResponse} from "../models";
import {EffectType, HttpVerbType} from "../types";

export class AuthPolicy {
    accountId: string | undefined;
    principalId = '';
    version = '2012-10-17';
    pathRegex = "^[/.a-zA-Z0-9-*]+$";
    restApiId = '*';
    region = "*";
    stage = '*';
    statementList: Statement[] = [];

    constructor(principalId: string, accountId: string | undefined) {
        if (principalId === null || accountId === null) {
            throw new Error('PrincipalId or AccountId not found');
        }

        this.principalId = principalId;
        this.accountId = accountId;
    }

    public allowMethod = async (verb: HttpVerbType, resource: string, condition?: ConditionBlock | undefined): Promise<void> => {
        this.addMethod(EffectType.ALLOW, verb, resource, condition);
    }

    public denyMethod = async (verb: HttpVerbType, resource: string, condition?: ConditionBlock | undefined): Promise<void> => {
        this.addMethod(EffectType.DENY, verb, resource, condition);
    }

    public build = async (): Promise<APIGatewayIAMAuthorizerWithContextResult<AuthContextResponse>> => {
        if (this.statementList == null || this.statementList.length === 0) {
            throw new Error("No statements defined for the policy");
        }

        return {
            principalId: this.principalId,
            policyDocument: {
                Version: this.version,
                Statement: this.statementList,
            },
            context: {}
        };
    }

    private addMethod = (effect: EffectType, verb: HttpVerbType, resource: string, condition?: ConditionBlock | undefined): void => {
        if (verb != HttpVerbType.ALL && !(verb in HttpVerbType)) {
            throw new Error(`Invalid HTTP verb ${verb}. Allowed verbs in HttpVerb class`);
        }

        const resourcePattern = new RegExp(this.pathRegex);
        if (!resourcePattern.test(resource)) {
            throw new Error(`Invalid resource path: ${resource}. Path should match ${this.pathRegex}`);
        }

        if (resource.startsWith("/")) {
            resource = resource.substring(1);
        }

        const resourceArn = `arn:aws:execute-api:${this.region}:${this.accountId}:${this.restApiId}/${this.stage}/${verb}/${resource}`;
        this.statementList.push({
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resourceArn,
            Condition: condition
        });
    }
}