import { secp256k1 } from "@noble/curves/secp256k1.js";
import { bytesToHex } from "@noble/hashes/utils.js";
export const keygenTool = {
    name: "keygen",
    description: "Generate a new secp256k1 keypair locally (no network call). " +
        "Use this to create API Auth keypairs or AuthKey keypairs before registering with Keygenix.",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};
export function handleKeygen() {
    const privKey = secp256k1.utils.randomSecretKey();
    return {
        privateKey: bytesToHex(privKey),
        publicKey: bytesToHex(secp256k1.getPublicKey(privKey)),
    };
}
//# sourceMappingURL=keygen.js.map