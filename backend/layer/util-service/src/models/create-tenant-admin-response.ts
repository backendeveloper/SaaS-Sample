export type CreateUserResponseModel = {
    result?: CreateUserDetailResponseModel;
};

export type CreateUserDetailResponseModel = {
    userPoolId?: string;
    appClientId?: string;
    tenantAdminUserName?: string;
};