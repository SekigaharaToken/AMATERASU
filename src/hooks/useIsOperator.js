import { useAccount } from "wagmi";
import { OPERATOR_ADDRESS } from "../config/contracts.js";

/**
 * Checks if the connected wallet is the operator address.
 * Pure derived state — no queries needed.
 */
export function useIsOperator() {
  const { address, isConnected } = useAccount();
  const isOperator =
    isConnected &&
    Boolean(address) &&
    address.toLowerCase() === OPERATOR_ADDRESS;

  return { isOperator, isConnected };
}
