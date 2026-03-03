import { createCanvas, loadImage, CanvasRenderingContext2D, Image } from 'canvas';
import { writeFileSync } from 'fs';
import type { FilteredToken } from './types.js';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;
const OUTPUT_PATH = 'output.png';
const TEMPLATE_PATH = 'template.png';

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
}

async function loadTokenImage(url: string | null): Promise<Image | null> {
  if (!url) return null;
  
  try {
    const image = await loadImage(url);
    return image;
  } catch (error) {
    console.warn(`Failed to load image from ${url}:`, error);
    return null;
  }
}

function drawCircularImage(
  ctx: CanvasRenderingContext2D, 
  image: Image, 
  x: number, 
  y: number, 
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, x, y, radius * 2, radius * 2);
  ctx.restore();
}

async function drawTokenRow(
  ctx: CanvasRenderingContext2D, 
  token: FilteredToken, 
  y: number
) {
  // Content area positioning - centered in the dark card area of template
  const leftMargin = 220;  // Start position from left
  const rightMargin = 220; // End position from right
  
  // Rank number (without #)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${token.rank}`, leftMargin, y);
  
  // Token logo (circular) - moved more to the left
  const logoSize = 60;
  const logoRadius = logoSize / 2;
  const logoX = leftMargin + 60;
  const logoY = y - logoSize + 15;
  
  const tokenImage = await loadTokenImage(token.logoURI);
  if (tokenImage) {
    drawCircularImage(ctx, tokenImage, logoX, logoY, logoRadius);
  } else {
    // Fallback circle with token initials
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.arc(logoX + logoRadius, logoY + logoRadius, logoRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(token.symbol.substring(0, 2).toUpperCase(), logoX + logoRadius, logoY + logoRadius + 8);
  }
  
  // Token symbol only (no name) - aligned with logo center
  const nameX = logoX + logoSize + 20;
  const logoCenterY = logoY + logoRadius;  // Center Y position of the logo
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(token.symbol.toUpperCase(), nameX, logoCenterY + 5);
  
  // Volume below the symbol (left side)
  ctx.font = '24px Arial, sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.textAlign = 'left';
  ctx.fillText(`Vol: ${formatNumber(token.volume24hUSD)}`, nameX, logoCenterY + 40);
  
  // Price change percentage (right side, top) - smaller with brighter green
  const rightX = CANVAS_WIDTH - rightMargin;
  
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillStyle = token.priceChange24h > 0 ? '#00ff88' : '#ef4444';
  ctx.textAlign = 'right';
  const priceChangeText = token.priceChange24h > 0 
    ? `+${token.priceChange24h.toFixed(2)}%` 
    : `${token.priceChange24h.toFixed(2)}%`;
  ctx.fillText(priceChangeText, rightX, y - 20);
  
  // Market cap below the percentage (right side) - bold and more prominent
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillStyle = '#d1d5db';
  ctx.textAlign = 'right';
  ctx.fillText(`MC: ${formatNumber(token.marketCap)}`, rightX, y + 12);
}

export async function generateImage(tokens: FilteredToken[]): Promise<string> {
  console.log('Generating image...');
  
  // Load the template image
  const template = await loadImage(TEMPLATE_PATH);
  
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Draw the template as the base
  ctx.drawImage(template, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Position tokens in the content area (the dark card section in the middle)
  // The content area appears to start around y=280 and has space for 5 rows
  const startY = 320;
  const rowSpacing = 130;
  
  for (let i = 0; i < tokens.length; i++) {
    const y = startY + (i * rowSpacing);
    await drawTokenRow(ctx, tokens[i], y);
  }
  
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(OUTPUT_PATH, buffer);
  
  console.log(`Image generated: ${OUTPUT_PATH}`);
  return OUTPUT_PATH;
}
