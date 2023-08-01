import {Construct} from "constructs";
import {Fn, propertyAccess, TerraformCount, Token} from "cdktf";
import * as awsProvider from "@providers/aws";
import {DataAwsRoute53Zone} from "@providers/aws/data-aws-route53-zone";
import * as core from "@core/index";

type EmailConfig = {
    variable: core.VariableResult;
    zone: DataAwsRoute53Zone;
}

export class EmailConstruct extends Construct {

    constructor(scope: Construct, id: string, config: EmailConfig) {
        super(scope, id);

        const domainIdentity = new awsProvider.sesDomainIdentity.SesDomainIdentity(this, 'domain_identity', {
            domain: config.variable.domainName.value,

            dependsOn: [config.variable.domainName]
        });

        const verificationRecord = new awsProvider.route53Record.Route53Record(this, 'ses_verification_record', {
            zoneId: config.zone.zoneId,
            name: `_amazonses.${config.variable.domainName.value}`,
            type: 'TXT',
            ttl: 600,
            records: [Fn.join('', Token.asList(propertyAccess(domainIdentity, ['*', 'verification_token'])))],

            dependsOn: [config.zone, domainIdentity, config.variable.domainName]
        });

        new awsProvider.sesDomainIdentityVerification.SesDomainIdentityVerification(this, 'verification', {
            domain: domainIdentity.id,

            dependsOn: [domainIdentity, verificationRecord]
        });

        const domainMailFrom = new awsProvider.sesDomainMailFrom.SesDomainMailFrom(this, 'domain_mail_from', {
            domain: domainIdentity.domain,
            mailFromDomain: `mail.${domainIdentity.domain}`,

            dependsOn: [domainIdentity]
        });

        new awsProvider.route53Record.Route53Record(this, 'domain_mail_from_txt', {
            zoneId: config.zone.zoneId,
            name: domainMailFrom.mailFromDomain,
            type: 'TXT',
            ttl: 600,
            records: ['v=spf1 include:amazonses.com -all']
        });


        const domainDkim = new awsProvider.sesDomainDkim.SesDomainDkim(this, 'domain_dkim', {
            domain: domainIdentity.domain,

            dependsOn: [domainIdentity]
        });

        const dkimRecordCount = TerraformCount.of(3);
        new awsProvider.route53Record.Route53Record(this, 'dkim_record', {
            count: dkimRecordCount,
            zoneId: config.zone.zoneId,
            name: `${Token.asString(Fn.element(domainDkim.dkimTokens, Token.asNumber(dkimRecordCount.index)))}._domainkey.${config.variable.domainName.value}`,
            records: [`${Token.asString(Fn.element(domainDkim.dkimTokens, Token.asNumber(dkimRecordCount.index)))}.dkim.amazonses.com`],
            ttl: 600,
            type: 'CNAME',

            dependsOn: [domainDkim, config.zone, config.variable.domainName]
        });
    }
}