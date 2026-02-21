import { useState } from "react";
import { Copy, Download, RefreshCw, Users, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { useAllAttestations } from "../../hooks/useAllAttestations.js";
import {
  DOJO_SCHEMA_UID,
  OPERATOR_ADDRESS,
  DOJO_RESOLVER_ADDRESS,
  DOJO_FAUCET_ADDRESS,
} from "../../config/contracts.js";
import { cn } from "../../lib/utils";

const KNOWN_ADDRESSES = {
  [OPERATOR_ADDRESS]: "Operator",
  [DOJO_RESOLVER_ADDRESS]: "Resolver",
  [DOJO_FAUCET_ADDRESS]: "Faucet",
};

function truncateAddress(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatTimestamp(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HoldersTab() {
  const { recipients, totalAttestations, uniqueCount, isLoading, isError, refetch } =
    useAllAttestations(DOJO_SCHEMA_UID);
  const [copied, setCopied] = useState(false);

  function copyAllAddresses() {
    const text = recipients.map((r) => r.recipient).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportCsv() {
    const header = "address,attestation_count,last_active\n";
    const rows = recipients
      .map((r) => `${r.recipient},${r.attestationCount},${formatTimestamp(r.latestTimestamp)}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "holders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holders</CardTitle>
          <CardDescription>Loading attestation data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holders</CardTitle>
          <CardDescription className="text-destructive">
            Failed to load attestation data.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Holders
        </CardTitle>
        <CardDescription>
          {uniqueCount} unique users &middot; {totalAttestations} total attestations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyAllAddresses}>
            <Copy className="mr-1 size-3.5" />
            {copied ? "Copied!" : "Copy All Addresses"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-1 size-3.5" />
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-1 size-3.5" />
            Refresh
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Address</th>
                <th className="px-3 py-2 text-right font-medium">Attestations</th>
                <th className="px-3 py-2 text-right font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => {
                const knownLabel = KNOWN_ADDRESSES[r.recipient];
                return (
                  <tr key={r.recipient} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="font-mono text-xs hover:underline"
                          onClick={() => navigator.clipboard.writeText(r.recipient)}
                          title="Click to copy"
                        >
                          {truncateAddress(r.recipient)}
                        </button>
                        {knownLabel && (
                          <Badge variant="secondary" className="text-[10px]">
                            {knownLabel}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {r.attestationCount}
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {formatTimestamp(r.latestTimestamp)}
                    </td>
                  </tr>
                );
              })}
              {recipients.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                    <FileText className="mx-auto mb-2 size-5" />
                    No attestations found for this schema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
