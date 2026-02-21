import { ShieldAlert, Wallet } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert.jsx";
import { useIsOperator } from "../../hooks/useIsOperator.js";

export function AdminGuard({ children }) {
  const { isOperator, isConnected } = useIsOperator();

  if (!isConnected) {
    return (
      <Alert>
        <Wallet className="size-4" />
        <AlertTitle>Wallet Required</AlertTitle>
        <AlertDescription>
          Connect your operator wallet to access the admin dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isOperator) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="size-4" />
        <AlertTitle>Not Authorized</AlertTitle>
        <AlertDescription>
          Connected wallet is not the operator. Switch to the operator wallet.
        </AlertDescription>
      </Alert>
    );
  }

  return children;
}
