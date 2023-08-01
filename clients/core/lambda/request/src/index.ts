import {CloudFrontRequestEvent, CloudFrontRequestResult, CloudFrontResponseResult} from "aws-lambda";

const hasExtension = /(.+)\.[a-zA-Z0-9]{2,5}$/;
const hasSlash = /\/$/;

export const handler = async (event: CloudFrontRequestEvent): Promise<CloudFrontResponseResult | CloudFrontRequestResult> => {
    const { request } = event.Records[0].cf;
    const url = request.uri;

    if (url && !url.match(hasExtension) && !url.match(hasSlash)) {
        request.uri = `${url}.html`;
    }

    return request;
};