export type AuthContextResponse = {
    accessKeyId?: string | undefined;
    secretAccessKey?: string | undefined;
    sessionToken?: string | undefined;
    userPoolId?: string;
    userRole?: string;
    tenantId?: string;
    userName?: string;
};