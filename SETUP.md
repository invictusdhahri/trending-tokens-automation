# Setup Guide

## Quick Start

### 1. Install System Dependencies (macOS)

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

See [INSTALL.md](INSTALL.md) for troubleshooting.

### 2. Install pnpm

```bash
npm install -g pnpm
```

### 3. Install Project Dependencies

```bash
pnpm install
```

### 4. Configure Twitter Credentials

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your Twitter API credentials:

```env
TWITTER_API_KEY=your_actual_api_key
TWITTER_API_SECRET=your_actual_api_secret
TWITTER_ACCESS_TOKEN=your_actual_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_actual_access_token_secret
```

### 5. Get Twitter API Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app (if you haven't already)
3. Go to your app's "Keys and tokens" section
4. Copy:
   - API Key → `TWITTER_API_KEY`
   - API Secret → `TWITTER_API_SECRET`
   - Access Token → `TWITTER_ACCESS_TOKEN`
   - Access Token Secret → `TWITTER_ACCESS_TOKEN_SECRET`

**Important:** Make sure your app has **Read and Write** permissions in the app settings.

### 6. Test Locally

```bash
# Run in development mode (no build needed)
pnpm run dev

# Or build and run
pnpm run build
pnpm start
```

This will:
1. Fetch trending tokens from the API
2. Filter and rank the top 5 gainers
3. Generate a 1080x1080 image
4. Post to Twitter
5. Clean up the temporary image

## GitHub Actions Setup

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Trending tokens Twitter bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trending-tokens-post.git
git push -u origin main
```

### 2. Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:
   - Name: `TWITTER_API_KEY`, Value: your API key
   - Name: `TWITTER_API_SECRET`, Value: your API secret
   - Name: `TWITTER_ACCESS_TOKEN`, Value: your access token
   - Name: `TWITTER_ACCESS_TOKEN_SECRET`, Value: your access token secret

### 3. Run Manually (Optional)

To test before waiting for the scheduled run:

1. Go to **Actions** tab
2. Click **Daily Trending Tokens Post**
3. Click **Run workflow** → **Run workflow**

The workflow will run immediately and you can check the logs.

### 4. Schedule

By default, the bot runs daily at **12:00 UTC**. To change this, edit `.github/workflows/daily-post.yml`:

```yaml
schedule:
  - cron: '0 12 * * *'  # Change the time here
```

Cron format: `minute hour day month weekday`
- `0 12 * * *` = 12:00 UTC daily
- `0 0 * * *` = midnight UTC daily
- `0 */6 * * *` = every 6 hours

## Customization

### Change API Endpoint

Add to your `.env`:

```env
API_ENDPOINT=https://your-custom-api.com/tokens
```

### Change Blocked Tokens

Add to your `.env`:

```env
BLOCKED_SYMBOLS=SOL,JUP,USDC,USDT,YOUR_TOKEN
```

### Modify Image Design

Edit `src/generate-image.ts`:
- Canvas size: `CANVAS_WIDTH`, `CANVAS_HEIGHT`
- Colors: gradient stops, text colors
- Layout: margins, spacing, positioning
- Fonts: font family, sizes, weights

## Troubleshooting

### "Missing required Twitter credentials"

Make sure all 4 Twitter credentials are set in your `.env` file.

### "API request failed"

The MoonSuite API might be down or the endpoint changed. Check the API endpoint in your `.env`.

### "No tokens found after filtering"

All tokens might have negative price changes today, or all positive ones are in the blocked list. Check the console logs.

### Canvas Installation Issues

If you get errors installing `canvas`, you may need system dependencies:

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev librsvg2-dev
```

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

**Windows:**
Follow instructions at: https://github.com/Automattic/node-canvas/wiki/Installation:-Windows

## Project Structure

```
trending-tokens-post/
├── src/
│   ├── types.ts           # TypeScript type definitions
│   ├── fetch-tokens.ts    # API fetching and filtering
│   ├── generate-image.ts  # Canvas-based image generation
│   ├── post-twitter.ts    # Twitter API integration
│   └── main.ts            # Main orchestration script
├── .github/
│   └── workflows/
│       └── daily-post.yml # GitHub Actions workflow
├── .env.example           # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
└── SETUP.md               # This file
```

## How It Works

1. **Fetch**: Gets trending tokens from MoonSuite API
2. **Filter**: Removes tokens with negative price changes and non-memecoins (SOL, JUP, etc.)
3. **Rank**: Sorts by 24h price change descending and takes top 5
4. **Generate**: Creates a 1080x1080 PNG image with token data using node-canvas
5. **Post**: Uploads the image and posts a tweet with token info
6. **Cleanup**: Deletes the temporary image file

## Support

For issues or questions, check:
- Twitter API docs: https://developer.twitter.com/en/docs/twitter-api
- node-canvas docs: https://github.com/Automattic/node-canvas
- GitHub Actions docs: https://docs.github.com/en/actions
