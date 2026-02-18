# CLAUDE.md — AMATERASU Template

## Project Overview

AMATERASU is a template for building apps in the Sekigahara ecosystem on the Hunt Town Co-op (Base chain). Hub-and-spoke token model: `$SEKI` (HUNT-backed parent) → child tokens (one per app). Fork this template, set env vars, rename tokens, build your HomePage, deploy.

## Tech Stack

| Layer         | Technology                                                 |
| ------------- | ---------------------------------------------------------- |
| Framework     | React 18 + Vite                                            |
| Language      | JavaScript (not TypeScript unless consuming TS packages)   |
| Styling       | Tailwind CSS + shadcn/ui                                   |
| Wallet        | wagmi v2 + viem                                            |
| Wallet UI     | RainbowKit (custom SIWF modal, reused from SecondOrder)    |
| Chain         | Base (Chain ID: 8453)                                      |
| Token Ops     | Mint Club V2 SDK (`mint.club-v2-sdk`)                      |
| State         | TanStack Query (`@tanstack/react-query`) for onchain reads |
| i18n          | `react-i18next` + `i18next`                                |
| Hosting (dev) | Vercel                                                     |
| Hosting (prod)| IPFS (Pinata) + ENS + eth.limo                             |

## Coding Standards

### General

- JavaScript, not TypeScript (unless the package requires it).
- ES modules only (`import`/`export`). Never CommonJS.
- `const` over `let`. Never `var`.
- Arrow functions for callbacks. Named functions for top-level declarations.
- Named exports for components and hooks. Default exports only for pages.
- No `console.log` in committed code. Use a logger utility or strip in build.

### React

- Functional components only.
- One component per file. Filename matches component name (PascalCase).
- Hooks go in `src/hooks/`, prefixed with `use`.
- Components stay under 150 lines. Extract logic into hooks, UI into sub-components.
- TanStack Query for all onchain/async data. No `useEffect` for data fetching.
- Destructure props in function signatures.

### Styling

- Tailwind utility classes only. No inline styles, CSS modules, or styled-components.
- shadcn/ui for all standard UI elements.
- Theme tokens in `tailwind.config.js`. Never hardcode hex values in JSX.
- Light and dark modes required. Use CSS variables via shadcn theming.

### File Structure

```zsh
src/
├── main.jsx
├── App.jsx
├── config/           # Chain, addresses, ABIs
│   ├── chains.js
│   ├── contracts.js
│   └── abis/
├── hooks/            # Custom React hooks
├── components/
│   ├── layout/       # Header, Footer, PageWrapper
│   ├── swap/         # Token swap UI
│   └── ui/           # shadcn/ui generated components
├── pages/            # Route-level components (default exports)
├── lib/              # Utilities, formatters, helpers
├── i18n/             # Translation config and locale files
│   ├── index.js
│   └── locales/
│       ├── en.json
│       ├── ja.json
│       └── kr.json
└── assets/           # Static images, fonts, textures
```

### Contract Interaction

- `viem` for all contract reads/writes. Do not use `ethers.js`.
- ABI files in `src/config/abis/` as named JS exports.
- `useReadContract` / `useWriteContract` from wagmi for React integration.
- Mint Club V2 SDK for bonding curve operations (buy, sell, price).
- **Normalize hex at the config boundary** — Addresses and bytes32 values from env vars must be lowercased when loaded in `src/config/contracts.js`. Base RPCs do case-sensitive hex comparison on topic filters; viem lowercases addresses but NOT bytes32 values.

### i18n

- ALL user-facing strings use translation keys via `react-i18next`.
- Zero hardcoded strings in JSX. No exceptions.
- JSON locale files, organized by feature namespace.
- `en` is primary. `ja` is secondary, `kr` tertiary.

### Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Branch naming: `feat/feature-name`, `fix/bug-name`.
- Never commit `.env`. Provide `.env.example`.

### Semantic Versioning

Update `package.json` version following semver:

- **MAJOR** (x.0.0): Breaking changes
- **MINOR** (0.x.0): New features, backward compatible
- **PATCH** (0.0.x): Bug fixes, backward compatible

### Farcaster SIWF (Sign In With Farcaster)

- **SIWE nonces must be alphanumeric** — Use `crypto.randomUUID().replaceAll('-', '')`.
- **SIWF domain must match** — Backend `verifySignInMessage` must use the domain from the signed SIWE message.
- **`@farcaster/auth-kit` versioning** — Keep up to date. Old versions (< 0.8.x) may fail silently.

### Environment Variables

```text
VITE_WALLETCONNECT_PROJECT_ID=       # WalletConnect Cloud project ID
VITE_SEKI_TOKEN_ADDRESS=             # $SEKI parent token
VITE_APP_TOKEN_ADDRESS=              # Child token on Mint Club
VITE_ALCHEMY_API_KEY=                # Optional premium Base RPC
```

### Storage Keys

- `amaterasu:farcaster_profile` — sessionStorage for Farcaster profile
- `amaterasu:immutable:*` — localStorage for immutable onchain cache

## Hard Rules

- Do NOT use `ethers.js`. Use `viem`.
- Do NOT create CSS files. Use Tailwind.
- Do NOT hardcode colors. Use theme tokens.
- Do NOT fetch data in `useEffect`. Use TanStack Query.
- Do NOT use `localStorage` for critical state. Onchain is truth.
- Do NOT build anything requiring a persistent backend server. Static builds only.
- Do NOT skip i18n. Every user-facing string goes through translations.
- Do NOT deploy anything that fails the walkaway test. If we disappear, contracts and IPFS frontend must keep working.
- Do NOT use hex values without lowercasing first. Normalize all addresses and bytes32 at the config boundary (`src/config/contracts.js`).
