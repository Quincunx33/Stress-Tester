import http from "http";
import https from "https";
import http2 from "http2";
import tls from "tls";
import dns from "dns";
import { URL } from "url";

export interface SecurityHeaderCheck {
  name: string;
  header: string;
  present: boolean;
  value?: string;
  recommendation: string;
}

export interface TlsCertificateInfo {
  valid: boolean;
  subject?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  protocol?: string;
  cipher?: string;
  authorized?: boolean;
  authorizationError?: string;
}

export interface ServerFingerprint {
  target: string;
  normalizedUrl: string;
  ip: string;
  ipv6?: string;
  hostname: string;
  reverseDns?: string;
  cloudProvider?: string;
  asnName?: string;
  statusCode: number;
  statusMessage: string;
  responseTimeMs: number;
  serverSoftware: string;
  serverVersion?: string;
  operatingSystem?: string;
  programmingLanguage?: string;
  framework?: string;
  cms?: string;
  wafOrCdn: string;
  wafConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  wafDetails?: string[];
  supportedProtocols: string[];
  hasHttp2: boolean;
  hasHttp3: boolean;
  http3AltSvc?: string;
  tlsInfo?: TlsCertificateInfo;
  securityHeadersScore: {
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    score: number; // 0 - 100
    passed: number;
    total: number;
    checks: SecurityHeaderCheck[];
  };
  cookies: string[];
  rawHeaders: Record<string, string>;
  inspectedAt: string;
}

/**
 * Identify Cloud or Hosting provider from Hostname, Reverse DNS, or IP hints
 */
function identifyCloudProvider(hostname: string, reverseDns?: string, ip?: string): string {
  const checkStr = `${hostname} ${reverseDns || ''} ${ip || ''}`.toLowerCase();

  if (checkStr.includes('cloudflare') || checkStr.includes('cf-')) return 'Cloudflare Infrastructure';
  if (checkStr.includes('amazonaws.com') || checkStr.includes('aws') || checkStr.includes('cloudfront')) return 'Amazon Web Services (AWS)';
  if (checkStr.includes('google') || checkStr.includes('1e100.net') || checkStr.includes('gcp') || checkStr.includes('appspot')) return 'Google Cloud Platform (GCP)';
  if (checkStr.includes('azure') || checkStr.includes('microsoft') || checkStr.includes('trafficmanager.net')) return 'Microsoft Azure';
  if (checkStr.includes('digitalocean')) return 'DigitalOcean';
  if (checkStr.includes('hetzner')) return 'Hetzner Online';
  if (checkStr.includes('ovh')) return 'OVHcloud';
  if (checkStr.includes('linode') || checkStr.includes('akamai')) return 'Akamai / Linode';
  if (checkStr.includes('vultr')) return 'Vultr Cloud';
  if (checkStr.includes('fastly')) return 'Fastly Edge Cloud';
  if (checkStr.includes('oracle') || checkStr.includes('oci')) return 'Oracle Cloud (OCI)';
  if (checkStr.includes('heroku')) return 'Heroku Platform';
  if (checkStr.includes('vercel')) return 'Vercel Edge Network';
  if (checkStr.includes('netlify')) return 'Netlify CDN';

  return 'Standard Web Host / Dedicated Server';
}

/**
 * Fingerprint Web Server, Framework, CMS, and WAF from Response
 */
function analyzeFingerprint(
  headers: Record<string, string>,
  bodySnippet: string,
  cookies: string[]
): {
  serverSoftware: string;
  serverVersion?: string;
  operatingSystem?: string;
  programmingLanguage?: string;
  framework?: string;
  cms?: string;
  wafOrCdn: string;
  wafConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  wafDetails: string[];
} {
  const lowerHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    lowerHeaders[k.toLowerCase()] = String(v);
  }

  const serverHeader = lowerHeaders['server'] || '';
  const poweredBy = lowerHeaders['x-powered-by'] || '';
  const generator = lowerHeaders['x-generator'] || '';
  const viaHeader = lowerHeaders['via'] || '';
  const cookieString = cookies.join('; ').toLowerCase();

  let serverSoftware = 'Unknown / Hidden';
  let serverVersion: string | undefined;
  let operatingSystem: string | undefined;
  let programmingLanguage: string | undefined;
  let framework: string | undefined;
  let cms: string | undefined;

  const wafDetails: string[] = [];
  let wafOrCdn = 'None Detected (Direct Origin)';
  let wafConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';

  // 1. Analyze Server Header
  if (serverHeader) {
    if (serverHeader.includes('nginx')) {
      serverSoftware = 'Nginx';
      const match = serverHeader.match(/nginx\/([\d\.]+)/i);
      if (match) serverVersion = match[1];
    } else if (serverHeader.includes('apache')) {
      serverSoftware = 'Apache HTTP Server';
      const match = serverHeader.match(/apache\/([\d\.]+)/i);
      if (match) serverVersion = match[1];
      if (serverHeader.includes('ubuntu')) operatingSystem = 'Ubuntu Linux';
      else if (serverHeader.includes('debian')) operatingSystem = 'Debian Linux';
      else if (serverHeader.includes('centos')) operatingSystem = 'CentOS Linux';
      else if (serverHeader.includes('redhat') || serverHeader.includes('fedora')) operatingSystem = 'RHEL / Fedora';
      else if (serverHeader.includes('win32') || serverHeader.includes('win64')) operatingSystem = 'Microsoft Windows';
    } else if (serverHeader.includes('microsoft-iis')) {
      serverSoftware = 'Microsoft IIS';
      const match = serverHeader.match(/microsoft-iis\/([\d\.]+)/i);
      if (match) serverVersion = match[1];
      operatingSystem = 'Windows Server';
      framework = framework || 'ASP.NET';
    } else if (serverHeader.includes('litespeed')) {
      serverSoftware = 'LiteSpeed Web Server';
    } else if (serverHeader.includes('openresty')) {
      serverSoftware = 'OpenResty (Nginx + Lua)';
    } else if (serverHeader.includes('caddy')) {
      serverSoftware = 'Caddy Web Server';
      programmingLanguage = 'Go';
    } else if (serverHeader.includes('cloudflare')) {
      serverSoftware = 'Cloudflare Edge Proxy';
    } else if (serverHeader.includes('gunicorn')) {
      serverSoftware = 'Gunicorn WSGI';
      programmingLanguage = 'Python';
    } else if (serverHeader.includes('uvicorn')) {
      serverSoftware = 'Uvicorn ASGI';
      programmingLanguage = 'Python';
    } else if (serverHeader.includes('werkzeug')) {
      serverSoftware = 'Werkzeug (Flask Dev Server)';
      programmingLanguage = 'Python';
      framework = 'Flask';
    } else if (serverHeader.includes('kestrel')) {
      serverSoftware = 'Kestrel';
      framework = 'ASP.NET Core';
      programmingLanguage = 'C# (.NET)';
    } else if (serverHeader.includes('cowboy')) {
      serverSoftware = 'Cowboy';
      programmingLanguage = 'Erlang / Elixir';
    } else if (serverHeader.includes('envoy')) {
      serverSoftware = 'Envoy Proxy';
    } else if (serverHeader.includes('traefik')) {
      serverSoftware = 'Traefik Proxy';
    } else if (serverHeader.includes('gfe') || serverHeader.includes('google frontend')) {
      serverSoftware = 'Google Frontend (GFE)';
    } else {
      serverSoftware = headers['server'] || serverHeader;
    }
  }

  // 2. Analyze X-Powered-By & Language/Framework Headers
  if (poweredBy) {
    if (poweredBy.toLowerCase().includes('express')) {
      framework = 'Express.js';
      programmingLanguage = 'Node.js (JavaScript/TypeScript)';
    } else if (poweredBy.toLowerCase().includes('php')) {
      programmingLanguage = 'PHP';
      const match = poweredBy.match(/php\/([\d\.]+)/i);
      if (match) framework = `PHP ${match[1]}`;
    } else if (poweredBy.toLowerCase().includes('asp.net')) {
      framework = 'ASP.NET';
      programmingLanguage = 'C# (.NET)';
    } else if (poweredBy.toLowerCase().includes('next.js')) {
      framework = 'Next.js';
      programmingLanguage = 'Node.js / React';
    } else if (poweredBy.toLowerCase().includes('nuxt')) {
      framework = 'Nuxt.js';
      programmingLanguage = 'Node.js / Vue';
    } else if (poweredBy.toLowerCase().includes('w3 total cache') || poweredBy.toLowerCase().includes('wp engine')) {
      cms = 'WordPress';
    } else {
      framework = framework ? `${framework}, ${poweredBy}` : poweredBy;
    }
  }

  // 3. Cookie signatures
  if (cookieString.includes('phpsessid')) {
    programmingLanguage = programmingLanguage || 'PHP';
  }
  if (cookieString.includes('jsessionid')) {
    programmingLanguage = programmingLanguage || 'Java';
    framework = framework || 'Spring / Java EE';
  }
  if (cookieString.includes('connect.sid') || cookieString.includes('express.sid')) {
    framework = framework || 'Express.js';
    programmingLanguage = programmingLanguage || 'Node.js';
  }
  if (cookieString.includes('csrftoken') || cookieString.includes('django')) {
    framework = framework || 'Django';
    programmingLanguage = programmingLanguage || 'Python';
  }
  if (cookieString.includes('laravel_session') || cookieString.includes('XSRF-TOKEN')) {
    framework = framework || 'Laravel';
    programmingLanguage = programmingLanguage || 'PHP';
  }
  if (cookieString.includes('_rails_session')) {
    framework = framework || 'Ruby on Rails';
    programmingLanguage = programmingLanguage || 'Ruby';
  }
  if (cookieString.includes('wp-settings') || cookieString.includes('wordpress_logged_in')) {
    cms = 'WordPress';
    programmingLanguage = 'PHP';
  }

  // 4. CMS Detection from Generator & Body
  if (generator.toLowerCase().includes('wordpress') || bodySnippet.toLowerCase().includes('/wp-content/') || bodySnippet.toLowerCase().includes('wp-includes')) {
    cms = 'WordPress';
    programmingLanguage = programmingLanguage || 'PHP';
  } else if (generator.toLowerCase().includes('drupal') || lowerHeaders['x-drupal-cache'] || lowerHeaders['x-generator']?.includes('Drupal')) {
    cms = 'Drupal';
    programmingLanguage = programmingLanguage || 'PHP';
  } else if (generator.toLowerCase().includes('joomla')) {
    cms = 'Joomla';
    programmingLanguage = programmingLanguage || 'PHP';
  } else if (generator.toLowerCase().includes('ghost') || lowerHeaders['x-ghost-cache-status']) {
    cms = 'Ghost CMS';
    programmingLanguage = programmingLanguage || 'Node.js';
  } else if (lowerHeaders['x-shopify-stage'] || bodySnippet.includes('cdn.shopify.com')) {
    cms = 'Shopify';
  } else if (generator.toLowerCase().includes('wix') || bodySnippet.includes('wix.com')) {
    cms = 'Wix.com Platform';
  } else if (generator.toLowerCase().includes('squarespace') || bodySnippet.includes('squarespace.com')) {
    cms = 'Squarespace';
  }

  // 5. WAF & Reverse Proxy / CDN Detection
  if (lowerHeaders['cf-ray'] || lowerHeaders['cf-cache-status'] || serverHeader.includes('cloudflare') || cookieString.includes('__cf_bm') || cookieString.includes('cf_clearance')) {
    wafOrCdn = 'Cloudflare WAF & Edge CDN';
    wafConfidence = 'HIGH';
    if (lowerHeaders['cf-ray']) wafDetails.push(`Ray ID: ${lowerHeaders['cf-ray']}`);
    if (lowerHeaders['cf-cache-status']) wafDetails.push(`Cache: ${lowerHeaders['cf-cache-status']}`);
  } else if (lowerHeaders['x-amz-cf-id'] || lowerHeaders['x-amz-cf-pop'] || viaHeader.includes('cloudfront') || serverHeader.includes('cloudfront')) {
    wafOrCdn = 'AWS CloudFront CDN & AWS WAF';
    wafConfidence = 'HIGH';
    if (lowerHeaders['x-amz-cf-pop']) wafDetails.push(`Edge POP: ${lowerHeaders['x-amz-cf-pop']}`);
  } else if (lowerHeaders['x-akamai-transformed'] || lowerHeaders['akamai-origin-hop'] || serverHeader.includes('akamaighost') || lowerHeaders['x-akamai-request-id']) {
    wafOrCdn = 'Akamai Intelligent Edge & Kona WAF';
    wafConfidence = 'HIGH';
  } else if (lowerHeaders['fastly-debug-digest'] || lowerHeaders['x-fastly-request-id'] || viaHeader.includes('fastly') || lowerHeaders['x-served-by']?.includes('cache-')) {
    wafOrCdn = 'Fastly Edge Cloud & Signal Sciences WAF';
    wafConfidence = 'HIGH';
  } else if (lowerHeaders['x-iinfo'] || cookieString.includes('incap_ses') || cookieString.includes('visid_incap')) {
    wafOrCdn = 'Imperva / Incapsula WAF';
    wafConfidence = 'HIGH';
  } else if (lowerHeaders['x-sucuri-id'] || lowerHeaders['x-sucuri-cache'] || serverHeader.includes('sucuri')) {
    wafOrCdn = 'Sucuri CloudProxy WAF';
    wafConfidence = 'HIGH';
  } else if (lowerHeaders['x-azure-ref'] || viaHeader.includes('azure') || serverHeader.includes('azure')) {
    wafOrCdn = 'Microsoft Azure Front Door / App Gateway';
    wafConfidence = 'HIGH';
  } else if (lowerHeaders['x-varnish'] || viaHeader.includes('varnish')) {
    wafOrCdn = 'Varnish HTTP Cache Accelerator';
    wafConfidence = 'HIGH';
    if (lowerHeaders['x-varnish']) wafDetails.push(`Varnish ID: ${lowerHeaders['x-varnish']}`);
  } else if (cookieString.includes('bigipserver') || lowerHeaders['x-cnection']) {
    wafOrCdn = 'F5 BIG-IP Traffic Manager / ASM';
    wafConfidence = 'MEDIUM';
  }

  return {
    serverSoftware,
    serverVersion,
    operatingSystem,
    programmingLanguage,
    framework,
    cms,
    wafOrCdn,
    wafConfidence,
    wafDetails
  };
}

/**
 * Score HTTP Security Headers
 */
function scoreSecurityHeaders(headers: Record<string, string>): {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  passed: number;
  total: number;
  checks: SecurityHeaderCheck[];
} {
  const lowerHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    lowerHeaders[k.toLowerCase()] = String(v);
  }

  const checklist: { name: string; header: string; weight: number; recommendation: string }[] = [
    {
      name: 'Strict-Transport-Security (HSTS)',
      header: 'strict-transport-security',
      weight: 25,
      recommendation: 'Enforces encrypted HTTPS connections and mitigates SSL stripping attacks.'
    },
    {
      name: 'Content-Security-Policy (CSP)',
      header: 'content-security-policy',
      weight: 25,
      recommendation: 'Prevents Cross-Site Scripting (XSS) and unauthorized resource injection.'
    },
    {
      name: 'X-Frame-Options (Clickjacking Guard)',
      header: 'x-frame-options',
      weight: 15,
      recommendation: 'Prevents UI redressing and iframe clickjacking attacks (DENY or SAMEORIGIN).'
    },
    {
      name: 'X-Content-Type-Options',
      header: 'x-content-type-options',
      weight: 15,
      recommendation: 'Mitigates MIME-type sniffing vulnerabilities by setting nosniff.'
    },
    {
      name: 'Referrer-Policy',
      header: 'referrer-policy',
      weight: 10,
      recommendation: 'Controls how much referrer information is included with requests.'
    },
    {
      name: 'Permissions-Policy',
      header: 'permissions-policy',
      weight: 10,
      recommendation: 'Restricts access to sensitive browser features (camera, microphone, geolocation).'
    }
  ];

  let totalScore = 0;
  let passedCount = 0;

  const checks: SecurityHeaderCheck[] = checklist.map((item) => {
    const val = lowerHeaders[item.header];
    const isPresent = Boolean(val && val.trim().length > 0);

    if (isPresent) {
      totalScore += item.weight;
      passedCount++;
    }

    return {
      name: item.name,
      header: item.header,
      present: isPresent,
      value: val,
      recommendation: item.recommendation
    };
  });

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 65) grade = 'B';
  else if (totalScore >= 50) grade = 'C';
  else if (totalScore >= 30) grade = 'D';
  else grade = 'F';

  return {
    grade,
    score: totalScore,
    passed: passedCount,
    total: checklist.length,
    checks
  };
}

/**
 * Inspect TLS certificate details via TLS socket
 */
function inspectTlsCertificate(hostname: string, port: number = 443): Promise<TlsCertificateInfo | undefined> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        {
          host: hostname,
          port,
          servername: hostname,
          rejectUnauthorized: false,
          timeout: 5000
        },
        () => {
          try {
            const cert: any = socket.getPeerCertificate(true);
            const protocol = socket.getProtocol() || undefined;
            const cipher = socket.getCipher() ? `${socket.getCipher().name} (${socket.getCipher().version})` : undefined;
            const authorized = socket.authorized;
            const authError = socket.authorizationError ? String(socket.authorizationError) : undefined;

            let validFrom: string | undefined;
            let validTo: string | undefined;
            let daysRemaining: number | undefined;
            let subject: string | undefined;
            let issuer: string | undefined;

            if (cert && Object.keys(cert).length > 0) {
              validFrom = cert.valid_from;
              validTo = cert.valid_to;
              if (validTo) {
                const toDate = new Date(validTo).getTime();
                daysRemaining = Math.max(0, Math.round((toDate - Date.now()) / (1000 * 60 * 60 * 24)));
              }
              if (cert.subject) {
                subject = cert.subject.CN || cert.subject.O || JSON.stringify(cert.subject);
              }
              if (cert.issuer) {
                issuer = cert.issuer.O || cert.issuer.CN || JSON.stringify(cert.issuer);
              }
            }

            socket.destroy();
            resolve({
              valid: authorized || (Boolean(cert) && (daysRemaining === undefined || daysRemaining > 0)),
              subject,
              issuer,
              validFrom,
              validTo,
              daysRemaining,
              protocol,
              cipher,
              authorized,
              authorizationError: authError
            });
          } catch (e) {
            socket.destroy();
            resolve(undefined);
          }
        }
      );

      socket.on('error', () => {
        socket.destroy();
        resolve(undefined);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(undefined);
      });
    } catch {
      resolve(undefined);
    }
  });
}

/**
 * Check if target supports HTTP/2 via ALPN negotiation
 */
function checkHttp2Support(hostname: string, port: number = 443): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const client = http2.connect(`https://${hostname}:${port}`, {
        rejectUnauthorized: false,
        timeout: 4000
      });

      client.on('connect', () => {
        client.close();
        resolve(true);
      });

      client.on('error', () => {
        client.destroy();
        resolve(false);
      });

      client.on('timeout', () => {
        client.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

/**
 * Main Reconnaissance Function: Performs deep inspection on any target URL or host
 */
export async function performTargetRecon(rawTarget: string): Promise<ServerFingerprint> {
  if (!rawTarget || !rawTarget.trim()) {
    throw new Error('Target URL or Hostname cannot be empty.');
  }

  let formatted = rawTarget.trim();
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    const isHttps = /:(443|8443)(\/|$)/.test(formatted);
    formatted = (isHttps ? 'https://' : 'http://') + formatted;
  }

  const urlObj = new URL(formatted);
  const hostname = urlObj.hostname;
  const isHttps = urlObj.protocol === 'https:';
  const port = urlObj.port ? parseInt(urlObj.port, 10) : (isHttps ? 443 : 80);

  // 1. DNS Resolution
  let resolvedIp = 'Unknown';
  let resolvedIpv6: string | undefined;
  let reverseDns: string | undefined;

  try {
    const dnsLookup = await dns.promises.lookup(hostname, { all: true });
    if (dnsLookup && dnsLookup.length > 0) {
      const ipv4Record = dnsLookup.find((r) => r.family === 4);
      const ipv6Record = dnsLookup.find((r) => r.family === 6);
      if (ipv4Record) resolvedIp = ipv4Record.address;
      else resolvedIp = dnsLookup[0].address;
      if (ipv6Record) resolvedIpv6 = ipv6Record.address;
    }
  } catch (dnsErr) {
    // If hostname is already an IP address
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')) {
      resolvedIp = hostname;
    }
  }

  // Reverse DNS lookup
  if (resolvedIp !== 'Unknown' && resolvedIp !== '127.0.0.1' && resolvedIp !== 'localhost') {
    try {
      const ptrs = await dns.promises.reverse(resolvedIp);
      if (ptrs && ptrs.length > 0) {
        reverseDns = ptrs[0];
      }
    } catch {
      // reverse DNS is optional
    }
  }

  const cloudProvider = identifyCloudProvider(hostname, reverseDns, resolvedIp);

  // 2. TLS Certificate Inspection & HTTP/2 ALPN (if HTTPS)
  let tlsInfo: TlsCertificateInfo | undefined;
  let hasHttp2 = false;

  if (isHttps) {
    const [certData, h2Supported] = await Promise.all([
      inspectTlsCertificate(hostname, port),
      checkHttp2Support(hostname, port)
    ]);
    tlsInfo = certData;
    hasHttp2 = h2Supported;
  }

  // 3. HTTP Request Probe
  const startTime = Date.now();

  const probeResponse = await new Promise<{
    statusCode: number;
    statusMessage: string;
    headers: Record<string, string>;
    cookies: string[];
    bodySnippet: string;
    responseTimeMs: number;
  }>((resolve, reject) => {
    const requestModule = isHttps ? https : http;

    const req = requestModule.request(
      urlObj,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ServerInspector/2.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Connection': 'close'
        },
        rejectUnauthorized: false,
        timeout: 8000
      },
      (res) => {
        const responseTimeMs = Date.now() - startTime;
        const headers: Record<string, string> = {};
        const cookies: string[] = [];

        for (const [k, v] of Object.entries(res.headers)) {
          if (k.toLowerCase() === 'set-cookie' && Array.isArray(v)) {
            cookies.push(...v);
          } else if (v !== undefined) {
            headers[k] = Array.isArray(v) ? v.join(', ') : String(v);
          }
        }

        let bodyData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          if (bodyData.length < 8192) {
            bodyData += chunk;
          }
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 200,
            statusMessage: res.statusMessage || 'OK',
            headers,
            cookies,
            bodySnippet: bodyData,
            responseTimeMs
          });
        });
      }
    );

    req.on('error', (err) => {
      // If error occurs, create a graceful error response with what we have
      resolve({
        statusCode: 0,
        statusMessage: `Connection Failed: ${err.message}`,
        headers: {},
        cookies: [],
        bodySnippet: '',
        responseTimeMs: Date.now() - startTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 408,
        statusMessage: 'Request Timeout (Probe exceeded 8000ms)',
        headers: {},
        cookies: [],
        bodySnippet: '',
        responseTimeMs: Date.now() - startTime
      });
    });

    req.end();
  });

  // 4. Analyze Fingerprint
  const analysis = analyzeFingerprint(probeResponse.headers, probeResponse.bodySnippet, probeResponse.cookies);

  // 5. Protocols Supported
  const supportedProtocols: string[] = ['HTTP/1.1'];
  if (hasHttp2) {
    supportedProtocols.push('HTTP/2 (Multiplexed)');
  }

  // Check Alt-Svc header for HTTP/3 / QUIC
  const altSvc = probeResponse.headers['alt-svc'] || probeResponse.headers['Alt-Svc'] || '';
  const hasHttp3 = altSvc.toLowerCase().includes('h3') || altSvc.toLowerCase().includes('quic');
  if (hasHttp3) {
    supportedProtocols.push('HTTP/3 (QUIC/UDP)');
  }

  // 6. Security Headers Score
  const securityHeadersScore = scoreSecurityHeaders(probeResponse.headers);

  return {
    target: rawTarget,
    normalizedUrl: urlObj.href,
    ip: resolvedIp,
    ipv6: resolvedIpv6,
    hostname,
    reverseDns,
    cloudProvider,
    statusCode: probeResponse.statusCode,
    statusMessage: probeResponse.statusMessage,
    responseTimeMs: probeResponse.responseTimeMs,
    serverSoftware: analysis.serverSoftware,
    serverVersion: analysis.serverVersion,
    operatingSystem: analysis.operatingSystem,
    programmingLanguage: analysis.programmingLanguage,
    framework: analysis.framework,
    cms: analysis.cms,
    wafOrCdn: analysis.wafOrCdn,
    wafConfidence: analysis.wafConfidence,
    wafDetails: analysis.wafDetails,
    supportedProtocols,
    hasHttp2,
    hasHttp3,
    http3AltSvc: altSvc || undefined,
    tlsInfo,
    securityHeadersScore,
    cookies: probeResponse.cookies,
    rawHeaders: probeResponse.headers,
    inspectedAt: new Date().toISOString()
  };
}
