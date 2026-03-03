# Trending Tokens Twitter Bot

Automated Twitter bot that posts daily trending Solana memecoins with price changes, market caps, and volumes.

## Features

- Fetches trending tokens from MoonSuite API
- Filters out negative price changes and non-memecoins
- Generates beautiful 1080x1080 images with token data
- Posts automatically to Twitter via GitHub Actions
- Runs daily at 12:00 UTC

## Setup

### 1. Install System Dependencies (macOS)

Before installing Node dependencies, install required system libraries:

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

### 2. Install pnpm

```bash
npm install -g pnpm
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Twitter API credentials:

```bash
cp .env.example .env
```

Get your Twitter API credentials from the [X Developer Console](https://console.x.com).

### 5. Run the Bot

```bash
# Development mode (runs immediately and posts)
pnpm run dev

# Production build
pnpm run build
pnpm start
```

## GitHub Actions Setup

1. Push this repository to GitHub
2. Go to Settings → Secrets and variables → Actions
3. Add the following repository secrets:
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_TOKEN_SECRET`

The bot will automatically run daily at 12:00 UTC via GitHub Actions.

## Project Structure

```
trending-tokens-post/
├── src/
│   ├── types.ts           # Token type definitions
│   ├── fetch-tokens.ts    # API fetch + filtering logic
│   ├── fetch-socials.ts   # Moongate API for Twitter handles
│   ├── generate-image.ts  # Canvas-based image generation
│   ├── post-twitter.ts    # Twitter API v2 media upload + tweet
│   ├── day-counter.ts     # Day count for thread series
│   └── main.ts            # Orchestration entry point
├── template.png           # Image template
├── .github/
│   └── workflows/
│       └── daily-post.yml # Cron schedule + job definition
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## License

MIT
