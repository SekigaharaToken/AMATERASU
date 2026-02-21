import { useState } from "react";
import { Search, Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { formatUnits } from "viem";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Badge } from "../ui/badge.jsx";
import { Progress } from "../ui/progress.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { useDistributionStatus, useIsClaimed } from "../../hooks/useDistributionStatus.js";

function truncateAddress(addr) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DistributionDetails({ distributionId }) {
  const { distribution, amountClaimed, isLoading, isError } =
    useDistributionStatus(distributionId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (isError || !distribution) {
    return (
      <p className="text-sm text-destructive">
        Distribution #{distributionId} not found or failed to load.
      </p>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const isActive = now >= distribution.startTime && now <= distribution.endTime;
  const isExpired = now > distribution.endTime;
  const isPending = now < distribution.startTime;
  const claimProgress =
    distribution.walletCount > 0
      ? Math.round((distribution.claimCount / distribution.walletCount) * 100)
      : 0;
  const amountPerClaimFormatted = formatUnits(distribution.amountPerClaim, 18);
  const totalAmount = formatUnits(
    BigInt(distribution.amountPerClaim) * BigInt(distribution.walletCount),
    18,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{distribution.title || `Distribution #${distributionId}`}</h3>
        {isActive && <Badge variant="default">Active</Badge>}
        {isExpired && <Badge variant="secondary">Expired</Badge>}
        {isPending && <Badge variant="outline">Pending</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Token:</span>{" "}
          <span className="font-mono text-xs">{truncateAddress(distribution.token)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Type:</span>{" "}
          {distribution.isERC20 ? "ERC20" : "ERC1155"}
        </div>
        <div>
          <span className="text-muted-foreground">Per Claim:</span>{" "}
          <span className="tabular-nums">{amountPerClaimFormatted}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Total:</span>{" "}
          <span className="tabular-nums">{totalAmount}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Start:</span>{" "}
          {formatDate(distribution.startTime)}
        </div>
        <div>
          <span className="text-muted-foreground">End:</span>{" "}
          {formatDate(distribution.endTime)}
        </div>
        <div>
          <span className="text-muted-foreground">Owner:</span>{" "}
          <span className="font-mono text-xs">{truncateAddress(distribution.owner)}</span>
        </div>
        {distribution.ipfsCID && (
          <div>
            <span className="text-muted-foreground">IPFS:</span>{" "}
            <a
              href={`https://gateway.pinata.cloud/ipfs/${distribution.ipfsCID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs hover:underline"
            >
              {distribution.ipfsCID.slice(0, 12)}...
              <ExternalLink className="size-3" />
            </a>
          </div>
        )}
      </div>

      {/* Claim Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Claims</span>
          <span className="tabular-nums">
            {distribution.claimCount} / {distribution.walletCount} ({claimProgress}%)
          </span>
        </div>
        <Progress value={claimProgress} />
      </div>
    </div>
  );
}

function ClaimChecker({ distributionId }) {
  const [address, setAddress] = useState("");
  const [checkAddress, setCheckAddress] = useState("");

  const { isClaimed, isLoading } = useIsClaimed(
    distributionId,
    checkAddress || undefined,
  );

  function handleCheck(e) {
    e.preventDefault();
    setCheckAddress(address.trim());
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h4 className="text-sm font-medium">Check Address</h4>
      <form onSubmit={handleCheck} className="flex gap-2">
        <Input
          placeholder="0x..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1 font-mono text-xs"
        />
        <Button type="submit" size="sm" disabled={!address.trim()}>
          <Search className="mr-1 size-3.5" />
          Check
        </Button>
      </form>
      {checkAddress && (
        <div className="flex items-center gap-2 text-sm">
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : isClaimed ? (
            <>
              <CheckCircle2 className="size-4 text-green-500" />
              <span>Claimed</span>
            </>
          ) : (
            <>
              <XCircle className="size-4 text-muted-foreground" />
              <span>Not claimed</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function PayoutStatusTab() {
  const [inputId, setInputId] = useState("");
  const [activeId, setActiveId] = useState(null);

  function handleLookup(e) {
    e.preventDefault();
    const num = parseInt(inputId, 10);
    if (!isNaN(num) && num >= 0) {
      setActiveId(num);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5" />
          Payout Status
        </CardTitle>
        <CardDescription>
          Look up a merkle distribution by ID to see claim progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lookup */}
        <form onSubmit={handleLookup} className="flex gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Distribution ID"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            className="max-w-40"
          />
          <Button type="submit" disabled={!inputId}>
            <Search className="mr-1 size-3.5" />
            Look Up
          </Button>
        </form>

        {/* Details */}
        {activeId !== null && (
          <>
            <DistributionDetails distributionId={activeId} />
            <ClaimChecker distributionId={activeId} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
