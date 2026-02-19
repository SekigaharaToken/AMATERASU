/**
 * Pre-configured Mint Club SDK instance with a CORS-friendly RPC.
 *
 * The SDK's built-in public RPC list for Base fails from browsers
 * (CORS blocks, 403s, 401s). We inject a working publicClient
 * for both Base mainnet and Base Sepolia so all SDK calls succeed.
 *
 * Initialization is lazy to avoid side effects at import time
 * (which breaks test environments that mock viem/SDK).
 */

import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { mintclub } from "mint.club-v2-sdk";

let initialized = false;

function ensureInitialized() {
  if (initialized) return;
  initialized = true;

  const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;

  const baseMainnetRpc = alchemyKey
    ? `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`
    : "https://base-rpc.publicnode.com";

  const baseSepoliaRpc = alchemyKey
    ? `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`
    : "https://base-sepolia-rpc.publicnode.com";

  mintclub.withPublicClient(
    createPublicClient({ chain: base, transport: http(baseMainnetRpc) }),
  );
  mintclub.withPublicClient(
    createPublicClient({ chain: baseSepolia, transport: http(baseSepoliaRpc) }),
  );
}

export { mintclub, ensureInitialized };
