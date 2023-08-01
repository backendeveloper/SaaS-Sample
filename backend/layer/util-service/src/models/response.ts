import {APIGatewayProxyStructuredResultV2} from "aws-lambda";

import {ResponseStatusCodeType} from "../types";
import {TenantDetailModel} from "./tenant-detail";

export const createSuccessResponse = (result: unknown): APIGatewayProxyStructuredResultV2 => {
    return {
        statusCode: ResponseStatusCodeType.SUCCESS,
        headers: {
            'Access-Control-Allow-Headers': 'Content-Type, Origin, X-Requested-With, Accept, Authorization, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Allow-Origin',
            'Access-Control-Allow-Origin': 'https://d3vdwk5sf41zyv.cloudfront.net',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({result})
    }
};

export const createUnauthorizedResponse = (): APIGatewayProxyStructuredResultV2 => {
    return {
        statusCode: ResponseStatusCodeType.UN_AUTHORIZED,
        headers: {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': 'https://d3vdwk5sf41zyv.cloudfront.net',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            message: 'User not authorized to perform this action'
        })
    }
};

export const generateResponse = (result?: TenantDetailModel | TenantDetailModel[] | null | any[]): APIGatewayProxyStructuredResultV2 => {
    return {
        statusCode: ResponseStatusCodeType.SUCCESS,
        headers: {
            'Access-Control-Allow-Headers': 'Content-Type, Origin, X-Requested-With, Accept, Authorization, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Allow-Origin',
            'Access-Control-Allow-Origin': 'https://d3vdwk5sf41zyv.cloudfront.net',
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(result)
    }
};