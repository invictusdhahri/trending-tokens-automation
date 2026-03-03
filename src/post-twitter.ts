import { TwitterApi } from 'twitter-api-v2';
import { readFileSync } from 'fs';
import type { TokenWithSocials } from './types.js';

function validateCredentials() {
  const required = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Twitter credentials: ${missing.join(', ')}`);
  }
}

function createTwitterClient(): TwitterApi {
  validateCredentials();
  
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });
}

function generateFirstTweetText(dayCount: number): string {
  return `Day ${dayCount} of posting trending tokens on Moongate `;
}

function generateReplyTweetText(tokens: TokenWithSocials[]): string {
  const lines = ['Check out these trending tokens:'];
  lines.push('');
  
  tokens.forEach(token => {
    if (token.twitterHandle) {
      lines.push(`${token.rank}. $${token.symbol} @${token.twitterHandle}`);
    } else {
      lines.push(`${token.rank}. $${token.symbol}`);
    }
  });
  
  lines.push('');
  
  return lines.join('\n');
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

async function retryOn503<T>(fn: () => Promise<T>, operation: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const is503 = error?.code === 503 || error?.statusCode === 503;
      if (is503 && attempt < MAX_RETRIES) {
        console.warn(`\n⚠️  ${operation} failed with 503 (attempt ${attempt}/${MAX_RETRIES})`);
        console.warn(`   Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

export async function postTwitterThread(
  imagePath: string, 
  tokens: TokenWithSocials[],
  dayCount: number
): Promise<{ firstTweetUrl: string; replyTweetUrl: string }> {
  console.log('Posting Twitter thread using v2 API (pay-per-usage)...');
  
  try {
    const client = createTwitterClient();
    
    // Upload media (v1.1 endpoint)
    console.log('Uploading media...');
    const imageBuffer = readFileSync(imagePath);
    const mediaId = await client.v1.uploadMedia(imageBuffer, { mimeType: 'image/png' });
    console.log(`Media uploaded with ID: ${mediaId}`);
    
    const firstTweetText = generateFirstTweetText(dayCount);
    const replyTweetText = generateReplyTweetText(tokens);
    console.log('First tweet text:', firstTweetText);
    
    // First tweet with retry
    console.log('Creating first tweet via v2 API...');
    const firstTweet = await retryOn503(
      () => client.v2.tweet({
        text: firstTweetText,
        media: { media_ids: [mediaId] }
      }),
      'First tweet'
    );
    
    const firstTweetId = firstTweet.data.id;
    const firstTweetUrl = `https://twitter.com/i/web/status/${firstTweetId}`;
    console.log(`✅ First tweet posted: ${firstTweetUrl}`);
    
    // Reply tweet with retry
    console.log('Creating reply tweet via v2 API...');
    const replyTweet = await retryOn503(
      () => client.v2.tweet({
        text: replyTweetText,
        reply: { in_reply_to_tweet_id: firstTweetId }
      }),
      'Reply tweet'
    );
    
    const replyTweetId = replyTweet.data.id;
    const replyTweetUrl = `https://twitter.com/i/web/status/${replyTweetId}`;
    console.log(`✅ Reply tweet posted: ${replyTweetUrl}`);
    
    return { firstTweetUrl, replyTweetUrl };
    
  } catch (error: any) {
    console.error('Error posting Twitter thread:', error);
    
    if (error?.code === 401 || error?.statusCode === 401) {
      console.error('\n🔐 Authentication Error (401)');
      console.error('   Your tokens are invalid or expired.');
      console.error('\n   To fix this:');
      console.error('   1. Go to: https://console.x.com');
      console.error('   2. Select your app');
      console.error('   3. Go to "Keys and tokens" tab');
      console.error('   4. Regenerate "Access Token and Secret"');
      console.error('   5. Update your .env file with the new tokens');
      console.error('   6. Make sure app has "Read and Write" permissions');
    } else if (error?.code === 503 || error?.statusCode === 503) {
      console.error('\n⚠️  Twitter API returned 503 after retries');
      console.error('   The v2 API may be having issues. Try again later.');
      console.error('   Check status: https://api.twitterstat.us/');
    } else if (error?.code === 453) {
      console.error('\n❌ API Access Level Issue (453)');
      console.error('   Make sure you have credits in your account.');
      console.error('   Purchase credits at: https://console.x.com');
    }
    
    throw error;
  }
}

// Keep the old function for backward compatibility
export async function postTweet(imagePath: string, tokens: TokenWithSocials[]): Promise<string> {
  console.log('Posting single tweet (legacy method)...');
  const result = await postTwitterThread(imagePath, tokens, 1);
  return result.firstTweetUrl;
}
