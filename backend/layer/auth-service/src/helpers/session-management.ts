import {AssumeRoleCommand, AssumeRoleCommandOutput, Credentials, STSClient} from "@aws-sdk/client-sts";

export class SessionManagement {
    private readonly sessionClient: STSClient;

    constructor(region: string | undefined) {
        if (region == null) {
            throw new Error('region not found');
        }

        this.sessionClient = new STSClient({region});
    }

    public getSession = async (roleArn: string | undefined, roleSessionName: string | undefined, durationSeconds?: number, policy?: string): Promise<Credentials | undefined> => {
        const assumedRoleCommand = new AssumeRoleCommand({
            RoleArn: roleArn,
            RoleSessionName: roleSessionName,
            DurationSeconds: durationSeconds,
            Policy: policy
        });
        const result: AssumeRoleCommandOutput = await this.sessionClient.send(assumedRoleCommand);

        return result.Credentials;
    };
}