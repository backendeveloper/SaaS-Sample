export class OrderModel {
    public shardId: string;
    public orderId: string;
    public key: string;
    public orderName: string;
    public orderProducts: string;

    constructor(shardId: string, orderId: string, orderName: string, orderProducts: string) {
        this.shardId = shardId;
        this.orderId = orderId;
        this.key = `${shardId}:${orderId}`;
        this.orderName = orderName;
        this.orderProducts = orderProducts;
    }
}