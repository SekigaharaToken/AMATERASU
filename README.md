# AMATERASU

Sekigahara app engine for building ecosystem apps on Base chain with Farcaster MiniApp support.

## What Is This?

AMATERASU is the Sekigahara app engine. It provides:

- Farcaster MiniApp auto-connect + standalone wallet support (RainbowKit)
- Sign In With Farcaster (SIWF) authentication
- Token swap UI via Mint Club V2 bonding curves
- i18n (English, Japanese, Korean)
- Light/dark theme with shadcn/ui components
- Static-first architecture (no backend server required)

Fork AMATERASU, customize it for your app, and deploy.

## Quick Start

```bash
# 1. Clone/fork AMATERASU
cp -r AMATERASU/ my-app/
cd my-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your WalletConnect project ID and token addresses

# 4. Start development
npm run dev
```

## Customization Guide

### 1. Rename Your App

- `package.json` — Change `name` field
- `index.html` — Update `<title>` and `fc:frame` meta
- `src/i18n/locales/*.json` — Update `app.name` and `app.tagline`
- `src/config/wagmi.js` — Update `appName`
- `src/context/FarcasterProvider.jsx` — Update storage key prefix
- `src/lib/immutableCache.js` — Update storage key prefix

### 2. Set Your Token

- Create your child token on [Mint Club](https://mint.club) backed by $SEKI
- Set `VITE_APP_TOKEN_ADDRESS` in `.env`
- Update `SWAP_TOKENS` in `src/config/contracts.js` with your token label

### 3. Build Your HomePage

- Replace `src/pages/HomePage.jsx` with your app's main experience
- Add new components in `src/components/your-feature/`
- Add new hooks in `src/hooks/`

### 4. Update Theme

- Edit `src/index.css` with your color palette (both light and dark modes)
- Update RainbowKit accent color in `src/main.jsx`

### 5. Replace Assets

- `public/icon.png` — App icon (used as favicon and Farcaster splash)
- `public/og-image.png` — Open Graph image
- `public/.well-known/farcaster.json` — Farcaster manifest (update URLs, account association)

### 6. Update Farcaster Manifest

Edit `public/.well-known/farcaster.json`:
- Generate a new `accountAssociation` for your domain
- Update all URLs to your deployment domain
- Set your app name and description

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run tests
npm run lint     # Lint code
```

## Architecture

```
src/
├── components/
│   ├── auth/      # Login modal, MiniApp auto-connect
│   ├── layout/    # Header, Footer, PageWrapper, ErrorBoundary
│   ├── swap/      # Token swap panel + price display
│   └── ui/        # shadcn/ui primitives
├── config/        # Chain config, contract addresses, wagmi
├── context/       # Farcaster auth, login modal state
├── hooks/         # Reusable React hooks
├── i18n/          # Translation files (en/ja/kr)
├── lib/           # Utilities (Mint Club, motion, caching)
└── pages/         # Route-level components
```

## License

MIT
