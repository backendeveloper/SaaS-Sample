export type TenantDetailModel = {
    tenantId: string;
    tenantName: string;
    tenantEmail: string;
    tenantTier: string;
    tenantPhone?: string;
    tenantAddress?: string;
    tenantAdminUserName?: string;
    dedicatedTenancy?: string;
    isActive?: boolean;
};