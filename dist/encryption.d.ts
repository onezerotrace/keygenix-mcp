interface EncryptedPayload {
    v: number;
    epk: string;
    salt: string;
    iv: string;
    tag: string;
    data: string;
}
export declare class SecureEncryption {
    private readonly version;
    encrypt(plaintext: string, publicKeyHex: string, ephemeralPrivateKeyHex?: string): string;
    decrypt(encryptedData: string | EncryptedPayload, privateKeyHex: string): string;
}
export {};
//# sourceMappingURL=encryption.d.ts.map