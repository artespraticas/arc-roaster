# 🔥 ARC Wallet Roaster

> **Roast your Arc Testnet wallet — powered by real on-chain data + Claude AI.**

## How It Works

1. Enter any Arc Testnet wallet address
2. Server-side API fetches live data directly from Arc Testnet RPC (no CORS issues)
3. Claude AI generates a personalized savage roast based on real stats

## Tech Stack

- **Next.js** — React + serverless API routes (fixes all CORS problems)
- **Arc Testnet RPC** — `https://rpc.testnet.arc.network` (Chain ID: 5042002)
- **USDC Contract** — `0x3600000000000000000000000000000000000000` (Arc's native system contract)
- **Blockscout API** — `https://testnet.arcscan.app/api` (called server-side)
- **Claude AI** (claude-sonnet-4.5) — generates the roast

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "🔥 ARC Wallet Roaster"
git remote add origin https://github.com/YOUR_USERNAME/arc-wallet-roaster.git
git push -u origin main

# 2. Deploy
vercel --prod
```

No environment variables needed — the Anthropic API is called directly.

## Why Next.js?

The previous HTML version failed because the Blockscout REST API blocks browser requests (CORS). 
Next.js API routes run **server-side on Vercel**, so they can call any external API without CORS restrictions.
