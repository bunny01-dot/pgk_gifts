import { getAdminAppCheck } from '@/firebase/admin';
import { logger } from './logger';

// In-memory rate limiting map
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
let lastCleanup = Date.now();

function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastCleanup < 60000) return; // Clean up at most once per minute
  lastCleanup = now;
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

/**
 * Checks if the given IP address is rate limited.
 * Uses a sliding/fixed-window counter.
 */
export function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  cleanupRateLimits();
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return false;
  }

  record.count++;
  if (record.count > limit) {
    logger.warn('Rate limit exceeded', { ip, count: record.count, limit });
    return true;
  }

  return false;
}

/**
 * Validates the request headers to protect against CSRF attacks.
 */
export function verifyCsrf(request: Request): boolean {
  const host = request.headers.get('host');
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        logger.warn('CSRF origin mismatch', { origin: originUrl.host, host });
        return false;
      }
    } catch {
      logger.warn('Invalid CSRF origin header', { origin });
      return false;
    }
  } else if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        logger.warn('CSRF referer mismatch', { referer: refererUrl.host, host });
        return false;
      }
    } catch {
      logger.warn('Invalid CSRF referer header', { referer });
      return false;
    }
  }

  return true;
}

/**
 * Verifies the Firebase App Check token if running in production.
 */
export async function verifyAppCheck(request: Request): Promise<boolean> {
  // Allow skipping during local development to facilitate testing
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // Bypass App Check if reCAPTCHA site key is not configured or is placeholder
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || siteKey === '6Ld-placeholder-recaptcha-key') {
    return true;
  }

  const appCheckToken = request.headers.get('x-firebase-appcheck');
  if (!appCheckToken) {
    logger.warn('App Check token is missing');
    return false;
  }

  try {
    await getAdminAppCheck().verifyToken(appCheckToken);
    return true;
  } catch (error) {
    logger.error('App Check token verification failed', error);
    return false;
  }
}
