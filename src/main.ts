import 'dotenv/config';
import { unlinkSync, existsSync } from 'fs';
import { fetchAndFilterTokens } from './fetch-tokens.js';
import { enrichTokensWithSocials } from './fetch-socials.js';
import { generateImage } from './generate-image.js';
import { postTwitterThread } from './post-twitter.js';
import { incrementDayCount } from './day-counter.js';

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Trending Tokens Twitter Bot');
  console.log('='.repeat(60));
  console.log();
  
  let imagePath: string | null = null;
  
  try {
    // Get the current day count (and increment for next run)
    const dayCount = incrementDayCount();
    console.log(`📅 Day ${dayCount}`);
    console.log();
    
    // Fetch and filter tokens
    const tokens = await fetchAndFilterTokens();
    
    console.log();
    console.log('Top 5 Trending Tokens:');
    tokens.forEach(token => {
      console.log(`  ${token.rank}. ${token.name} (${token.symbol}) - +${token.priceChange24h.toFixed(2)}%`);
    });
    console.log();
    
    // Enrich with social links (Twitter handles)
    const enrichedTokens = await enrichTokensWithSocials(tokens);
    console.log();
    
    // Generate image
    imagePath = await generateImage(enrichedTokens);
    console.log();
    
    // Post Twitter thread
    const { firstTweetUrl, replyTweetUrl } = await postTwitterThread(
      imagePath, 
      enrichedTokens, 
      dayCount
    );
    console.log();
    
    console.log('='.repeat(60));
    console.log('✅ SUCCESS');
    console.log(`First Tweet: ${firstTweetUrl}`);
    console.log(`Reply Tweet: ${replyTweetUrl}`);
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    console.error();
    console.error('='.repeat(60));
    console.error('❌ ERROR');
    console.error('='.repeat(60));
    console.error(error);
    console.error();
    
    process.exit(1);
    
  } finally {
    if (imagePath && existsSync(imagePath)) {
      try {
        unlinkSync(imagePath);
        console.log(`Cleaned up temporary file: ${imagePath}`);
      } catch (error) {
        console.warn(`Failed to delete temporary file: ${imagePath}`);
      }
    }
  }
}

main();
