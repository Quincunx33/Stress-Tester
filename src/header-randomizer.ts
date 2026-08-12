// src/header-randomizer.ts - Advanced Header & Fingerprint Randomization

export interface BrowserFingerprint {
  userAgent: string;
  acceptLanguage: string;
  secChUa: string;
  secChUaPlatform: string;
  secChUaMobile: string;
  platform: string;
  screenResolution: string;
  colorDepth: string;
  timezone: string;
  languages: string[];
  fonts: string[];
}

const BROWSER_FINGERPRINTS: BrowserFingerprint[] = [
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    acceptLanguage: 'en-US,en;q=0.9',
    secChUa: '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: '?0',
    platform: 'Win32',
    screenResolution: '1920x1080',
    colorDepth: '24',
    timezone: 'America/New_York',
    languages: ['en-US', 'en'],
    fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana']
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    acceptLanguage: 'en-US,en;q=0.9,fr;q=0.8',
    secChUa: '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: '?0',
    platform: 'MacIntel',
    screenResolution: '2560x1440',
    colorDepth: '30',
    timezone: 'America/Los_Angeles',
    languages: ['en-US', 'en', 'fr'],
    fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'San Francisco']
  },
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    acceptLanguage: 'en-US,en;q=0.5',
    secChUa: '"Not/A)Brand";v="99", "Firefox";v="125"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: '?0',
    platform: 'Win64',
    screenResolution: '1920x1080',
    colorDepth: '24',
    timezone: 'Europe/London',
    languages: ['en-US', 'en'],
    fonts: ['Arial', 'Times New Roman', 'Verdana', 'Courier New']
  },
  {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    acceptLanguage: 'en-US,en;q=0.9',
    secChUa: '"Not/A)Brand";v="99", "Safari";v="17"',
    secChUaPlatform: '"iOS"',
    secChUaMobile: '?1',
    platform: 'iPhone',
    screenResolution: '1170x2532',
    colorDepth: '24',
    timezone: 'America/New_York',
    languages: ['en-US', 'en'],
    fonts: ['San Francisco', 'Helvetica', 'Arial']
  },
  {
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.113 Mobile Safari/537.36',
    acceptLanguage: 'en-US,en;q=0.9',
    secChUa: '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    secChUaPlatform: '"Android"',
    secChUaMobile: '?1',
    platform: 'Linux armv8l',
    screenResolution: '1080x2340',
    colorDepth: '24',
    timezone: 'Asia/Dhaka',
    languages: ['en-US', 'en', 'bn'],
    fonts: ['Roboto', 'Noto Sans']
  },
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    acceptLanguage: 'en-US,en;q=0.9',
    secChUa: '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
    secChUaPlatform: '"Windows"',
    secChUaMobile: '?0',
    platform: 'Win32',
    screenResolution: '1920x1080',
    colorDepth: '24',
    timezone: 'Europe/London',
    languages: ['en-US', 'en'],
    fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Segoe UI']
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0',
    acceptLanguage: 'en-US,en;q=0.9,de;q=0.8',
    secChUa: '"Chromium";v="124", "Opera";v="110", "Not-A.Brand";v="99"',
    secChUaPlatform: '"macOS"',
    secChUaMobile: '?0',
    platform: 'MacIntel',
    screenResolution: '2560x1600',
    colorDepth: '30',
    timezone: 'Europe/Berlin',
    languages: ['en-US', 'en', 'de'],
    fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Verdana']
  }
];

export function generateRandomFingerprint(): BrowserFingerprint {
  const fp = BROWSER_FINGERPRINTS[Math.floor(Math.random() * BROWSER_FINGERPRINTS.length)];
  return {
    ...fp,
    screenResolution: randomizeScreenResolution(fp.screenResolution),
    timezone: randomizeTimezone(fp.timezone),
    fonts: [...fp.fonts, getRandomFont()]
  };
}

function randomizeScreenResolution(resolution: string): string {
  const [width, height] = resolution.split('x').map(Number);
  const variations = [
    `${width}x${height}`,
    `${width+1}x${height}`,
    `${width}x${height+1}`,
    `${width+2}x${height}`,
    `${width}x${height+2}`,
    `${width-1}x${height}`,
    `${width}x${height-1}`
  ];
  return variations[Math.floor(Math.random() * variations.length)];
}

function randomizeTimezone(timezone: string): string {
  const timezones = [
    'America/New_York', 'America/Los_Angeles', 'Europe/London', 
    'Europe/Paris', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo',
    'Australia/Sydney', 'Pacific/Auckland', 'America/Sao_Paulo',
    'Africa/Cairo', 'Asia/Kolkata', 'Europe/Moscow'
  ];
  return Math.random() > 0.5 ? timezone : timezones[Math.floor(Math.random() * timezones.length)];
}

function getRandomFont(): string {
  const fonts = ['Impact', 'Comic Sans MS', 'Calibri', 'Cambria', 'Georgia', 
    'Palatino', 'Tahoma', 'Trebuchet MS', 'Arial Black', 'Bookman'];
  return fonts[Math.floor(Math.random() * fonts.length)];
}

export function generateRandomHeaders(requestId: number, bypassCloudflare: boolean = true): Record<string, string> {
  const fp = generateRandomFingerprint();
  const headers: Record<string, string> = {
    'User-Agent': fp.userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': fp.acceptLanguage,
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': fp.secChUa,
    'Sec-Ch-Ua-Mobile': fp.secChUaMobile,
    'Sec-Ch-Ua-Platform': fp.secChUaPlatform,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive',
    'DNT': Math.random() > 0.5 ? '1' : '0',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Forwarded-For': generateRandomIP(),
    'X-Real-IP': generateRandomIP()
  };

  if (bypassCloudflare) {
    const cacheBust = `_cb=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
    headers['X-Cache-Buster'] = cacheBust;
  }

  return headers;
}

function generateRandomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

export function obfuscatePayload(payload: string, intensity: number = 5): string {
  if (!payload || payload.trim() === '') return payload;
  
  const obfuscationLevel = Math.min(10, Math.max(1, intensity));
  let obfuscated = payload;
  
  for (let i = 0; i < obfuscationLevel; i++) {
    const technique = Math.floor(Math.random() * 5);
    
    switch (technique) {
      case 0:
        obfuscated = obfuscated.split('').map(c => 
          Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()
        ).join('');
        break;
      case 1:
        obfuscated = obfuscated.replace(/\s+/g, (match) => {
          return ' ' + (Math.random() > 0.3 ? `/**/${match}` : match);
        });
        break;
      case 2:
        obfuscated = obfuscated.replace(/\s/g, match => {
          return Math.random() > 0.5 ? `%${match.charCodeAt(0).toString(16)}` : match;
        });
        break;
      case 3:
        obfuscated = obfuscated.replace(/\s/g, match => {
          return Math.random() > 0.3 ? match + ' '.repeat(Math.floor(Math.random() * 3) + 1) : match;
        });
        break;
      case 4:
        if (Math.random() > 0.5) {
          obfuscated = obfuscated.replace(/\s/g, match => {
            return encodeURIComponent(match);
          });
        }
        break;
    }
  }
  
  return obfuscated;
}

export function generateSearchQuery(intensity: number = 5): string {
  const baseQueries = [
    'admin', 'login', 'password', 'user', 'test', 'debug', 'root',
    'config', 'backup', 'db', 'database', 'sql', 'mysql', 'postgres',
    'index', 'home', 'dashboard', 'api', 'v1', 'v2', 'version',
    'status', 'health', 'ping', 'info', 'data', 'export', 'import'
  ];
  
  const numQueries = Math.floor(Math.random() * intensity) + 1;
  const queries: string[] = [];
  
  for (let i = 0; i < numQueries; i++) {
    const base = baseQueries[Math.floor(Math.random() * baseQueries.length)];
    const param = randomizeParameter(base);
    queries.push(param);
  }
  
  return queries.join('&');
}

function randomizeParameter(base: string): string {
  const prefixes = ['q', 'search', 's', 'query', 'id', 'key', 'value', 'param'];
  const suffix = Math.floor(Math.random() * 1000);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  const variants = [
    `${base}`,
    `${base}${suffix}`,
    `${base}_${suffix}`,
    `${prefix}=${base}`,
    `${prefix}=${base}${suffix}`,
    `?${base}=${suffix}`,
    `${prefix}[]=${base}`,
    `${base}.${suffix}`
  ];
  
  return variants[Math.floor(Math.random() * variants.length)];
}

export function calculateRandomDelay(baseDelay: number = 0, jitter: number = 0, adaptive: number = 0): number {
  let delay = baseDelay;
  if (jitter > 0) {
    delay += Math.random() * jitter;
  }
  if (adaptive > 0) {
    delay += adaptive;
  }
  delay += Math.random() * 20;
  return Math.round(delay);
}
