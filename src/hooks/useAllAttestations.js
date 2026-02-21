import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { EAS_ADDRESS } from "../config/contracts.js";
import { getLogsPaginated, getBlockTimestamps } from "../lib/getLogsPaginated.js";

const attestedEvent = parseAbiItem(
  "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)",
);

/**
 * Queries ALL EAS Attested event logs for a given schema (no attester filter).
 * Returns deduplicated recipients with attestation counts and latest timestamps.
 *
 * @param {string} schemaUid — bytes32 schema UID (lowercase)
 * @param {Object} [options]
 * @param {bigint} [options.fromBlock=0n] — Start block for log query
 * @param {number} [options.staleTime=60000] — TanStack Query stale time in ms
 */
export function useAllAttestations(schemaUid, { fromBlock = 0n, staleTime = 60_000 } = {}) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["allAttestations", schemaUid],
    queryFn: async () => {
      if (!schemaUid) return { recipients: [], totalAttestations: 0 };

      const logs = await getLogsPaginated({
        address: EAS_ADDRESS,
        event: attestedEvent,
        args: { schemaUID: schemaUid },
        fromBlock,
        toBlock: "latest",
      });

      const timestampByBlock = await getBlockTimestamps(logs);

      // Aggregate by recipient
      const recipientMap = new Map();
      for (const log of logs) {
        const recipient = log.args.recipient.toLowerCase();
        const ts = timestampByBlock[log.blockNumber.toString()] ?? 0;
        const existing = recipientMap.get(recipient);
        if (existing) {
          existing.attestationCount += 1;
          if (ts > existing.latestTimestamp) existing.latestTimestamp = ts;
        } else {
          recipientMap.set(recipient, {
            recipient,
            attestationCount: 1,
            latestTimestamp: ts,
          });
        }
      }

      const recipients = Array.from(recipientMap.values()).sort(
        (a, b) => b.latestTimestamp - a.latestTimestamp,
      );

      return { recipients, totalAttestations: logs.length };
    },
    enabled: Boolean(schemaUid),
    staleTime,
  });

  return {
    recipients: data?.recipients ?? [],
    totalAttestations: data?.totalAttestations ?? 0,
    uniqueCount: data?.recipients?.length ?? 0,
    isLoading,
    isError,
    refetch,
  };
}
