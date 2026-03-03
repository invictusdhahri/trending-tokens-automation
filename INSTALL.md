# Installation Guide

## Prerequisites

### macOS System Dependencies

Before installing the Node dependencies, you need to install system libraries for `canvas`:

```bash
# Fix Homebrew permissions (if needed)
sudo chown -R $(whoami) /opt/homebrew/Cellar

# Install required system dependencies
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

### Verify Installation

Check that pkg-config is installed:

```bash
which pkg-config
pkg-config --version
```

## Install Node Dependencies

This project uses **pnpm** as the package manager.

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

Or using Homebrew:

```bash
brew install pnpm
```

### 2. Install Project Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Twitter API credentials.

### 4. Test the Setup

```bash
pnpm run dev
```

## Troubleshooting

### Canvas Installation Fails

If you get errors about missing `pkg-config`:

1. Make sure Homebrew is properly installed: `brew --version`
2. Install pkg-config: `brew install pkg-config`
3. Try again: `pnpm install`

### Permission Errors with Homebrew

If you see permission errors for `/opt/homebrew/Cellar`:

```bash
sudo chown -R $(whoami) /opt/homebrew/Cellar
```

### Still Having Issues?

The `canvas` library requires these system packages:
- pkg-config
- cairo
- pango
- libpng
- jpeg
- giflib
- librsvg
- pixman

Verify they're all installed:

```bash
brew list | grep -E "(pkg-config|cairo|pango|libpng|jpeg|giflib|librsvg|pixman)"
```
