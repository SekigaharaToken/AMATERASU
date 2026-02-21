import { useReadContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { MINT_CLUB } from "../config/contracts.js";
import { merkleDistributorAbi } from "../config/abis/merkleDistributor.js";

/**
 * Reads distribution details and claim progress from the Merkle distributor contract.
 *
 * @param {number|string|undefined} distributionId — The distribution ID to look up
 */
export function useDistributionStatus(distributionId) {
  const id = distributionId != null ? BigInt(distributionId) : undefined;
  const enabled = id !== undefined;

  const { data, isLoading, isError, error } = useReadContracts({
    contracts: [
      {
        address: MINT_CLUB.MERKLE,
        abi: merkleDistributorAbi,
        functionName: "distributions",
        args: enabled ? [id] : undefined,
      },
      {
        address: MINT_CLUB.MERKLE,
        abi: merkleDistributorAbi,
        functionName: "getAmountClaimed",
        args: enabled ? [id] : undefined,
      },
    ],
    query: { enabled },
  });

  const distResult = data?.[0]?.result;
  const amountClaimedResult = data?.[1]?.result;

  const distribution = distResult
    ? {
        token: distResult[0],
        isERC20: distResult[1],
        amountPerClaim: distResult[2],
        walletCount: Number(distResult[3]),
        claimCount: Number(distResult[4]),
        startTime: Number(distResult[5]),
        endTime: Number(distResult[6]),
        owner: distResult[7],
        merkleRoot: distResult[8],
        title: distResult[9],
        ipfsCID: distResult[10],
      }
    : null;

  const amountClaimed = amountClaimedResult ?? 0n;

  return {
    distribution,
    amountClaimed,
    isLoading,
    isError,
    error,
  };
}

/**
 * Checks if a specific address has claimed from a distribution.
 */
export function useIsClaimed(distributionId, address) {
  const id = distributionId != null ? BigInt(distributionId) : undefined;
  const enabled = id !== undefined && Boolean(address);

  const { data, isLoading } = useReadContract({
    address: MINT_CLUB.MERKLE,
    abi: merkleDistributorAbi,
    functionName: "isClaimed",
    args: enabled ? [id, address] : undefined,
    query: { enabled },
  });

  return { isClaimed: data ?? false, isLoading };
}
