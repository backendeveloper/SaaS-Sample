export type TokenModel = {
    sub: string;
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    'cognito:groups': string[];
    'cognito:username': string;
    'custom:tenantId': string;
    'custom:userRole': string;
    token_use: string;
    email: string;
}