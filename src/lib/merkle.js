import { MerkleTree } from "merkletreejs";
import { keccak256 } from "viem";
import { getEnv } from "../config/env.js";

/**
 * Generate a merkle root from a list of wallet addresses.
 * Uses the same algorithm as Mint Club V2 SDK:
 * leaves = wallets.map(keccak256), tree sorted pairs.
 *
 * @param {string[]} wallets — Array of checksummed or lowercase addresses
 * @returns {string} bytes32 merkle root
 */
export function generateMerkleRoot(wallets) {
  const leaves = wallets.map((address) => keccak256(address));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return `0x${tree.getRoot().toString("hex")}`;
}

/**
 * Upload a JSON wallet list to Pinata IPFS.
 *
 * @param {string[]} wallets — Array of wallet addresses
 * @returns {Promise<string>} IPFS CID (e.g. "QmXyz...")
 */
export async function uploadToPinata(wallets) {
  const jwt = getEnv("VITE_PINATA_JWT", "");
  if (!jwt) throw new Error("VITE_PINATA_JWT not configured");

  const json = JSON.stringify(wallets, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  const formData = new FormData();
  formData.append("file", blob, "wallets.json");
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: `airdrop-${Date.now()}` }),
  );

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata upload failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.IpfsHash;
}
