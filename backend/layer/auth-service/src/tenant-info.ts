export class TenantInfo {
    public tenantName: string;
    public tenantAddress: string;
    public tenantEmail: string;
    public tenantPhone: string;

    constructor(
        tenantName : string,
        tenantAddress : string,
        tenantEmail : string,
        tenantPhone : string
    ) {
        this.tenantName = tenantName;
        this.tenantAddress = tenantAddress;
        this.tenantEmail = tenantEmail;
        this.tenantPhone = tenantPhone;
    }

    public getTenantInfo = (): TenantInfo => { return this; }
}