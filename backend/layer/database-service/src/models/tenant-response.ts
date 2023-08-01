import {TenantDetailModel} from "../../../core";

export type DatabaseResponse = {
    items: TenantDetailModel[] | TenantDetailModel | null;
    capacityUnits?: number;
    readCapacityUnits?: number;
    writeCapacityUnits?: number;
    count?: number;
};