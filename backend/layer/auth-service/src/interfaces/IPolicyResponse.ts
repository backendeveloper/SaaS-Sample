import {IPolicyDocument} from "./IPolicyDocument";
import {AuthContextResponse} from "../models";

export interface IPolicyResponse {
    principalId: string;
    policyDocument: IPolicyDocument;
    context?: AuthContextResponse;
}