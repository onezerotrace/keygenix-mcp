#!/usr/bin/env node
/**
 * Keygenix MCP Server
 * Non-custodial TEE key management & signing for AI agents.
 *
 * Usage:
 *   KEYGENIX_API_PRIV_KEY=<hex> \
 *   KEYGENIX_AUTH_PRIV_KEY=<hex> \
 *   KEYGENIX_ORG_CODE=<org> \
 *   KEYGENIX_WALLET_CODE=<wallet> \
 *   npx keygenix-mcp
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import type { KeygenixConfig } from "./api-client.js";

import { keygenTool, handleKeygen } from "./tools/keygen.js";
import {
  listKeysTool, getKeyTool, createKeyTool,
  handleListKeys, handleGetKey, handleCreateKey,
} from "./tools/keys.js";
import {
  listAddressesTool, createAddressTool,
  handleListAddresses, handleCreateAddress,
} from "./tools/addresses.js";
import {
  signTransactionTool, signMessageTool,
  handleSignTransaction, handleSignMessage,
} from "./tools/signing.js";

// ─── Load config from env ─────────────────────────────────────────────────────

function loadConfig(): KeygenixConfig {
  const missing: string[] = [];
  const required = [
    "KEYGENIX_API_PRIV_KEY",
    "KEYGENIX_AUTH_PRIV_KEY",
    "KEYGENIX_ORG_CODE",
    "KEYGENIX_WALLET_CODE",
  ];
  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  return {
    apiAuthPrivKey: process.env.KEYGENIX_API_PRIV_KEY!,
    authPrivKey:    process.env.KEYGENIX_AUTH_PRIV_KEY!,
    orgCode:        process.env.KEYGENIX_ORG_CODE!,
    walletCode:     process.env.KEYGENIX_WALLET_CODE!,
  };
}

// ─── All tools ────────────────────────────────────────────────────────────────

const ALL_TOOLS = [
  keygenTool,
  listKeysTool,
  getKeyTool,
  createKeyTool,
  listAddressesTool,
  createAddressTool,
  signTransactionTool,
  signMessageTool,
];

// ─── Server ───────────────────────────────────────────────────────────────────

async function main() {
  let config: KeygenixConfig;
  try {
    config = loadConfig();
  } catch (err) {
    console.error(`[keygenix-mcp] ${(err as Error).message}`);
    process.exit(1);
  }

  const server = new Server(
    { name: "keygenix-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // List tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_TOOLS,
  }));

  // Call tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      let result: unknown;

      switch (name) {
        case "keygen":
          result = handleKeygen();
          break;

        case "list_keys":
          result = await handleListKeys(config, args as { page?: number; size?: number });
          break;

        case "get_key":
          result = await handleGetKey(config, args as { keyCode: string });
          break;

        case "create_key":
          result = await handleCreateKey(config, args as { keyType: string; chains?: string[] });
          break;

        case "list_addresses":
          result = await handleListAddresses(config, args as { keyCode: string; page?: number; size?: number });
          break;

        case "create_address":
          result = await handleCreateAddress(config, args as {
            keyCode: string; addressType: string;
            path?: string; curve?: string; deriveType?: string;
          });
          break;

        case "sign_transaction":
          result = await handleSignTransaction(config, args as {
            keyCode?: string; address?: string;
            tx: string; chain: string; chainId?: number;
            encoding?: string; path?: string;
          });
          break;

        case "sign_message":
          result = await handleSignMessage(config, args as {
            keyCode?: string; address?: string;
            message: string; path?: string;
          });
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[keygenix-mcp] Server running (stdio)");
}

main().catch((err) => {
  console.error("[keygenix-mcp] Fatal:", err);
  process.exit(1);
});
