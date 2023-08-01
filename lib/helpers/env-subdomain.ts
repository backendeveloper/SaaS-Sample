export const getSubDomainWithEnvironment = (config: any, subDomain: string, separate?: string): string => {
    let currentSeparate = '.';
    if (separate)
        currentSeparate = separate;

    return `${(config.variable.environment.value !== 'prod' ? `${config.variable.environment.value}${currentSeparate}` : '')}${subDomain}`;
}