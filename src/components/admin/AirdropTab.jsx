import { useState, useMemo } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, isAddress, maxUint256 } from "viem";
import {
  Plane,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Badge } from "../ui/badge.jsx";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert.jsx";
import {
  MINT_CLUB,
  DOJO_TOKEN_ADDRESS,
  SEKI_TOKEN_ADDRESS,
} from "../../config/contracts.js";
import { merkleDistributorAbi } from "../../config/abis/merkleDistributor.js";
import { generateMerkleRoot, uploadToPinata } from "../../lib/merkle.js";

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
];

const TOKEN_OPTIONS = [
  { label: "$DOJO", address: DOJO_TOKEN_ADDRESS },
  { label: "$SEKI", address: SEKI_TOKEN_ADDRESS },
];

function parseWalletList(text) {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => isAddress(s));
}

export function AirdropTab() {
  const { address: operatorAddress } = useAccount();

  // Form state
  const [selectedToken, setSelectedToken] = useState(TOKEN_OPTIONS[0].label);
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [walletText, setWalletText] = useState("");
  const [amountPerClaim, setAmountPerClaim] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Submission state
  const [step, setStep] = useState("idle"); // idle | uploading | approving | creating | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [distributionId, setDistributionId] = useState(null);

  // Derived
  const tokenOption = TOKEN_OPTIONS.find((t) => t.label === selectedToken);
  const tokenAddress =
    selectedToken === "Custom"
      ? customTokenAddress.trim().toLowerCase()
      : tokenOption?.address || "";
  const wallets = useMemo(() => parseWalletList(walletText), [walletText]);
  const walletCount = wallets.length;
  const amountBn = amountPerClaim ? parseUnits(amountPerClaim, 18) : 0n;
  const totalNeeded = amountBn * BigInt(walletCount || 0);

  // Read operator's token balance
  const { data: balance } = useReadContract({
    address: tokenAddress || undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: operatorAddress ? [operatorAddress] : undefined,
    query: { enabled: Boolean(tokenAddress && operatorAddress) },
  });

  // Read current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress || undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: operatorAddress ? [operatorAddress, MINT_CLUB.MERKLE] : undefined,
    query: { enabled: Boolean(tokenAddress && operatorAddress) },
  });

  const hasEnoughBalance = balance != null && balance >= totalNeeded;
  const needsApproval = allowance != null && allowance < totalNeeded;

  const { writeContractAsync: writeApprove } = useWriteContract();
  const { writeContractAsync: writeCreate } = useWriteContract();

  const isValid =
    tokenAddress &&
    isAddress(tokenAddress) &&
    walletCount > 0 &&
    amountBn > 0n &&
    startDate &&
    endDate &&
    title.trim();

  async function handleSubmit() {
    if (!isValid) return;

    try {
      setStep("uploading");
      setErrorMsg("");

      // 1. Generate merkle root
      const merkleRoot = generateMerkleRoot(wallets);

      // 2. Upload wallet list to Pinata
      const ipfsCID = await uploadToPinata(wallets);

      // 3. Approve if needed
      if (needsApproval) {
        setStep("approving");
        const approveTx = await writeApprove({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [MINT_CLUB.MERKLE, maxUint256],
        });
        // Wait for approval to be mined — we just wait briefly
        // In production you'd use useWaitForTransactionReceipt
        await new Promise((r) => setTimeout(r, 5000));
        await refetchAllowance();
      }

      // 4. Create distribution
      setStep("creating");
      const startTime = Math.floor(new Date(startDate).getTime() / 1000);
      const endTime = Math.floor(new Date(endDate).getTime() / 1000);

      const tx = await writeCreate({
        address: MINT_CLUB.MERKLE,
        abi: merkleDistributorAbi,
        functionName: "createDistribution",
        args: [
          tokenAddress,
          true, // isERC20
          amountBn,
          walletCount,
          startTime,
          endTime,
          merkleRoot,
          title.trim(),
          ipfsCID,
        ],
      });

      setStep("done");
    } catch (err) {
      setStep("error");
      setErrorMsg(err?.shortMessage || err?.message || "Transaction failed");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="size-5" />
          Create Airdrop Distribution
        </CardTitle>
        <CardDescription>
          Generate a merkle tree, upload to IPFS, and create a distribution on Mint Club.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Token Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Token</label>
          <div className="flex flex-wrap gap-2">
            {TOKEN_OPTIONS.map((t) => (
              <Button
                key={t.label}
                variant={selectedToken === t.label ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedToken(t.label)}
              >
                {t.label}
              </Button>
            ))}
            <Button
              variant={selectedToken === "Custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedToken("Custom")}
            >
              Custom
            </Button>
          </div>
          {selectedToken === "Custom" && (
            <Input
              placeholder="Token contract address (0x...)"
              value={customTokenAddress}
              onChange={(e) => setCustomTokenAddress(e.target.value)}
              className="mt-2 font-mono text-xs"
            />
          )}
        </div>

        {/* Wallet List */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Wallet Addresses{" "}
            <span className="text-muted-foreground font-normal">
              (one per line or comma-separated)
            </span>
          </label>
          <textarea
            className="dark:bg-input/30 border-input min-h-32 w-full rounded-md border bg-transparent px-3 py-2 font-mono text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            value={walletText}
            onChange={(e) => setWalletText(e.target.value)}
            placeholder={"0x1234...abcd\n0x5678...efgh"}
          />
          <p className="text-xs text-muted-foreground">
            {walletCount} valid address{walletCount !== 1 ? "es" : ""} detected
          </p>
        </div>

        {/* Amount + Title */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount Per Claim</label>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 100"
              value={amountPerClaim}
              onChange={(e) => setAmountPerClaim(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g. Week 12 Payout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Preview */}
        {walletCount > 0 && amountBn > 0n && (
          <div className="space-y-2 rounded-lg border p-4">
            <h4 className="text-sm font-medium">Preview</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Wallets:</span>{" "}
                <span className="tabular-nums">{walletCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Per Claim:</span>{" "}
                <span className="tabular-nums">{amountPerClaim}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Tokens:</span>{" "}
                <span className="tabular-nums">{formatUnits(totalNeeded, 18)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Your Balance:</span>{" "}
                <span className="tabular-nums">
                  {balance != null ? formatUnits(balance, 18) : "—"}
                </span>
              </div>
            </div>
            {balance != null && !hasEnoughBalance && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="size-4" />
                <AlertTitle>Insufficient Balance</AlertTitle>
                <AlertDescription>
                  You need {formatUnits(totalNeeded - balance, 18)} more tokens.
                </AlertDescription>
              </Alert>
            )}
            {needsApproval && (
              <Badge variant="outline" className="mt-1">
                Approval required
              </Badge>
            )}
          </div>
        )}

        {/* Status */}
        {step === "done" && (
          <Alert>
            <CheckCircle2 className="size-4" />
            <AlertTitle>Distribution Created</AlertTitle>
            <AlertDescription>
              Airdrop distribution created successfully. Check the Payouts tab for status.
            </AlertDescription>
          </Alert>
        )}

        {step === "error" && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Submit */}
        <Button
          className="w-full"
          disabled={!isValid || !hasEnoughBalance || step === "uploading" || step === "approving" || step === "creating"}
          onClick={handleSubmit}
        >
          {step === "uploading" && (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Uploading to IPFS...
            </>
          )}
          {step === "approving" && (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Approving Token Spend...
            </>
          )}
          {step === "creating" && (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating Distribution...
            </>
          )}
          {step === "idle" && (
            <>
              <Plane className="mr-2 size-4" />
              {needsApproval ? "Approve & Create Distribution" : "Create Distribution"}
            </>
          )}
          {step === "done" && "Create Another"}
          {step === "error" && "Retry"}
        </Button>
      </CardContent>
    </Card>
  );
}
