import {UserStatusType} from "@aws-sdk/client-cognito-identity-provider";

import {UserManagement} from "./user-management";

export class UserInfo {
    public userName?: string;
    public tenantId?: string;
    public userRole?: string;
    public email?: string;
    public status?: UserStatusType | string;
    public enabled?: boolean;
    public created?: Date;
    public modified?: Date;

    constructor(
        userName?: string,
        tenantId?: string,
        userRole?: string,
        email?: string,
        status?: UserStatusType | string,
        enabled?: boolean,
        created?: Date,
        modified?: Date,
    ) {
        this.userName = userName;
        this.tenantId = tenantId;
        this.userRole = userRole;
        this.email = email;
        this.status = status;
        this.enabled = enabled;
        this.created = created;
        this.modified = modified;
    }

    public getUserInfo = async (metricService: any, loggerService: any, tenantId: string, userPoolId: string | undefined, userName: string | undefined, region: string | undefined): Promise<any> => {
        // metricService.recordMetric(tenantId, 'UserInfoRequested', MetricUnits.Count, 1);

        const userManagement = new UserManagement(region);
        const response = await userManagement.getUserInfo(userPoolId, userName);
        loggerService.logWithTenantContext(JSON.stringify(response), tenantId);

        this.userName = response.Username || '';
        response.UserAttributes?.forEach((attr: any) => {
            if (attr.Name == 'custom:tenantId')
                this.tenantId = attr.Value;

            if (attr.Name == 'custom:userRole')
                this.userRole = attr.Value;

            if (attr.Name == 'email')
                this.email = attr.Value;

            loggerService.logWithTenantContext(JSON.stringify(this), tenantId);

            return this;
        });
    };
}