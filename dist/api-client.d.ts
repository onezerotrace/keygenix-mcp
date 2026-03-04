export declare const BASE_URL = "https://api.keygenix.pro/v1/api";
export interface KeygenixConfig {
    apiAuthPrivKey: string;
    authPrivKey: string;
    orgCode: string;
    walletCode: string;
}
/** Build authSignature for sensitive operations (sign_transaction, sign_message, export) */
export declare function buildAuthSignature(authPrivKeyHex: string, content: string, timestamp: number): string;
export declare function apiCall<T = unknown>(config: KeygenixConfig, method: string, url: string, body?: object): Promise<T>;
export declare function walletUrl(config: KeygenixConfig, path?: string): string;
//# sourceMappingURL=api-client.d.ts.map