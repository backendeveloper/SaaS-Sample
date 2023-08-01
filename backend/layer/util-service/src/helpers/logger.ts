import {Logger} from '@aws-lambda-powertools/logger';

export class LoggerService {
    public readonly logger: Logger;

    constructor() {
        this.logger = new Logger({
            persistentLogAttributes: {
                aws_account_id: process.env.AWS_ACCOUNT_ID || 'N/A',
                aws_region: process.env.AWS_REGION || 'N/A'
            },
        });
    }

    public info = (logMessage: string, extraInput?: unknown): void => {
        this.logger.info(logMessage, {extraInput});
    };

    public error = (logMessage: string, extraInput?: unknown): void => {
        this.logger.error(logMessage, {extraInput});
    };

    public logWithTenantContext = (logMessage: string, tenantId: string): void => {
        this.logger.appendKeys({
            tenantId
        });
        this.logger.info(logMessage);
    };
}