import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { Users, Hexagon, Hash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { useAllAttestations } from "../../hooks/useAllAttestations.js";
import {
  DOJO_SCHEMA_UID,
  KAMON_TOKEN_ADDRESS,
  MINT_CLUB,
} from "../../config/contracts.js";
import { getLogsPaginated } from "../../lib/getLogsPaginated.js";

const transferSingleEvent = parseAbiItem(
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
);

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function truncateAddress(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function SummaryCard({ icon: Icon, label, value, isLoading: loading }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Icon className="size-5 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-5 w-12" />
        ) : (
          <p className="text-lg font-semibold tabular-nums">{value}</p>
        )}
      </div>
    </div>
  );
}

function useKamonHolders() {
  const erc1155Address = KAMON_TOKEN_ADDRESS || MINT_CLUB.ERC1155;

  return useQuery({
    queryKey: ["kamonHolders", erc1155Address],
    queryFn: async () => {
      if (!KAMON_TOKEN_ADDRESS) return { holders: [], totalMinted: 0 };

      const logs = await getLogsPaginated({
        address: erc1155Address,
        event: transferSingleEvent,
        args: {},
        fromBlock: 0n,
        toBlock: "latest",
      });

      // Track balances: Map<address, Map<tokenId, balance>>
      const balances = new Map();

      for (const log of logs) {
        const { from, to, id, value } = log.args;
        const tokenId = id.toString();
        const amount = BigInt(value);

        // Subtract from sender (unless mint)
        if (from !== ZERO_ADDRESS) {
          const fromLower = from.toLowerCase();
          if (!balances.has(fromLower)) balances.set(fromLower, new Map());
          const fromTokens = balances.get(fromLower);
          const prev = fromTokens.get(tokenId) ?? 0n;
          fromTokens.set(tokenId, prev - amount);
        }

        // Add to receiver (unless burn)
        if (to !== ZERO_ADDRESS) {
          const toLower = to.toLowerCase();
          if (!balances.has(toLower)) balances.set(toLower, new Map());
          const toTokens = balances.get(toLower);
          const prev = toTokens.get(tokenId) ?? 0n;
          toTokens.set(tokenId, prev + amount);
        }
      }

      // Build holder list (only positive balances)
      const holders = [];
      let totalMinted = 0;
      for (const [address, tokens] of balances) {
        const positiveTokens = [];
        for (const [tokenId, balance] of tokens) {
          if (balance > 0n) {
            positiveTokens.push({ tokenId, balance: Number(balance) });
            totalMinted += Number(balance);
          }
        }
        if (positiveTokens.length > 0) {
          holders.push({ address, tokens: positiveTokens });
        }
      }

      holders.sort((a, b) => {
        const aTotal = a.tokens.reduce((s, t) => s + t.balance, 0);
        const bTotal = b.tokens.reduce((s, t) => s + t.balance, 0);
        return bTotal - aTotal;
      });

      return { holders, totalMinted };
    },
    enabled: Boolean(KAMON_TOKEN_ADDRESS),
    staleTime: 60_000,
  });
}

export function KamonStatusTab() {
  const { recipients, totalAttestations, uniqueCount, isLoading: easLoading } =
    useAllAttestations(DOJO_SCHEMA_UID);

  const { data: kamonData, isLoading: kamonLoading } = useKamonHolders();
  const kamonConfigured = Boolean(KAMON_TOKEN_ADDRESS);

  // Count unique attesters from recipient data
  const uniqueRecipients = uniqueCount;

  return (
    <div className="space-y-6">
      {/* EAS Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="size-5" />
            EAS Attestations
          </CardTitle>
          <CardDescription>DOJO schema attestation statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryCard
              icon={Users}
              label="Total Attestations"
              value={totalAttestations}
              isLoading={easLoading}
            />
            <SummaryCard
              icon={Users}
              label="Unique Recipients"
              value={uniqueRecipients}
              isLoading={easLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* ERC1155 Kamon Holders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hexagon className="size-5" />
            Kamon NFT Holders
          </CardTitle>
          <CardDescription>
            {kamonConfigured
              ? "ERC1155 Kamon token holder breakdown"
              : "Set VITE_KAMON_TOKEN_ADDRESS to enable Kamon tracking"}
          </CardDescription>
        </CardHeader>
        {kamonConfigured && (
          <CardContent>
            {kamonLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <SummaryCard
                    icon={Hexagon}
                    label="Total Minted"
                    value={kamonData?.totalMinted ?? 0}
                    isLoading={false}
                  />
                </div>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium">Address</th>
                        <th className="px-3 py-2 text-left font-medium">Token IDs</th>
                        <th className="px-3 py-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kamonData?.holders?.map((h) => (
                        <tr key={h.address} className="border-b last:border-b-0 hover:bg-muted/30">
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              className="font-mono text-xs hover:underline"
                              onClick={() => navigator.clipboard.writeText(h.address)}
                              title="Click to copy"
                            >
                              {truncateAddress(h.address)}
                            </button>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {h.tokens.map((t) => (
                                <Badge key={t.tokenId} variant="outline" className="text-[10px]">
                                  #{t.tokenId} &times;{t.balance}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {h.tokens.reduce((s, t) => s + t.balance, 0)}
                          </td>
                        </tr>
                      ))}
                      {(!kamonData?.holders || kamonData.holders.length === 0) && (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                            No Kamon NFTs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
