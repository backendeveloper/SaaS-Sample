import {Tracer} from '@aws-lambda-powertools/tracer';

export class TracerService {
    public readonly tracer: Tracer;

    constructor() {
        this.tracer = new Tracer();
    }
}