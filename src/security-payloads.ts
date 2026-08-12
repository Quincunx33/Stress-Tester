// src/security-payloads.ts - Enhanced with obfuscated payloads

export type SecurityTestMode = 'normal' | 'payload' | 'search';
export type SecurityPayloadCategory = 'all' | 'sql' | 'xss' | 'cmd' | 'path' | 'headers' | 'slow' | 'redos' | 'template' | 'hash';

export interface SecurityPayloadDefinition {
  id: string;
  category: SecurityPayloadCategory;
  name: string;
  pattern: string;
  description: string;
  obfuscatedPatterns?: string[];
}

export const SECURITY_PAYLOADS: SecurityPayloadDefinition[] = [
  {
    id: 'sql_1',
    category: 'sql',
    name: 'SQLi Boolean Bypass',
    pattern: "' OR '1'='1' --",
    description: 'Classic authentication bypass via SQL tautology',
    obfuscatedPatterns: [
      "'/**/OR/**/'1'='1'--",
      "'%20OR%20%271%27=%271%27--",
      "'||'1'='1'--",
      "' OR 1=1 #",
      "' UNION SELECT NULL,NULL,NULL--"
    ]
  },
  {
    id: 'sql_2',
    category: 'sql',
    name: 'SQLi Union Enumeration',
    pattern: "1 UNION SELECT null, version(), user() --",
    description: 'Database version and schema extraction probe',
    obfuscatedPatterns: [
      "1/**/UNION/**/SELECT/**/null,version(),user()--",
      "1 UNION SELECT @@version,user(),database()--",
      "1%20UNION%20SELECT%20null,version(),user()--",
      "1 UNION SELECT null,@@hostname,@@datadir--"
    ]
  },
  {
    id: 'xss_1',
    category: 'xss',
    name: 'XSS Script Execution',
    pattern: "<script>alert(document.cookie)</script>",
    description: 'Reflected cross-site scripting script injection',
    obfuscatedPatterns: [
      "<ScRiPt>alert(document.cookie)</ScRiPt>",
      "<SCRIPT>alert(document.cookie)</SCRIPT>",
      "><script>alert(document.cookie)</script>",
      "%3Cscript%3Ealert(document.cookie)%3C/script%3E",
      "<scr<script>ipt>alert(document.cookie)</scr</script>ipt>"
    ]
  },
  {
    id: 'xss_2',
    category: 'xss',
    name: 'XSS Event Handler',
    pattern: "<img src=x onerror=alert('WAF_TEST')>",
    description: 'Image attribute XSS payload bypassing simple filters',
    obfuscatedPatterns: [
      "<img src=x onerror=alert('WAF_TEST')/>",
      "<img src=x onerror=alert(String.fromCharCode(87,65,70,95,84,69,83,84))>",
      "<IMG SRC=x ONERROR=alert('WAF_TEST')>",
      "<img src=x onerror=&#97;&#108;&#101;&#114;&#116;('WAF_TEST')>",
      "<img src=# onerror=alert(1)>"
    ]
  },
  {
    id: 'cmd_1',
    category: 'cmd',
    name: 'Command Injection Pipe',
    pattern: "; cat /etc/passwd",
    description: 'OS command execution via shell chaining',
    obfuscatedPatterns: [
      "| cat /etc/passwd",
      "|| cat /etc/passwd",
      "& cat /etc/passwd",
      ";cat%20/etc/passwd",
      "%0Acat%20/etc/passwd"
    ]
  },
  {
    id: 'cmd_2',
    category: 'cmd',
    name: 'Command Injection Ampersand',
    pattern: "& ping -c 3 127.0.0.1 &",
    description: 'ICMP ping flood via command injection',
    obfuscatedPatterns: [
      "&& ping -c 3 127.0.0.1",
      "| ping -c 3 127.0.0.1",
      "|| ping -c 3 127.0.0.1",
      ";ping%20-c%203%20127.0.0.1"
    ]
  },
  {
    id: 'path_1',
    category: 'path',
    name: 'Path Traversal Unix',
    pattern: "../../../../etc/passwd%00",
    description: 'Directory traversal accessing sensitive system files',
    obfuscatedPatterns: [
      "../../../../etc/passwd",
      "....//....//....//etc/passwd",
      "../../../../etc/passwd%00",
      "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
      "../../../../etc/passwd%00"
    ]
  },
  {
    id: 'path_2',
    category: 'path',
    name: 'Path Traversal Windows',
    pattern: "..\\..\\..\\..\\windows\\win.ini",
    description: 'Windows INI configuration file traversal',
    obfuscatedPatterns: [
      "....\\\\....\\\\....\\\\windows\\\\win.ini",
      "..\\..\\..\\..\\windows\\win.ini%00",
      "%2e%2e%5c%2e%2e%5c%2e%2e%5cwindows%5cwin.ini"
    ]
  },
  {
    id: 'headers_1',
    category: 'headers',
    name: 'Large Header Flood',
    pattern: "A".repeat(4096),
    description: 'Buffer overflow / memory exhaustion via oversized header',
    obfuscatedPatterns: [
      "X" + "X".repeat(4096),
      "A" + "A".repeat(8192),
      "B" + "B".repeat(4096)
    ]
  },
  {
    id: 'slow_1',
    category: 'slow',
    name: 'Slowloris Header Trick',
    pattern: "X-Slow-Header: incomplete-chunked-data",
    description: 'Slow connection keep-alive timeout starvation',
    obfuscatedPatterns: [
      "X-Slow-Header: incomplete-chunked-data",
      "X-Slow-Header: " + "a".repeat(1024),
      "X-Slow-Header: " + "b".repeat(2048)
    ]
  },
  {
    id: 'redos_1',
    category: 'redos',
    name: 'ReDoS Catastrophic Backtracking',
    pattern: "^([a-zA-Z]+)*$",
    description: 'Regular expression denial of service exponential CPU load',
    obfuscatedPatterns: [
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb!",
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!",
      "([a-zA-Z]+)*$"
    ]
  },
  {
    id: 'template_1',
    category: 'template',
    name: 'SSTI Expression',
    pattern: "${7*7} {{7*7}}",
    description: 'Server-Side Template Injection mathematical evaluation',
    obfuscatedPatterns: [
      "${7*7} {{7*7}}",
      "${{7*7}} {{7*7}}",
      "${7*7} {7*7}",
      "%24%7B7%2A7%7D%20%7B%7B7%2A7%7D%7D"
    ]
  },
  {
    id: 'hash_1',
    category: 'hash',
    name: 'Hash Collision Payload',
    pattern: "AQ==&__proto__[polluted]=true",
    description: 'JSON prototype pollution and hash collision vector',
    obfuscatedPatterns: [
      "__proto__[polluted]=true",
      "__proto__.polluted=true",
      "constructor.prototype.polluted=true",
      "%5F%5Fproto%5F%5F%5Bpolluted%5D=true"
    ]
  }
];

export interface SecurityStats {
  totalTestRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  testTypeCounts: Record<string, number>;
  blockedByType: Record<string, number>;
}

export function getObfuscatedPayload(payloadId: string, intensity: number = 5): string {
  const payload = SECURITY_PAYLOADS.find(p => p.id === payloadId);
  if (!payload) return '';
  if (intensity < 3) {
    return payload.pattern;
  }
  if (payload.obfuscatedPatterns && payload.obfuscatedPatterns.length > 0) {
    const idx = Math.min(
      Math.floor((intensity / 10) * payload.obfuscatedPatterns.length),
      payload.obfuscatedPatterns.length - 1
    );
    return payload.obfuscatedPatterns[idx];
  }
  return payload.pattern;
}

export function getPayloadsByCategory(category: SecurityPayloadCategory, intensity: number = 5): SecurityPayloadDefinition[] {
  let payloads = SECURITY_PAYLOADS;
  if (category !== 'all') {
    payloads = payloads.filter(p => p.category === category);
  }
  const count = Math.min(payloads.length, Math.max(1, Math.floor((intensity / 10) * payloads.length) + 1));
  return payloads.slice(0, count);
}
