/**
 * @sekigahara/engine — shared components, hooks, and utilities
 * for the Sekigahara ecosystem on Base.
 */

// Components — Layout
export { Header } from "./src/components/layout/Header.jsx";
export { Footer } from "./src/components/layout/Footer.jsx";
export { PageWrapper } from "./src/components/layout/PageWrapper.jsx";
export { NetworkGuardBanner } from "./src/components/layout/NetworkGuardBanner.jsx";
export { BackSekiLink } from "./src/components/layout/BackSekiLink.jsx";
export { ErrorBoundary } from "./src/components/layout/ErrorBoundary.jsx";

// Components — Auth
export { LoginModal } from "./src/components/auth/LoginModal.jsx";
export { MiniAppAutoConnect } from "./src/components/auth/MiniAppAutoConnect.jsx";

// Components — Swap
export { SwapPanel } from "./src/components/swap/SwapPanel.jsx";
export { PriceDisplay } from "./src/components/swap/PriceDisplay.jsx";

// UI (shadcn re-exports)
export { Button, buttonVariants } from "./src/components/ui/button.jsx";
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from "./src/components/ui/card.jsx";
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./src/components/ui/dialog.jsx";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from "./src/components/ui/dropdown-menu.jsx";
export { Input } from "./src/components/ui/input.jsx";
export { Avatar, AvatarImage, AvatarFallback } from "./src/components/ui/avatar.jsx";
export { Badge, badgeVariants } from "./src/components/ui/badge.jsx";
export { Progress } from "./src/components/ui/progress.jsx";
export { Skeleton } from "./src/components/ui/skeleton.jsx";
export { Separator } from "./src/components/ui/separator.jsx";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./src/components/ui/tabs.jsx";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./src/components/ui/tooltip.jsx";
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./src/components/ui/sheet.jsx";
export { Alert, AlertTitle, AlertDescription } from "./src/components/ui/alert.jsx";
export { AnimatedTabsList, AnimatedTabsTrigger } from "./src/components/ui/animated-tabs.jsx";
export { Toaster } from "./src/components/ui/sonner.jsx";

// Hooks
export { useFarcaster } from "./src/hooks/useFarcaster.js";
export { useFarcasterSignIn } from "./src/hooks/useFarcasterSignIn.js";
export { useMiniAppContext } from "./src/hooks/useMiniAppContext.js";
export { useAddApp } from "./src/hooks/useAddApp.js";
export { useLoginModal } from "./src/hooks/useLoginModal.js";
export { useNetworkGuard } from "./src/hooks/useNetworkGuard.js";
export { useShareToFarcaster } from "./src/hooks/useShareToFarcaster.js";
export { useTheme } from "./src/hooks/useTheme.js";
export { useTokenPrice } from "./src/hooks/useTokenPrice.js";
export { useWalletAddress } from "./src/hooks/useWalletAddress.js";
export { useAttestationHistory } from "./src/hooks/useAttestationHistory.js";

// Context & Providers
export { EngineConfigProvider, useEngineConfig } from "./src/context/EngineConfigContext.jsx";
export { FarcasterProvider } from "./src/context/FarcasterProvider.jsx";
export { LoginModalProvider } from "./src/context/LoginModalContext.jsx";

// Lib
export { cn } from "./src/lib/utils.js";
export { mintclub, ensureInitialized as ensureMintclubInitialized } from "./src/lib/mintclub.js";
export { parseContractError } from "./src/lib/parseContractError.js";
export { fadeInUp, staggerDelay, tapSpring, tabContent } from "./src/lib/motion.js";
export { getLogsPaginated, getBlockTimestamps } from "./src/lib/getLogsPaginated.js";
export { getCached, setCached, setCachedOnce, setStoragePrefix } from "./src/lib/immutableCache.js";

// Config (infrastructure — same across all apps)
export { activeChain, SUPPORTED_CHAINS } from "./src/config/chains.js";
export { getEnv } from "./src/config/env.js";
export { EAS_ADDRESS, SCHEMA_REGISTRY_ADDRESS, MINT_CLUB } from "./src/config/contracts.js";
export { createWagmiConfig } from "./src/config/wagmi.js";
export { easAbi } from "./src/config/abis/eas.js";
export { merkleDistributorAbi } from "./src/config/abis/merkleDistributor.js";

// i18n
export { initI18n, baseTranslations } from "./src/i18n/index.js";

// Test utilities
export { TestWrapper } from "./src/test/wrapper.jsx";
