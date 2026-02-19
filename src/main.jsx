import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/sonner.jsx";
import { MiniAppAutoConnect } from "./components/auth/MiniAppAutoConnect.jsx";
import { FarcasterProvider } from "./context/FarcasterProvider.jsx";
import { LoginModalProvider } from "./context/LoginModalContext.jsx";
import { EngineConfigProvider } from "./context/EngineConfigContext.jsx";
import { createWagmiConfig } from "./config/wagmi.js";
import { SWAP_TOKENS } from "./config/contracts.js";
import { setStoragePrefix } from "./lib/immutableCache.js";
import { initI18n } from "./i18n/index.js";
import appEn from "./i18n/locales/app.en.json";
import appJa from "./i18n/locales/app.ja.json";
import appKr from "./i18n/locales/app.kr.json";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.jsx";
import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";

// Initialize i18n with AMATERASU app translations
initI18n({ en: appEn, ja: appJa, kr: appKr });

// Set storage prefix for immutable cache
setStoragePrefix("amaterasu");

const wagmiConfig = createWagmiConfig({ appName: "AMATERASU" });

const engineConfig = {
  appName: "AMATERASU",
  storagePrefix: "amaterasu",
  accentColor: "#a15f62",
  swapTokens: SWAP_TOKENS,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 2,
    },
  },
});

const authKitConfig = {
  rpcUrl: "https://mainnet.optimism.io",
  domain: typeof window !== "undefined" ? window.location.host : "localhost",
  siweUri: typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <EngineConfigProvider config={engineConfig}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <MiniAppAutoConnect />
            <AuthKitProvider config={authKitConfig}>
              <RainbowKitProvider
                theme={darkTheme({
                  accentColor: engineConfig.accentColor,
                  borderRadius: "medium",
                })}
              >
                <FarcasterProvider>
                  <LoginModalProvider>
                    <BrowserRouter>
                      <App />
                      <Toaster />
                      <Analytics />
                    </BrowserRouter>
                  </LoginModalProvider>
                </FarcasterProvider>
              </RainbowKitProvider>
            </AuthKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </EngineConfigProvider>
    </ThemeProvider>
  </StrictMode>,
);
