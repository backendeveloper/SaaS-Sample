import {
    AttributeValue,
    DynamoDBClient,
    GetItemCommandOutput,
    QueryCommand,
    QueryCommandOutput,
    ReturnConsumedCapacity,
    ReturnValue,
    ScanCommand,
    ScanCommandOutput
} from "@aws-sdk/client-dynamodb";
import {NativeAttributeValue, unmarshall} from "@aws-sdk/util-dynamodb";
import {
    DeleteCommand,
    DeleteCommandOutput,
    DynamoDBDocument,
    GetCommand,
    PutCommand,
    PutCommandOutput,
    UpdateCommand,
    UpdateCommandOutput
} from "@aws-sdk/lib-dynamodb";
import {DatabaseResponse} from "./models";
import {TenantDetailModel} from "../../core";

interface ResponseModel {
    items: any[] | any | null;
    capacityUnits?: number;
    readCapacityUnits?: number;
    writeCapacityUnits?: number;
    count?: number;
}

export class DatabaseManagement {
    private readonly dynamoDBClient: DynamoDBClient;
    private readonly tableName: string | undefined;

    constructor(tableName: string | undefined, region: string | undefined) {
        if (tableName === null || region === null) {
            throw new Error('tableName or region not found');
        }

        this.tableName = tableName;
        const client = new DynamoDBClient({region});
        const marshallOptions = {
            convertEmptyValues: false,
            removeUndefinedValues: false,
            convertClassInstanceToMap: false
        };
        const unmarshallOptions = {
            wrapNumbers: false
        };
        this.dynamoDBClient = DynamoDBDocument.from(client, {
            marshallOptions,
            unmarshallOptions
        });
    }

    public scan = async (): Promise<DatabaseResponse | null> => {
        let response: DatabaseResponse | null = null;

        const scanCommand = new ScanCommand({
            TableName: this.tableName
        });

        const result: ScanCommandOutput = await this.commandExec(scanCommand);

        if (result != null && result.Items != null && result.Items.length > 0) {
            response = {
                items: result.Items.map((x: Record<string, AttributeValue>) => unmarshall(x) as TenantDetailModel),
                capacityUnits: result.ConsumedCapacity?.CapacityUnits,
                readCapacityUnits: result.ConsumedCapacity?.ReadCapacityUnits,
                writeCapacityUnits: result.ConsumedCapacity?.WriteCapacityUnits,
                count: result.Count
            };
        }

        return response;
    };


    public query = async (keyConditionExpression?: string): Promise<ResponseModel | null> => {
        let response: ResponseModel | null = null;

        const queryCommand = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: keyConditionExpression,
            ReturnConsumedCapacity: ReturnConsumedCapacity.TOTAL
        });
        const result: QueryCommandOutput = await this.commandExec(queryCommand);
        if (result != null && result.Items != null && result.Items.length > 0) {
            response = {
                items: result.Items.map((x: any) => unmarshall(x) as any),
                capacityUnits: result.ConsumedCapacity?.CapacityUnits,
                readCapacityUnits: result.ConsumedCapacity?.ReadCapacityUnits,
                writeCapacityUnits: result.ConsumedCapacity?.WriteCapacityUnits
            };
        }

        return response;
    };

    public getItem = async (key: Record<string, NativeAttributeValue> | undefined, attributesToGet?: string[]): Promise<ResponseModel | null> => {
        let response: ResponseModel | null = null;

        const getCommand = new GetCommand({
            TableName: this.tableName,
            Key: key,
            AttributesToGet: attributesToGet,
            ReturnConsumedCapacity: ReturnConsumedCapacity.TOTAL
        });
        const result: GetItemCommandOutput = await this.commandExec(getCommand);

        if (result.Item) {
            response = {
                items: unmarshall(result.Item),
                capacityUnits: result.ConsumedCapacity?.CapacityUnits,
                readCapacityUnits: result.ConsumedCapacity?.ReadCapacityUnits,
                writeCapacityUnits: result.ConsumedCapacity?.WriteCapacityUnits
            };
        }

        return response;
    };

    public deleteItem = async (key: Record<string, NativeAttributeValue> | undefined): Promise<ResponseModel | null> => {
        const deleteCommand = new DeleteCommand({
            TableName: this.tableName,
            Key: key,
            ReturnConsumedCapacity: ReturnConsumedCapacity.TOTAL
        });
        const result: DeleteCommandOutput = await this.commandExec(deleteCommand);

        const response: ResponseModel = {
            items: null,
            capacityUnits: result.ConsumedCapacity?.CapacityUnits,
            readCapacityUnits: result.ConsumedCapacity?.ReadCapacityUnits,
            writeCapacityUnits: result.ConsumedCapacity?.WriteCapacityUnits
        };

        return response;
    };

    public putItem = async (item: Record<string, NativeAttributeValue> | undefined): Promise<ResponseModel | null> => {
        const putItemCommand = new PutCommand({
            TableName: this.tableName,
            Item: item
        });
        const result: PutCommandOutput = await this.commandExec(putItemCommand);

        const response: ResponseModel = {
            items: null,
            capacityUnits: result.ConsumedCapacity?.CapacityUnits,
            readCapacityUnits: result.ConsumedCapacity?.ReadCapacityUnits,
            writeCapacityUnits: result.ConsumedCapacity?.WriteCapacityUnits
        };

        return response;
    };

    public updateItem = async (key: Record<string, NativeAttributeValue> | undefined, updateExpression?: string, expressionAttributeValues?: Record<string, NativeAttributeValue>, returnValues: ReturnValue | string = ReturnValue.UPDATED_NEW): Promise<ResponseModel | null> => {
        const updateCommand = new UpdateCommand({
            TableName: this.tableName,
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: returnValues,
            ReturnConsumedCapacity: ReturnConsumedCapacity.TOTAL
        });
        const result: UpdateCommandOutput = await this.commandExec(updateCommand);

        const response: ResponseModel = {
            items: null,
            capacityUnits: result.ConsumedCapacity?.CapacityUnits,
            readCapacityUnits: result.ConsumedCapacity?.ReadCapacityUnits,
            writeCapacityUnits: result.ConsumedCapacity?.WriteCapacityUnits
        };

        return response;
    };

    private commandExec = async (command: any): Promise<any> => {
        return await this.dynamoDBClient.send(command);
    }
}