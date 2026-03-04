import { KeygenixConfig } from "../api-client.js";
export declare const importKeyTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            keyType: {
                type: string;
                enum: string[];
                description: string;
            };
            mnemonic: {
                type: string;
                description: string;
            };
            privateKey: {
                type: string;
                description: string;
            };
            curve: {
                type: string;
                enum: string[];
                description: string;
            };
            chains: {
                type: string;
                items: {
                    type: string;
                    enum: string[];
                };
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleImportKey(config: KeygenixConfig, args: {
    keyType: string;
    mnemonic?: string;
    privateKey?: string;
    curve?: string;
    chains?: string[];
}): Promise<unknown>;
//# sourceMappingURL=import.d.ts.map