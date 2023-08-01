import {EffectType} from "../types";

export interface IStatement {
    Action: string | string[];
    Effect: EffectType;
    Resource: string | null | string[];
    Condition?: { [key: string]: any };
}