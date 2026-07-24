const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = ALPHABET.length;

export function generateShortCode(length: number = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET[Math.floor(Math.random() * BASE)];
  }
  return result;
}

export function encodeId(num: number): string {
  if (num === 0) return ALPHABET[0];
  let result = '';
  while (num > 0) {
    result = ALPHABET[num % BASE] + result;
    num = Math.floor(num / BASE);
  }
  return result;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

const BLACKLISTED_PREFIXES = ['javascript:', 'data:', 'vbscript:', 'file:'];

export function isSafeUrl(url: string): boolean {
  const lower = url.toLowerCase().trim();
  return !BLACKLISTED_PREFIXES.some((p) => lower.startsWith(p));
}

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function getFaviconUrl(url: string): string {
  const domain = getDomainFromUrl(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function isValidAlias(alias: string): boolean {
  if (!alias) return false;
  return /^[a-zA-Z0-9_-]{3,32}$/.test(alias);
}
