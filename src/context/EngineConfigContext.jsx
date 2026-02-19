import { createContext, useContext } from "react";

const EngineConfigContext = createContext(null);

/**
 * Provide app-specific configuration to shared engine components.
 *
 * Config shape:
 *   appName       — wagmi appName, document title (e.g. "DOJO")
 *   storagePrefix — sessionStorage/localStorage key prefix (e.g. "dojo")
 *   accentColor   — RainbowKit accent (e.g. "#B33030")
 *   swapTokens    — SWAP_TOKENS array from app's contracts.js
 *   tokenAddresses — { seki, app } token addresses for balance display
 */
export function EngineConfigProvider({ config, children }) {
  return (
    <EngineConfigContext.Provider value={config}>
      {children}
    </EngineConfigContext.Provider>
  );
}

export function useEngineConfig() {
  const config = useContext(EngineConfigContext);
  if (!config) throw new Error("Wrap your app in <EngineConfigProvider>");
  return config;
}
