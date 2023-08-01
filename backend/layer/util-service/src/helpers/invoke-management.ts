import {SignatureV4} from "@aws-sdk/signature-v4";
import {Sha256} from "@aws-crypto/sha256-js";
import axios from "axios";

import {LoggerService} from "./logger";
import {Credentials} from "../models";

export class InvokeManagement {
    private readonly signature: SignatureV4;
    private readonly loggerService: LoggerService;

    constructor(loggerService: LoggerService, region?: string, credentials?: Credentials) {
        if (region === null) {
            throw new Error('Region not found');
        }

        if (credentials === null) {
            throw new Error('Credentials not found');
        }

        this.signature = new SignatureV4({
            service: 'execute-api',
            region: region || '',
            credentials: {
                accessKeyId: credentials?.AccessKeyId || '',
                secretAccessKey: credentials?.SecretAccessKey || '',
                sessionToken: credentials?.SessionToken,
                expiration: credentials?.Expiration
            },
            sha256: Sha256,
        });
        this.loggerService = loggerService;
    }

    public invoke = async (requestApiUrl: string, method: string, body: any, errorMessage: string) => {
        try {
            const apiUrl = new URL(requestApiUrl);
            this.loggerService.info('apiUrl', apiUrl);

            const signed = await this.signature.sign({
                method,
                hostname: apiUrl.host,
                path: apiUrl.pathname,
                protocol: apiUrl.protocol,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                    Host: apiUrl.hostname
                },
            });
            this.loggerService.info('signed', signed);

            const {data} = await axios({
                ...signed,
                url: requestApiUrl,
                data: body
            });
            this.loggerService.info('data', data);

            return data;
        } catch (error: any) {
            this.loggerService.error(errorMessage);
            throw new Error(error);
        }
    }
}