import {Construct} from "constructs";
import {TerraformOutput} from 'cdktf';
import * as core from "@core/index";

import {ClientsConstruct} from "../clients";
import {BackendConstruct} from "../backend";

export type OutputConfig = {
    variable: core.VariableResult;
    clients: ClientsConstruct;
    backend: BackendConstruct;
}

export class OutputConstruct extends Construct {

    constructor(scope: Construct, id: string, config: OutputConfig) {
        super(scope, id);

        new TerraformOutput(this, 'admin_client_endpoint', {
            value: `https://${core.getSubDomainWithEnvironment(config, config.variable.adminClientSubDomainName.value)}.${config.variable.domainName.value}`
        });

        new TerraformOutput(this, 'application_client_endpoint', {
            value: `https://${core.getSubDomainWithEnvironment(config, config.variable.applicationClientSubDomainName.value)}.${config.variable.domainName.value}`
        });

        new TerraformOutput(this, 'shared_api_endpoint', {
            value: `https://${core.getSubDomainWithEnvironment(config, config.variable.sharedApiSubDomainName.value)}.${config.variable.domainName.value}`
        });

        new TerraformOutput(this, 'pooled_api_endpoint', {
            value: `https://${core.getSubDomainWithEnvironment(config, config.variable.pooledUserpoolSubDomainName.value)}.${config.variable.domainName.value}`
        });

        new TerraformOutput(this, 'operation_userpool_endpoint', {
            value: `https://${config.backend.operationUserPoolDomain.domain}`
        });

        new TerraformOutput(this, 'pooled_userpool_endpoint', {
            value: `https://${config.backend.pooledUserPoolDomain.domain}`
        });
    }
}
