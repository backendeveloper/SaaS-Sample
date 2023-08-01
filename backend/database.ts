import {Construct} from "constructs";
import {DynamodbTable} from "@modules/dynamodb-table";
import * as core from "@core/index";

type DatabaseConfig = {
    variable: core.VariableResult;
};

export class DatabaseConstruct extends Construct {
    public readonly tenantDetailsTable: DynamodbTable;
    public readonly tenantUserMappingTable: DynamodbTable;
    public readonly productTable: DynamodbTable;
    public readonly orderTable: DynamodbTable;


    constructor(scope: Construct, id: string, config: DatabaseConfig) {
        super(scope, id);

        this.tenantDetailsTable = new DynamodbTable(this, 'tenant_details', {
            name: `saas-tenant-details-table_${config.variable.environment.value}`,
            attributes: [
                {
                    name: 'tenantId',
                    type: 'S'
                },
                {
                    name: 'tenantName',
                    type: 'S'
                }
            ],
            globalSecondaryIndexes: [
                {
                    name: 'saas-tenant-details-config',
                    hash_key: 'tenantName',
                    projection_type: 'INCLUDE',
                    non_key_attributes: ['userPoolId', 'appClientId', 'apiGatewayUrl']
                }
            ],
            hashKey: 'tenantId',
            billingMode: 'PAY_PER_REQUEST',

            dependsOn: [config.variable.environment]
        });
        this.tenantUserMappingTable = new DynamodbTable(this, 'tenant_user_mapping', {
            name: `saas-tenant-user-mapping-table_${config.variable.environment}`,
            attributes: [
                {
                    name: 'tenantId',
                    type: 'S'
                },
                {
                    name: 'userName',
                    type: 'S'
                }
            ],
            globalSecondaryIndexes: [
                {
                    name: 'UserName',
                    hash_key: 'userName',
                    projection_type: 'ALL',
                    range_key: 'tenantId'
                }
            ],
            hashKey: 'tenantId',
            rangeKey: 'userName',
            billingMode: 'PAY_PER_REQUEST',

            dependsOn: [config.variable.environment]
        });

        this.productTable = new DynamodbTable(this, 'product_table', {
            name: 'saas-product-table-pooled',
            attributes: [
                {
                    name: 'shardId',
                    type: 'S'
                },
                {
                    name: 'productId',
                    type: 'S'
                }
            ],
            hashKey: 'shardId',
            rangeKey: 'productId',
            billingMode: 'PAY_PER_REQUEST',

            tags: {
                environment: config.variable.environment.value
            },

            dependsOn: [config.variable.environment]
        });
        this.orderTable = new DynamodbTable(this, 'order_table', {
            name: `saas-order-table-pooled`,
            attributes: [
                {
                    name: 'shardId',
                    type: 'S'
                },
                {
                    name: 'orderId',
                    type: 'S'
                }
            ],
            hashKey: 'shardId',
            rangeKey: 'orderId',
            billingMode: 'PAY_PER_REQUEST',

            tags: {
                environment: config.variable.environment.value
            },

            dependsOn: [config.variable.environment]
        });
    }
}