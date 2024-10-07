interface EnvConfig {
    mongoDbConnectionString: string;
    port: string;
    corsOrigin: string;
    accessTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenSecret: string;
    refreshTokenExpiry: string;
}
declare const envConf: EnvConfig;
export default envConf;
//# sourceMappingURL=envConf.d.ts.map