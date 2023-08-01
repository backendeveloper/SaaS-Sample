import {Metrics} from '@aws-lambda-powertools/metrics';
import {MetricUnit} from "@aws-lambda-powertools/metrics/lib/types/MetricUnit";

export class MetricService {
    public readonly metrics: Metrics;

    constructor() {
        this.metrics = new Metrics({
            defaultDimensions: {
                aws_account_id: process.env.AWS_ACCOUNT_ID || 'N/A',
                aws_region: process.env.AWS_REGION || 'N/A',
            }
        });
    }

    public recordMetric = (tenantId: string, metricName: string, metricUnit: MetricUnit, metricValue: number | undefined): void => {
        this.metrics.addDimension('tenantId', tenantId);
        this.metrics.addMetric(metricName, metricUnit, metricValue || 0);
        const currentMetric = this.metrics.serializeMetrics();
        this.metrics.clearMetrics();

        console.log(currentMetric);
    };
}