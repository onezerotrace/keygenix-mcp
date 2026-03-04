import { KeygenixConfig, apiCall, walletUrl, buildAuthSignature } from "../api-client.js";

// ─── Tool definitions ─────────────────────────────────────────────────────────

export const signTransactionTool = {
  name: "sign_transaction",
  description:
    "Sign a blockchain transaction using a TEE-stored key. " +
    "Supports EVM (RLP hex), SOL (base58/base64/hex), SUI, and other chains. " +
    "Provide either keyCode+deriving OR address (no deriving needed).",
  inputSchema: {
    type: "object",
    properties: {
      keyCode: { type: "string", description: "Key code (use with deriving)" },
      address: { type: "string", description: "Specific address to sign with (alternative to keyCode+deriving)" },
      tx: {
        type: "string",
        description: "Unsigned transaction. EVM: 0x-prefixed RLP hex. SOL: base58/base64/hex encoded tx.",
      },
      chain: {
        type: "string",
        enum: ["EVM", "SOL", "SUI", "BTC", "TRX", "TON", "COSMOS"],
        description: "Target blockchain",
      },
      chainId: {
        type: "number",
        description: "EVM chain ID (e.g. 1=Ethereum, 56=BSC, 137=Polygon, 42161=Arbitrum). Required for EVM.",
      },
      encoding: {
        type: "string",
        enum: ["base58", "base64", "hex"],
        description: "SOL transaction encoding (default: base58)",
      },
      path: {
        type: "string",
        description: "BIP44 path (default: m/44'/60'/0'/0/0 for EVM). Only used with keyCode.",
      },
    },
    required: ["tx", "chain"],
  },
};

export const signMessageTool = {
  name: "sign_message",
  description:
    "Sign an arbitrary message (hex-encoded sha256 hash) using a TEE-stored key. " +
    "Provide either keyCode+deriving OR address.",
  inputSchema: {
    type: "object",
    properties: {
      keyCode: { type: "string", description: "Key code (use with path)" },
      address: { type: "string", description: "Specific address to sign with (alternative to keyCode+path)" },
      message: {
        type: "string",
        description: "Message to sign as 64-char hex (sha256 hash of the original message)",
      },
      path: {
        type: "string",
        description: "BIP44 path (default: m/44'/60'/0'/0/0). Only used with keyCode.",
      },
    },
    required: ["message"],
  },
};

// ─── Chain defaults ───────────────────────────────────────────────────────────

const CHAIN_DEFAULTS: Record<string, { path: string; curve: string; deriveType: string }> = {
  EVM:    { path: "m/44'/60'/0'/0/0",  curve: "secp256k1", deriveType: "bip32" },
  SOL:    { path: "m/44'/501'/0'/0'",  curve: "ed25519",   deriveType: "ed25519-hd-key" },
  SUI:    { path: "m/44'/784'/0'/0'/0'", curve: "ed25519", deriveType: "ed25519-hd-key" },
  BTC:    { path: "m/84'/0'/0'/0/0",   curve: "secp256k1", deriveType: "bip32" },
  TRX:    { path: "m/44'/195'/0'/0/0", curve: "secp256k1", deriveType: "bip32" },
  TON:    { path: "m/44'/607'/0'",     curve: "ed25519",   deriveType: "ed25519-hd-key" },
  COSMOS: { path: "m/44'/118'/0'/0/0", curve: "secp256k1", deriveType: "bip32" },
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export async function handleSignTransaction(
  config: KeygenixConfig,
  args: {
    keyCode?: string;
    address?: string;
    tx: string;
    chain: string;
    chainId?: number;
    encoding?: string;
    path?: string;
  }
) {
  if (!args.keyCode && !args.address) {
    throw new Error("Either keyCode or address must be provided");
  }

  // Build txBundle
  let txBundle: string;
  if (args.chain === "EVM") {
    txBundle = JSON.stringify({
      tx: args.tx,
      category: "EVM",
      network: { chainId: args.chainId ?? 1 },
    });
  } else if (args.chain === "SOL") {
    txBundle = JSON.stringify({
      tx: args.tx,
      enc: args.encoding ?? "base58",
      category: "SOL",
    });
  } else {
    txBundle = JSON.stringify({ tx: args.tx, category: args.chain });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const authSignature = buildAuthSignature(config.authPrivKey, txBundle, timestamp);

  if (args.address && args.keyCode) {
    // Prefer address-based signing
    return apiCall(
      config,
      "POST",
      walletUrl(config, `/keys/${args.keyCode}/addresses/${args.address}/sign_transaction`),
      { authSignature, timestamp, txBundle }
    );
  } else if (args.address) {
    throw new Error("keyCode is required when using address-based signing");
  } else {
    const defaults = CHAIN_DEFAULTS[args.chain] ?? CHAIN_DEFAULTS.EVM;
    return apiCall(
      config,
      "POST",
      walletUrl(config, `/keys/${args.keyCode}/sign_transaction`),
      {
        authSignature,
        timestamp,
        txBundle,
        deriving: {
          curve: defaults.curve,
          path: args.path ?? defaults.path,
          deriveType: defaults.deriveType,
        },
      }
    );
  }
}

export async function handleSignMessage(
  config: KeygenixConfig,
  args: {
    keyCode?: string;
    address?: string;
    message: string;
    path?: string;
  }
) {
  if (!args.keyCode && !args.address) {
    throw new Error("Either keyCode or address must be provided");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const authSignature = buildAuthSignature(config.authPrivKey, args.message, timestamp);

  if (args.address && args.keyCode) {
    return apiCall(
      config,
      "POST",
      walletUrl(config, `/keys/${args.keyCode}/addresses/${args.address}/sign_message`),
      { authSignature, timestamp, message: args.message }
    );
  } else {
    return apiCall(
      config,
      "POST",
      walletUrl(config, `/keys/${args.keyCode}/sign_message`),
      {
        authSignature,
        timestamp,
        message: args.message,
        deriving: {
          curve: "secp256k1",
          path: args.path ?? "m/44'/60'/0'/0/0",
          deriveType: "bip32",
        },
      }
    );
  }
}
