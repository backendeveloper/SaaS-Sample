import {IStatement} from "./IStatement";

export interface IPolicyDocument {
    Version: string;
    Statement: IStatement[];
}