import {IPolicyDocument} from "../interfaces";
import {AuthContextResponse} from "./auth-context-response";

export type PolicyResponseModel = {
    principalId: string;
    policyDocument: IPolicyDocument;
    context?: AuthContextResponse;
}