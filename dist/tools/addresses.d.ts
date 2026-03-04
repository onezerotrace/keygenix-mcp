import { KeygenixConfig } from "../api-client.js";
export declare const listAddressesTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            keyCode: {
                type: string;
                description: string;
            };
            page: {
                type: string;
                description: string;
            };
            size: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare const createAddressTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            keyCode: {
                type: string;
                description: string;
            };
            addressType: {
                type: string;
                enum: string[];
                description: string;
            };
            path: {
                type: string;
                description: string;
            };
            curve: {
                type: string;
                enum: string[];
                description: string;
            };
            deriveType: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleListAddresses(config: KeygenixConfig, args: {
    keyCode: string;
    page?: number;
    size?: number;
}): Promise<unknown>;
export declare function handleCreateAddress(config: KeygenixConfig, args: {
    keyCode: string;
    addressType: string;
    path?: string;
    curve?: string;
    deriveType?: string;
}): Promise<unknown>;
//# sourceMappingURL=addresses.d.ts.map