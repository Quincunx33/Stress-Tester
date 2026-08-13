import express from "express";
import path from "path";
import http from "http";
import https from "https";
import http2 from "http2";
import os from "os";
import cluster from "cluster";
import { request as http3Request } from "./node-http3";
import { createServer as createViteServer } from "vite";
import { RealProxyPool as ProxyPool } from "./proxy-manager";
import { SECURITY_PAYLOADS, SecurityStats, getObfuscatedPayload, getPayloadsByCategory } from "./src/security-payloads";
import { generateRandomHeaders, generateRandomFingerprint, obfuscatePayload, generateSearchQuery, calculateRandomDelay } from "./src/header-randomizer";


// ==========================================
// TYPE DEFINITIONS & CONSTANTS
// ==========================================

export type ProxyType = 'Tor' | 'SOCKS5' | 'HTTP';
export type RotationStrategy = 'round-robin' | 'random' | 'ip-rotation-every-n-requests' | 'sticky';
export type ProxyCountry = 'US' | 'CA' | 'GB' | 'DE' | 'FR' | 'JP' | 'AU' | 'NL' | 'SE' | 'CH' | 'ANY';

export interface ProxyConfig {
  enabled: boolean;
  proxyType: ProxyType;
  instanceCount: number;
  country: ProxyCountry;
  rotationStrategy: RotationStrategy;
  rotationCount: number;
  customProxyList?: string;
}

export interface ProxyStats {
  activeProxies: number;
  currentProxyInstance: string;
  totalRotations: number;
  failedProxies: number;
  circuitRenewals: number;
  countryDistribution: Record<string, number>;
}

export interface MethodMixRatio {
  GET: number;
  POST: number;
  PUT: number;
  DELETE: number;
  PATCH?: number;
  HEAD?: number;
}

export interface ProtocolMixRatio {
  'http/1.1': number;
  'http/2': number;
  'http/3': number;
}

export interface TestConfig {
  target: string;
  targetRps?: number;
  duration: number;
  pipelines: number;
  pipeliningFactor: number;
  protocol: 'http/1.1' | 'http/2' | 'http/3' | 'MIXED';
  protocolMix?: ProtocolMixRatio;
  pattern: 'flat' | 'ramp-up' | 'spike' | 'sine';
  bypassCloudflare: boolean;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'MIXED';
  methodMix?: MethodMixRatio;
  payload?: string;
  dynamicPayloadEnabled?: boolean;
  customHeadersRaw?: string;
  customHeaders?: Record<string, string>;
  thinkTimeMs?: number;
  jitterMs?: number;
  adaptiveThinkTimeEnabled?: boolean;
  adaptivePacingFactor?: number;
  circuitBreakerEnabled?: boolean;
  proxyConfig?: ProxyConfig;
  testMode?: 'normal' | 'payload' | 'search';
  testIntensity?: number;
  payloadType?: string;
}

export interface LogEntry {
  time: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
}

export interface HistoryPoint {
  time: number;
  rps: number;
  successRate: number;
  p95Latency?: number;
}

export interface TestState {
  running: boolean;
  target: string;
  duration: number;
  pipelines: number;
  pipeliningFactor: number;
  protocol: string;
  protocolMix?: ProtocolMixRatio;
  protocolCounts?: Record<string, number>;
  pattern: string;
  bypassCloudflare?: boolean;
  httpMethod?: string;
  methodMix?: MethodMixRatio;
  methodCounts?: Record<string, number>;
  payload?: string;
  dynamicPayloadEnabled?: boolean;
  customHeadersRaw?: string;
  customHeaders?: Record<string, string>;
  thinkTimeMs?: number;
  jitterMs?: number;
  adaptiveThinkTimeEnabled?: boolean;
  adaptivePacingFactor?: number;
  adaptivePacingDelayMs?: number;
  circuitBreakerEnabled?: boolean;
  circuitBreakerTripped?: boolean;
  workerClusterCount?: number;
  startTime: number;
  elapsed: number;
  totalRequests: number;
  successfulResponses: number;
  failedResponses: number;
  bytesSent: number;
  bytesReceived?: number;
  peakRps: number;
  currentRps: number;
  successRate: number;
  healthScore: number;
  avgLatencyMs?: number;
  p50LatencyMs?: number;
  p95LatencyMs?: number;
  p99LatencyMs?: number;
  coordinatedOmissionMs?: number;
  statusCodes?: Record<string, number>;
  proxyStats?: ProxyStats;
  proxyConfig?: ProxyConfig;
  testMode?: string;
  testIntensity?: number;
  payloadType?: string;
  securityStats?: SecurityStats;
  logs: LogEntry[];
  history: HistoryPoint[];
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
];

const PRESET_TARGETS = [
  { name: "Local Health Check", url: "http://localhost:3000/api/health", pipelines: 10, duration: 30, factor: 5 },
  { name: "JSONPlaceholder API", url: "https://jsonplaceholder.typicode.com/posts/1", pipelines: 15, duration: 30, factor: 5 },
  { name: "HTTPBin Echo GET", url: "https://httpbin.org/get", pipelines: 10, duration: 20, factor: 3 },
  { name: "Cloudflare Speed Test", url: "https://speed.cloudflare.com/__down?bytes=1000", pipelines: 20, duration: 30, factor: 10 }
];

const PORT = 3000;
const isPrimaryProcess = cluster.isPrimary || (cluster as any).isMaster;

// ==========================================
// WORKER PROCESS LOGIC
// ==========================================
if (!isPrimaryProcess) {
  let isRunning = false;
  let activeConfig: TestConfig | null = null;
  let abortController: AbortController | null = null;
  let circuitBreakerTripped = false;

  // Connection Pools & Sessions
  let httpAgent: http.Agent | null = null;
  let httpsAgent: https.Agent | null = null;
  let h2Session: http2.ClientHttp2Session | null = null;
  let proxyPool: ProxyPool | null = null;

  // Local Worker Telemetry Buffers
  let totalRequests = 0;
  let successfulResponses = 0;
  let failedResponses = 0;
  let bytesSent = 0;
  let bytesReceived = 0;
  let adaptivePacingDelayMs = 0;
  const statusCodes: Record<string, number> = {};
  const methodCounts: Record<string, number> = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, HEAD: 0, OPTIONS: 0 };
  const protocolCounts: Record<string, number> = { "http/1.1": 0, "http/2": 0, "http/3": 0 };
  let latencyBuffer: number[] = [];
  let scheduleDeltaBuffer: number[] = [];

  // Dynamic Template Engine for Payloads, Headers & URLs
  const renderDynamicTemplate = (templateStr: string, counter: number): string => {
    if (!templateStr) return "";
    return templateStr
      .replace(/\{\{\s*user_id\s*\}\}/gi, () => String(Math.floor(100000 + Math.random() * 900000)))
      .replace(/\{\{\s*timestamp\s*\}\}/gi, () => String(Date.now()))
      .replace(/\{\{\s*uuid\s*\}\}/gi, () => Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10))
      .replace(/\{\{\s*random_number\s*\}\}/gi, () => String(Math.floor(Math.random() * 100000)))
      .replace(/\{\{\s*random_string\s*\}\}/gi, () => Math.random().toString(36).substring(2, 10))
      .replace(/\{\{\s*counter\s*\}\}/gi, () => String(counter))
      .replace(/\{\{\s*iso_date\s*\}\}/gi, () => new Date().toISOString())
      .replace(/\{\{\s*email\s*\}\}/gi, () => `user_${Math.floor(Math.random() * 10000)}@test.com`);
  };

  // Custom Key:Value Header Parser
  const parseCustomHeaders = (raw: string | undefined): Record<string, string> => {
    if (!raw) return {};
    const headers: Record<string, string> = {};
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0) {
        const name = trimmed.substring(0, colonIdx).trim();
        const value = trimmed.substring(colonIdx + 1).trim();
        if (name) {
          headers[name] = value;
        }
      }
    }
    return headers;
  };

  // Report local worker metrics to Primary process via IPC
  const sendTickToPrimary = () => {
    if (process.send) {
      const latencies = latencyBuffer;
      const deltas = scheduleDeltaBuffer;
      latencyBuffer = [];
      scheduleDeltaBuffer = [];
      const proxyStats = proxyPool ? proxyPool.getStats() : undefined;

      process.send({
        cmd: "WORKER_TICK",
        workerPid: process.pid,
        totalRequests,
        successfulResponses,
        failedResponses,
        bytesSent,
        bytesReceived,
        adaptivePacingDelayMs,
        statusCodes: { ...statusCodes },
        methodCounts: { ...methodCounts },
        protocolCounts: { ...protocolCounts },
        latencies,
        scheduleDeltas: deltas,
        proxyStats
      });
    } else {
      latencyBuffer = [];
      scheduleDeltaBuffer = [];
    }
  };

  let tickInterval: NodeJS.Timeout | null = null;

  const stopWorkerLoad = () => {
    isRunning = false;
    latencyBuffer = [];
    scheduleDeltaBuffer = [];
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
    if (h2Session) {
      try { h2Session.close(); } catch (e) {}
      h2Session = null;
    }
    if (httpAgent) { httpAgent.destroy(); httpAgent = null; }
    if (httpsAgent) { httpsAgent.destroy(); httpsAgent = null; }
    if (proxyPool) {
      proxyPool.shutdown().catch(() => {});
      proxyPool = null;
    }
  };

  // Select HTTP Method based on configuration / weighted mix
  const pickHttpMethod = (config: TestConfig): string => {
    const mainMethod = (config.httpMethod || "GET").toUpperCase();
    if (mainMethod !== "MIXED") return mainMethod;

    const mix = config.methodMix || { GET: 70, POST: 20, PUT: 5, DELETE: 5 };
    const entries = Object.entries(mix).filter(([_, w]) => w > 0);
    if (entries.length === 0) return "GET";

    const totalWeight = entries.reduce((acc, [_, w]) => acc + w, 0);
    let rand = Math.random() * totalWeight;
    for (const [m, weight] of entries) {
      rand -= weight;
      if (rand <= 0) return m;
    }
    return entries[0][0];
  };

  // Select Protocol based on configuration / weighted mix
  const pickProtocol = (config: TestConfig): string => {
    const mainProtocol = (config.protocol || "http/1.1").toLowerCase();
    if (mainProtocol !== "mixed") return mainProtocol;

    const mix = config.protocolMix || { "http/1.1": 50, "http/2": 40, "http/3": 10 };
    const entries = Object.entries(mix).filter(([_, w]) => w > 0);
    if (entries.length === 0) return "http/1.1";

    const totalWeight = entries.reduce((acc, [_, w]) => acc + w, 0);
    let rand = Math.random() * totalWeight;
    for (const [p, weight] of entries) {
      rand -= weight;
      if (rand <= 0) return p;
    }
    return entries[0][0];
  };

  // Pacing Multiplier for Load Patterns
  const getPacingMultiplier = (pattern: string, elapsedSec: number, durationSec: number): number => {
    if (pattern === "ramp-up") {
      return Math.min(1.0, Math.max(0.1, elapsedSec / (durationSec * 0.5)));
    }
    if (pattern === "spike") {
      const cycle = elapsedSec % 10;
      return cycle > 7 ? 2.5 : 0.4;
    }
    if (pattern === "sine") {
      return 0.5 + 0.5 * Math.sin((elapsedSec / 5) * Math.PI);
    }
    return 1.0;
  };

  // Perform single HTTP request with TTLB body reading and Coordinated Omission tracking
  const executeSingleRequest = (
    config: TestConfig,
    parsedUrl: URL,
    workerIndex: number,
    scheduledStartTime: number,
    signal: AbortSignal
  ): Promise<void> => {
    return new Promise((resolve) => {
      if (signal.aborted || !isRunning || circuitBreakerTripped) {
        return resolve();
      }

      const method = pickHttpMethod(config);
      const protocol = pickProtocol(config);

      methodCounts[method] = (methodCounts[method] || 0) + 1;
      protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1;

      const isHttps = parsedUrl.protocol === "https:";
      const hostname = parsedUrl.hostname;
      const port = parsedUrl.port ? Number(parsedUrl.port) : (isHttps ? 443 : 80);
      let requestPath = parsedUrl.pathname + parsedUrl.search;

      // Evaluate dynamic template variables in request path
      if (requestPath.includes("{{")) {
        requestPath = renderDynamicTemplate(requestPath, totalRequests);
      }

      if (config.bypassCloudflare) {
        const cacheBust = `_cb=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        requestPath += (requestPath.includes("?") ? "&" : "?") + cacheBust;
      }

      let headers = generateRandomHeaders(totalRequests, config.bypassCloudflare);
      headers["Host"] = hostname;

      if (config.bypassCloudflare) {
        const cacheBust = `_cb=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        requestPath += (requestPath.includes("?") ? "&" : "?") + cacheBust;
      }

      // Security Test Mode - Payload Injection
      if (config.testMode === 'payload' && config.payloadType) {
        const intensity = config.testIntensity || 5;
        const payloads = getPayloadsByCategory(config.payloadType as any, intensity);
        if (payloads.length > 0) {
          const selectedPayload = payloads[Math.floor(Math.random() * payloads.length)];
          const obfuscated = getObfuscatedPayload(selectedPayload.id, intensity);
          if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
            config.payload = config.payload || '{}';
            try {
              const bodyObj = JSON.parse(config.payload);
              bodyObj._payload_ = obfuscated;
              bodyObj._payload_id_ = selectedPayload.id;
              config.payload = JSON.stringify(bodyObj);
            } catch (e) {
              config.payload = config.payload + '\n' + obfuscated;
            }
          } else {
            headers['X-Security-Payload'] = obfuscated;
            headers['X-Payload-ID'] = selectedPayload.id;
          }
        }
      }

      // Security Test Mode - Search Query Injection
      if (config.testMode === 'search' && config.payloadType) {
        const intensity = config.testIntensity || 5;
        const searchQuery = generateSearchQuery(intensity);
        const separator = requestPath.includes('?') ? '&' : '?';
        requestPath = requestPath + separator + searchQuery;
        headers['X-Search-Payload'] = searchQuery;
      }

      // Apply Custom Key:Value Headers with template rendering
      const customHeaders = parseCustomHeaders(config.customHeadersRaw);
      Object.entries(customHeaders).forEach(([hName, hVal]) => {
        headers[hName] = hVal.includes("{{") ? renderDynamicTemplate(hVal, totalRequests) : hVal;
      });

      if (protocol === "http/3") {
        headers["Alt-Svc"] = 'h3=":443"; ma=86400';
        headers["QUIC-Version"] = "h3-29";
        headers["X-HTTP3-Stream-ID"] = String(totalRequests * 4);
      }

      // Evaluate dynamic JSON template payload
      let activePayload = config.payload || "";
      if (activePayload && (activePayload.includes("{{") || config.dynamicPayloadEnabled)) {
        activePayload = renderDynamicTemplate(activePayload, totalRequests);
      }

      if (config.testMode === 'payload' && config.testIntensity && config.testIntensity > 3) {
        activePayload = obfuscatePayload(activePayload, config.testIntensity);
      }

      const needsBody = Boolean(activePayload && (method === "POST" || method === "PUT" || method === "PATCH"));
      if (needsBody) {
        if (!headers["Content-Type"]) {
          headers["Content-Type"] = "application/json";
        }
        headers["Content-Length"] = String(Buffer.byteLength(activePayload));
      }

      const reqBytes = 220 + requestPath.length + hostname.length + (needsBody ? Buffer.byteLength(activePayload) : 0);
      bytesSent += reqBytes;
      totalRequests++;

      const reqStartTime = Date.now();

      // Adaptive response-based pacing feedback calculation
      const applyResponseFeedback = (statusCodeStr: string) => {
        const statusNum = Number(statusCodeStr) || 500;
        if (config.adaptiveThinkTimeEnabled) {
          const factor = config.adaptivePacingFactor || 1.5;
          if (statusNum === 429) {
            // Severe backoff penalty for rate-limit
            adaptivePacingDelayMs = Math.min(5000, Math.max(300, (adaptivePacingDelayMs || 100) * 2 * factor));
          } else if (statusNum >= 400) {
            // Backoff penalty for server errors / not found
            adaptivePacingDelayMs = Math.min(3000, (adaptivePacingDelayMs + 80) * factor);
          } else {
            // Successful response decay pacing back to zero
            adaptivePacingDelayMs = Math.max(0, Math.floor(adaptivePacingDelayMs * 0.8) - 10);
          }
        }
      };

      // Coordinated Omission: Difference between when request was scheduled vs actual completion.
      // Note: Gil Tene's Coordinated Omission correction computes end-to-end time (from scheduled generation to actual receipt/finish).
      // Therefore, scheduleDelta is tracked when the request completely finishes (success/failure), rather than when it starts.
      const recordSuccess = (ttlb: number) => {
        latencyBuffer.push(ttlb);
        const scheduleDelta = Math.max(0, Date.now() - scheduledStartTime);
        scheduleDeltaBuffer.push(scheduleDelta);
        resolve();
      };

      const recordFailure = () => {
        const scheduleDelta = Math.max(0, Date.now() - scheduledStartTime);
        scheduleDeltaBuffer.push(scheduleDelta);
        resolve();
      };

      // --- HTTP/3 Path ---
      if (protocol === "http/3") {
        try {
          const options = {
            hostname,
            port: parsedUrl.port || 443,
            path: requestPath,
            method: method,
            headers: headers,
            body: activePayload,
            timeout: 5000
          };

          const reqStartTime = Date.now();
          const req = http3Request(options, (res) => {
            const status = String(res.statusCode || 200);
            statusCodes[status] = (statusCodes[status] || 0) + 1;
            
            if (status.startsWith("2") || status.startsWith("3")) {
              successfulResponses++;
            } else {
              failedResponses++;
            }

            res.on("data", (chunk: Buffer) => {
              bytesReceived += chunk.length;
            });

            res.on("end", () => {
              const ttlb = Date.now() - reqStartTime;
              latencyBuffer.push(ttlb);
              const scheduleDelta = Math.max(0, Date.now() - scheduledStartTime);
              scheduleDeltaBuffer.push(scheduleDelta);
              resolve();
            });

            res.on("error", () => {
              failedResponses++;
              statusCodes["ERR"] = (statusCodes["ERR"] || 0) + 1;
              const scheduleDelta = Math.max(0, Date.now() - scheduledStartTime);
              scheduleDeltaBuffer.push(scheduleDelta);
              resolve();
            });
          });

          req.on("error", () => {
            failedResponses++;
            statusCodes["ERR"] = (statusCodes["ERR"] || 0) + 1;
            const scheduleDelta = Math.max(0, Date.now() - scheduledStartTime);
            scheduleDeltaBuffer.push(scheduleDelta);
            resolve();
          });

          if (needsBody && activePayload) {
            req.write(activePayload);
          }
          req.end();

        } catch (e) {
          failedResponses++;
          statusCodes["ERR"] = (statusCodes["ERR"] || 0) + 1;
          const scheduleDelta = Math.max(0, Date.now() - scheduledStartTime);
          scheduleDeltaBuffer.push(scheduleDelta);
          resolve();
        }
        return;
      }

      function executeH2Request() {
        if (!h2Session || h2Session.destroyed || h2Session.closed) {
          recordFailure();
          return;
        }

        const h2Headers = {
          ":path": requestPath,
          ":method": method,
          ":scheme": parsedUrl.protocol.replace(":", ""),
          ":authority": hostname,
          ...headers
        };

        try {
          const req = h2Session.request(h2Headers);

          req.on("response", (resHeaders) => {
            const status = String(resHeaders[":status"] || 200);
            statusCodes[status] = (statusCodes[status] || 0) + 1;
            applyResponseFeedback(status);
            if (status.startsWith("2") || status.startsWith("3")) {
              successfulResponses++;
            } else {
              failedResponses++;
            }
          });

          req.on("data", (chunk: Buffer) => {
            bytesReceived += chunk.length;
          });

          req.on("end", () => {
            const ttlb = Date.now() - reqStartTime;
            recordSuccess(ttlb);
          });

          req.on("error", () => {
            failedResponses++;
            statusCodes["ERR"] = (statusCodes["ERR"] || 0) + 1;
            applyResponseFeedback("500");
            recordFailure();
          });

          if (needsBody && activePayload) {
            req.write(activePayload);
          }
          req.end();
        } catch (e) {
          failedResponses++;
          statusCodes["ERR"] = (statusCodes["ERR"] || 0) + 1;
          applyResponseFeedback("500");
          recordFailure();
        }
      }

      // --- HTTP/2 Path ---
      if (protocol === "http/2" && h2Session && !h2Session.destroyed && !h2Session.closed) {
        executeH2Request();
        return;
      }

      // --- HTTP/1.1 Standard Path ---
      const transport = isHttps ? https : http;
      let activeAgent = isHttps ? httpsAgent! : httpAgent!;

      if (config.proxyConfig?.enabled && proxyPool && proxyPool.isReady()) {
        const proxyUrl = proxyPool.getNextProxyUrl();
        if (proxyUrl) {
          const proxyAgent = proxyPool.createAgent(proxyUrl);
          if (proxyAgent) {
            activeAgent = proxyAgent;
          }
        }
      }

      const reqOptions: http.RequestOptions = {
        hostname,
        port,
        path: requestPath,
        method,
        agent: activeAgent,
        headers,
        timeout: 5000
      };

      const req = transport.request(reqOptions, (res) => {
        const status = String(res.statusCode || 500);
        statusCodes[status] = (statusCodes[status] || 0) + 1;
        applyResponseFeedback(status);

        if (status.startsWith("2") || status.startsWith("3")) {
          successfulResponses++;
        } else {
          failedResponses++;
        }

        // Read response body fully to calculate true Time-To-Last-Byte (TTLB)
        res.on("data", (chunk: Buffer) => {
          bytesReceived += chunk.length;
        });

        res.on("end", () => {
          const ttlb = Date.now() - reqStartTime;
          recordSuccess(ttlb);
        });
      });

      req.on("error", () => {
        failedResponses++;
        statusCodes["ERR"] = (statusCodes["ERR"] || 0) + 1;
        applyResponseFeedback("500");
        recordFailure();
      });

      req.on("timeout", () => {
        req.destroy();
        failedResponses++;
        statusCodes["504"] = (statusCodes["504"] || 0) + 1;
        applyResponseFeedback("504");
        recordFailure();
      });

      if (needsBody && activePayload) {
        req.write(activePayload);
      }
      req.end();
    });
  };

  // Main Worker Load Execution Loop
  const startWorkerLoad = async (config: TestConfig, pipelinesAssigned: number) => {
    stopWorkerLoad();

    isRunning = true;
    activeConfig = config;
    abortController = new AbortController();
    const signal = abortController.signal;

    // Reset counters
    totalRequests = 0;
    successfulResponses = 0;
    failedResponses = 0;
    bytesSent = 0;
    bytesReceived = 0;
    Object.keys(statusCodes).forEach((k) => delete statusCodes[k]);
    Object.keys(methodCounts).forEach((k) => (methodCounts[k] = 0));
    Object.keys(protocolCounts).forEach((k) => (protocolCounts[k] = 0));
    latencyBuffer = [];
    scheduleDeltaBuffer = [];

    const parsedUrl = new URL(config.target);
    const isHttps = parsedUrl.protocol === "https:";

    // Setup Keep-Alive agents for HTTP/1.1
    httpAgent = new http.Agent({ keepAlive: true, maxSockets: 250, timeout: 5000 });
    httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 250, rejectUnauthorized: false, timeout: 5000 });

    proxyPool = new ProxyPool(config.proxyConfig || { enabled: false, proxyType: 'Tor', instanceCount: 3, country: 'ANY', rotationStrategy: 'ip-rotation-every-n-requests', rotationCount: 5 });
    await proxyPool.initialize();

    // Setup HTTP/2 Session if required
    const mainProto = (config.protocol || "http/1.1").toLowerCase();
    if (mainProto === "http/2" || mainProto === "http/3" || mainProto === "mixed") {
      try {
        const origin = `${parsedUrl.protocol}//${parsedUrl.hostname}:${parsedUrl.port || (isHttps ? 443 : 80)}`;
        h2Session = http2.connect(origin, { rejectUnauthorized: false });
        h2Session.on("error", () => {
          h2Session = null;
        });
      } catch (e) {
        h2Session = null;
      }
    }

    // Flush metrics to Primary every 200ms
    tickInterval = setInterval(sendTickToPrimary, 200);

    const testStartTime = Date.now();
    const durationMs = config.duration * 1000;

    const runPipelineWorker = async (workerIdx: number) => {
      let expectedScheduleTime = Date.now();
      const targetRpsPerWorker = Math.max(1, (config.targetRps || 100) / Math.max(1, pipelinesAssigned));
      const intervalPerRequestMs = 1000 / targetRpsPerWorker;

      while (isRunning && !signal.aborted && Date.now() - testStartTime < durationMs) {
        if (circuitBreakerTripped) {
          await new Promise((r) => setTimeout(r, 500));
          expectedScheduleTime = Date.now();
          continue;
        }

        const elapsedSec = (Date.now() - testStartTime) / 1000;
        const multiplier = getPacingMultiplier(config.pattern, elapsedSec, config.duration);
        const burstSize = Math.max(1, Math.round((config.pipeliningFactor || 5) * multiplier));

        const scheduledTime = expectedScheduleTime;
        const batch = Array.from({ length: burstSize }, () =>
          executeSingleRequest(config, parsedUrl, workerIdx, scheduledTime, signal)
        );

        await Promise.all(batch);

        expectedScheduleTime = Math.max(Date.now(), expectedScheduleTime + intervalPerRequestMs * burstSize);

        // Think Time, Jitter & Response-based Adaptive Dynamic Delay
        let delayMs = 0;
        if (config.thinkTimeMs || config.jitterMs || (config.adaptiveThinkTimeEnabled && adaptivePacingDelayMs > 0)) {
          const think = config.thinkTimeMs || 0;
          const jitter = config.jitterMs ? Math.random() * config.jitterMs : 0;
          const adaptive = config.adaptiveThinkTimeEnabled ? adaptivePacingDelayMs : 0;
          delayMs = Math.round(think + jitter + adaptive);
        }

        if (delayMs > 0) {
          await new Promise((r) => setTimeout(r, delayMs));
          expectedScheduleTime = Date.now();
        }
      }
    };

    // Launch pipeline workers
    for (let i = 0; i < pipelinesAssigned; i++) {
      runPipelineWorker(i);
    }
  };

  // Listen for IPC commands from Primary process
  process.on("message", (msg: any) => {
    if (!msg) return;

    if (msg.cmd === "START_TEST") {
      startWorkerLoad(msg.config, msg.pipelinesForWorker);
    } else if (msg.cmd === "STOP_TEST") {
      stopWorkerLoad();
    } else if (msg.cmd === "CIRCUIT_BREAKER") {
      circuitBreakerTripped = Boolean(msg.tripped);
    }
  });

} else {

  // ==========================================
  // PRIMARY PROCESS LOGIC (EXPRESS SERVER)
  // ==========================================

  const app = express();
  app.use(express.json({ limit: "5mb" }));

  // Fork Cluster Workers
  const cpuCores = Math.max(1, os.cpus().length || 4);
  const workers: Record<number, any> = {};

  console.log(`[Primary Process PID ${process.pid}] Forking ${cpuCores} Cluster Workers for high-throughput load generation...`);

  for (let i = 0; i < cpuCores; i++) {
    const worker = cluster.fork();
    workers[worker.id] = worker;
  }

  // Handle worker restarts if an unexpected crash occurs
  cluster.on("exit", (worker, code, signal) => {
    console.warn(`[Primary Process] Worker ${worker.process.pid} died (code ${code}). Forking replacement...`);
    delete workers[worker.id];
    const newWorker = cluster.fork();
    workers[newWorker.id] = newWorker;
  });

  // Global Active Test State
  let activeTest: TestState = {
    running: false,
    target: "http://localhost:3000/api/health",
    duration: 30,
    pipelines: 15,
    pipeliningFactor: 5,
    protocol: "http/1.1",
    protocolMix: { "http/1.1": 50, "http/2": 40, "http/3": 10 },
    protocolCounts: { "http/1.1": 0, "http/2": 0, "http/3": 0 },
    pattern: "flat",
    bypassCloudflare: false,
    httpMethod: "GET",
    methodMix: { GET: 70, POST: 20, PUT: 5, DELETE: 5 },
    methodCounts: { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, HEAD: 0, OPTIONS: 0 },
    payload: "",
    thinkTimeMs: 0,
    jitterMs: 0,
    circuitBreakerEnabled: true,
    circuitBreakerTripped: false,
    workerClusterCount: cpuCores,
    startTime: Date.now(),
    elapsed: 0,
    totalRequests: 0,
    successfulResponses: 0,
    failedResponses: 0,
    bytesSent: 0,
    bytesReceived: 0,
    peakRps: 0,
    currentRps: 0,
    successRate: 100,
    healthScore: 100,
    avgLatencyMs: 0,
    p50LatencyMs: 0,
    p95LatencyMs: 0,
    p99LatencyMs: 0,
    coordinatedOmissionMs: 0,
    statusCodes: {},
    logs: [
      { time: new Date().toLocaleTimeString(), level: "INFO", message: `[Primary Node Engine] Multi-core load testing cluster initialized with ${cpuCores} active workers.` }
    ],
    history: []
  };

  // Aggregate IPC metrics from workers
  const workerStatsMap: Record<number, {
    totalRequests: number;
    successfulResponses: number;
    failedResponses: number;
    bytesSent: number;
    bytesReceived: number;
    statusCodes: Record<string, number>;
    methodCounts: Record<string, number>;
    protocolCounts: Record<string, number>;
    latencies: number[];
    scheduleDeltas: number[];
    proxyStats?: ProxyStats;
  }> = {};

  cluster.on("message", (worker, msg) => {
    if (msg && msg.cmd === "WORKER_TICK") {
      workerStatsMap[worker.id] = {
        totalRequests: msg.totalRequests,
        successfulResponses: msg.successfulResponses,
        failedResponses: msg.failedResponses,
        bytesSent: msg.bytesSent,
        bytesReceived: msg.bytesReceived,
        statusCodes: msg.statusCodes || {},
        methodCounts: msg.methodCounts || {},
        protocolCounts: msg.protocolCounts || {},
        latencies: msg.latencies || [],
        scheduleDeltas: msg.scheduleDeltas || [],
        proxyStats: msg.proxyStats
      };
    }
  });

  // Server-Sent Events (SSE) Client Broadcaster
  const sseClients = new Set<express.Response>();

  const broadcastSSE = (data: TestState) => {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach((client) => {
      try {
        client.write(payload);
      } catch (e) {
        sseClients.delete(client);
      }
    });
  };

  // Primary Metrics Aggregation Timer
  let masterUpdateInterval: NodeJS.Timeout | null = null;
  let lastTime = Date.now();
  let lastReqCount = 0;

  // Circuit Breaker Rolling Window Trackers
  let circuitBreakerResetTimer: NodeJS.Timeout | null = null;
  const errorWindow: { time: number; failures: number; total: number }[] = [];
  let previousFailReqs = 0;
  let previousTotalReqs = 0;

  const startPrimaryAggregator = () => {
    if (masterUpdateInterval) clearInterval(masterUpdateInterval);
    lastTime = Date.now();
    lastReqCount = 0;
    previousFailReqs = 0;
    previousTotalReqs = 0;
    errorWindow.length = 0;

    masterUpdateInterval = setInterval(() => {
      if (!activeTest.running) {
        if (masterUpdateInterval) clearInterval(masterUpdateInterval);
        return;
      }

      const now = Date.now();
      const elapsed = Math.floor((now - activeTest.startTime) / 1000);
      const dt = (now - lastTime) / 1000 || 1.0;

      // Consolidate worker stats
      let totalReqs = 0;
      let succReqs = 0;
      let failReqs = 0;
      let bSent = 0;
      let bRecv = 0;
      let maxAdaptivePacingMs = 0;
      const combinedStatusCodes: Record<string, number> = {};
      const combinedMethodCounts: Record<string, number> = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, HEAD: 0, OPTIONS: 0 };
      const combinedProtocolCounts: Record<string, number> = { "http/1.1": 0, "http/2": 0, "http/3": 0 };
      let allLatencies: number[] = [];
      let allDeltas: number[] = [];

      let activeProxiesCount = 0;
      let totalRotationsCount = 0;
      let failedProxiesCount = 0;
      let circuitRenewalsCount = 0;
      const combinedCountryDist: Record<string, number> = {};
      let currentProxyInst = 'Direct / None';

      Object.values(workerStatsMap).forEach((st: any) => {
        totalReqs += st.totalRequests;
        succReqs += st.successfulResponses;
        failReqs += st.failedResponses;
        bSent += st.bytesSent;
        bRecv += st.bytesReceived;
        if (st.adaptivePacingDelayMs && st.adaptivePacingDelayMs > maxAdaptivePacingMs) {
          maxAdaptivePacingMs = st.adaptivePacingDelayMs;
        }

        Object.entries(st.statusCodes).forEach(([code, val]) => {
          combinedStatusCodes[code] = (combinedStatusCodes[code] || 0) + (val as number);
        });
        Object.entries(st.methodCounts).forEach(([m, val]) => {
          combinedMethodCounts[m] = (combinedMethodCounts[m] || 0) + (val as number);
        });
        Object.entries(st.protocolCounts).forEach(([p, val]) => {
          combinedProtocolCounts[p] = (combinedProtocolCounts[p] || 0) + (val as number);
        });

        allLatencies.push(...st.latencies);
        allDeltas.push(...st.scheduleDeltas);

        if (st.proxyStats) {
          activeProxiesCount = Math.max(activeProxiesCount, st.proxyStats.activeProxies || 0);
          totalRotationsCount += st.proxyStats.totalRotations || 0;
          failedProxiesCount += st.proxyStats.failedProxies || 0;
          circuitRenewalsCount += st.proxyStats.circuitRenewals || 0;
          currentProxyInst = st.proxyStats.currentProxyInstance || currentProxyInst;
          if (st.proxyStats.countryDistribution) {
            Object.entries(st.proxyStats.countryDistribution).forEach(([country, count]) => {
              combinedCountryDist[country] = (combinedCountryDist[country] || 0) + (count as number);
            });
          }
        }
      });

      activeTest.proxyStats = {
        activeProxies: activeProxiesCount,
        currentProxyInstance: currentProxyInst,
        totalRotations: totalRotationsCount,
        failedProxies: failedProxiesCount,
        circuitRenewals: circuitRenewalsCount,
        countryDistribution: combinedCountryDist
      };

      const currentRps = Math.max(0, Math.round((totalReqs - lastReqCount) / dt));
      lastReqCount = totalReqs;
      lastTime = now;

      if (currentRps > activeTest.peakRps) {
        activeTest.peakRps = currentRps;
      }

      const successRate = totalReqs > 0 ? Number(((succReqs / totalReqs) * 100).toFixed(1)) : 100;

      // Latency Percentile Calculations (P50, P95, P99)
      let avgLat = 0;
      let p50Lat = 0;
      let p95Lat = 0;
      let p99Lat = 0;
      let coMs = 0;

      if (allLatencies.length > 0) {
        const sum = allLatencies.reduce((a, b) => a + b, 0);
        avgLat = Math.round(sum / allLatencies.length);
        const sorted = [...allLatencies].sort((a, b) => a - b);

        p50Lat = sorted[Math.floor(sorted.length * 0.50)] || sorted[0];
        p95Lat = sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1];
        p99Lat = sorted[Math.floor(sorted.length * 0.99)] || sorted[sorted.length - 1];
      }

      if (allDeltas.length > 0) {
        const coSum = allDeltas.reduce((a, b) => a + b, 0);
        coMs = Math.round(coSum / allDeltas.length);
      }

      // Circuit Breaker Rolling Window Analysis (Last 10 seconds)
      const currentTickFails = Math.max(0, failReqs - previousFailReqs);
      const currentTickTotal = Math.max(0, totalReqs - previousTotalReqs);
      previousFailReqs = failReqs;
      previousTotalReqs = totalReqs;

      if (activeTest.circuitBreakerEnabled) {
        errorWindow.push({ time: now, failures: currentTickFails, total: currentTickTotal });

        // Prune window entries older than 10s
        while (errorWindow.length > 0 && now - errorWindow[0].time > 10000) {
          errorWindow.shift();
        }

        const windowFails = errorWindow.reduce((a, b) => a + b.failures, 0);
        const windowTotal = errorWindow.reduce((a, b) => a + b.total, 0);
        const failureRatio = windowTotal > 15 ? windowFails / windowTotal : 0;

        if (failureRatio > 0.7 && !activeTest.circuitBreakerTripped) {
          activeTest.circuitBreakerTripped = true;
          activeTest.logs.unshift({
            time: new Date().toLocaleTimeString(),
            level: "WARNING",
            message: `[Circuit Breaker Tripped] Server failure rate (${(failureRatio * 100).toFixed(1)}%) exceeded 70% in rolling window. Pausing traffic for 15s.`
          });

          // Send IPC to pause worker requests
          Object.values(cluster.workers).forEach((w) => {
            if (w) w.send({ cmd: "CIRCUIT_BREAKER", tripped: true });
          });

          if (circuitBreakerResetTimer) clearTimeout(circuitBreakerResetTimer);
          circuitBreakerResetTimer = setTimeout(() => {
            activeTest.circuitBreakerTripped = false;
            activeTest.logs.unshift({
              time: new Date().toLocaleTimeString(),
              level: "INFO",
              message: `[Circuit Breaker Half-Open] Testing recovery state.`
            });
            Object.values(cluster.workers).forEach((w) => {
              if (w) w.send({ cmd: "CIRCUIT_BREAKER", tripped: false });
            });
          }, 15000);
        }
      }

      // Update state object
      activeTest.elapsed = elapsed;
      activeTest.currentRps = currentRps;
      activeTest.totalRequests = totalReqs;
      activeTest.successfulResponses = succReqs;
      activeTest.failedResponses = failReqs;
      activeTest.bytesSent = bSent;
      activeTest.bytesReceived = bRecv;
      activeTest.successRate = successRate;
      activeTest.avgLatencyMs = avgLat;
      activeTest.p50LatencyMs = p50Lat;
      activeTest.p95LatencyMs = p95Lat;
      activeTest.p99LatencyMs = p99Lat;
      activeTest.coordinatedOmissionMs = coMs;
      activeTest.statusCodes = combinedStatusCodes;
      activeTest.methodCounts = combinedMethodCounts;
      activeTest.protocolCounts = combinedProtocolCounts;
      activeTest.adaptivePacingDelayMs = maxAdaptivePacingMs;

      // Health Score Calculation
      let health = 100;
      if (successRate < 95) health -= (95 - successRate) * 1.5;
      if (p95Lat > 500) health -= Math.min(30, (p95Lat - 500) / 50);
      activeTest.healthScore = Math.max(0, Math.round(health));

      if (activeTest.history.length > 30) activeTest.history.shift();
      activeTest.history.push({
        time: elapsed,
        rps: currentRps,
        successRate,
        p95Latency: p95Lat
      });

      const topStatusStr = Object.entries(combinedStatusCodes)
        .map(([k, v]) => `${k}:${v}`)
        .slice(0, 4)
        .join(", ");

      const logLevel = successRate < 80 ? (successRate < 40 ? "ERROR" : "WARNING") : "INFO";

      activeTest.logs.unshift({
        time: new Date().toLocaleTimeString(),
        level: logLevel,
        message: `[Cluster Stats] ${currentRps} req/s | Latency (P50: ${p50Lat}ms, P95: ${p95Lat}ms, P99: ${p99Lat}ms) | Success: ${successRate}% (${topStatusStr || "OK"})`
      });
      if (activeTest.logs.length > 50) activeTest.logs.pop();

      // Push real-time SSE update to connected clients
      broadcastSSE(activeTest);

      // Duration Expiry Handler
      if (elapsed >= activeTest.duration) {
        if (masterUpdateInterval) clearInterval(masterUpdateInterval);
        activeTest.running = false;

        // Stop all workers
        Object.values(cluster.workers).forEach((w) => {
          if (w) w.send({ cmd: "STOP_TEST" });
        });

        activeTest.logs.unshift({
          time: new Date().toLocaleTimeString(),
          level: "SUCCESS",
          message: `Stress test complete! Total requests: ${activeTest.totalRequests.toLocaleString()} across ${cpuCores} cluster cores | Final Success Rate: ${successRate}%`
        });

        broadcastSSE(activeTest);
      }
    }, 500);
  };

  // ==========================================
  // EXPRESS API ROUTES
  // ==========================================

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", clusterCores: cpuCores, activeWorkers: Object.keys(cluster.workers).length });
  });

  // Target Presets
  app.get("/api/presets", (req, res) => {
    res.json(PRESET_TARGETS);
  });

  // Current Test Status
  app.get("/api/test/status", (req, res) => {
    res.json(activeTest);
  });

  // SSE Real-Time Stream Endpoint
  app.get("/api/test/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    sseClients.add(res);

    // Send immediate snapshot upon connection
    res.write(`data: ${JSON.stringify(activeTest)}\n\n`);

    req.on("close", () => {
      sseClients.delete(res);
    });
  });

  // Start Stress Test
  app.post("/api/test/start", (req, res) => {
    const {
      target,
      duration = 30,
      pipelines = 15,
      pipeliningFactor = 5,
      protocol = "http/1.1",
      protocolMix = { "http/1.1": 50, "http/2": 40, "http/3": 10 },
      pattern = "flat",
      bypassCloudflare = false,
      httpMethod = "GET",
      methodMix = { GET: 70, POST: 20, PUT: 5, DELETE: 5 },
      payload = "",
      dynamicPayloadEnabled = false,
      customHeadersRaw = "",
      customHeaders = {},
      thinkTimeMs = 0,
      jitterMs = 0,
      adaptiveThinkTimeEnabled = false,
      adaptivePacingFactor = 1.5,
      circuitBreakerEnabled = true,
      proxyConfig = { enabled: false, proxyType: 'Tor', instanceCount: 3, country: 'ANY', rotationStrategy: 'ip-rotation-every-n-requests', rotationCount: 5 },
      testMode = 'normal',
      testIntensity = 5,
      payloadType = 'all'
    } = req.body || {};

    if (!target || typeof target !== "string" || !target.trim()) {
      return res.status(400).json({ error: "Target URL cannot be empty. Please specify a target host or address." });
    }

    let formattedTarget = target.trim();
    if (!formattedTarget.startsWith("http://") && !formattedTarget.startsWith("https://")) {
      formattedTarget = "https://" + formattedTarget;
    }

    try {
      new URL(formattedTarget);
    } catch (err) {
      return res.status(400).json({ error: "Invalid URL format. Please enter a valid URL (e.g. https://example.com)." });
    }

    const numPipelines = Math.max(1, Math.min(Number(pipelines) || 15, 500));
    const numFactor = Math.max(1, Math.min(Number(pipeliningFactor) || 5, 100));
    const testDuration = Math.max(5, Math.min(Number(duration) || 30, 7200));

    const selectedMethodUpper = (httpMethod || "GET").toUpperCase();
    const selectedProtocolLower = String(protocol || "http/1.1").toLowerCase();

    // Reset Worker Stats
    Object.keys(workerStatsMap).forEach((k) => delete workerStatsMap[Number(k)]);

    activeTest = {
      running: true,
      target: formattedTarget,
      duration: testDuration,
      pipelines: numPipelines,
      pipeliningFactor: numFactor,
      protocol: selectedProtocolLower === "mixed" ? "MIXED" : selectedProtocolLower,
      protocolMix,
      protocolCounts: { "http/1.1": 0, "http/2": 0, "http/3": 0 },
      pattern,
      bypassCloudflare: Boolean(bypassCloudflare),
      httpMethod: selectedMethodUpper,
      methodMix,
      methodCounts: { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, HEAD: 0, OPTIONS: 0 },
      payload: String(payload || ""),
      dynamicPayloadEnabled: Boolean(dynamicPayloadEnabled),
      customHeadersRaw: String(customHeadersRaw || ""),
      customHeaders: customHeaders || {},
      thinkTimeMs: Number(thinkTimeMs) || 0,
      jitterMs: Number(jitterMs) || 0,
      adaptiveThinkTimeEnabled: Boolean(adaptiveThinkTimeEnabled),
      adaptivePacingFactor: Number(adaptivePacingFactor) || 1.5,
      adaptivePacingDelayMs: 0,
      circuitBreakerEnabled: Boolean(circuitBreakerEnabled),
      circuitBreakerTripped: false,
      proxyConfig,
      testMode,
      testIntensity: Number(testIntensity) || 5,
      payloadType,
      securityStats: {
        totalTestRequests: 0,
        blockedRequests: 0,
        allowedRequests: 0,
        testTypeCounts: {},
        blockedByType: {}
      },
      workerClusterCount: cpuCores,
      startTime: Date.now(),
      elapsed: 0,
      totalRequests: 0,
      successfulResponses: 0,
      failedResponses: 0,
      bytesSent: 0,
      bytesReceived: 0,
      peakRps: 0,
      currentRps: 0,
      successRate: 100,
      healthScore: 100,
      avgLatencyMs: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      coordinatedOmissionMs: 0,
      statusCodes: {},
      logs: [
        { time: new Date().toLocaleTimeString(), level: "INFO", message: `[Cluster Engine (${cpuCores} CPU Cores)] Load generation cluster launched against ${formattedTarget}` },
        { time: new Date().toLocaleTimeString(), level: "INFO", message: `Method: ${selectedMethodUpper} | Protocol: ${selectedProtocolLower.toUpperCase()} | Pipelines: ${numPipelines} (x${numFactor} burst)` }
      ],
      history: []
    };

    // Calculate pipelines per cluster worker process
    const pipelinesPerWorker = Math.max(1, Math.ceil(numPipelines / cpuCores));

    // Dispatch START_TEST command to all cluster workers
    Object.values(cluster.workers).forEach((w) => {
      if (w) {
        w.send({
          cmd: "START_TEST",
          config: activeTest,
          pipelinesForWorker: pipelinesPerWorker
        });
      }
    });

    startPrimaryAggregator();

    res.json({
      success: true,
      message: "Multi-core cluster stress engine initialized",
      state: activeTest
    });
  });

  // Stop Stress Test
  app.post("/api/test/stop", (req, res) => {
    activeTest.running = false;
    if (masterUpdateInterval) clearInterval(masterUpdateInterval);
    if (circuitBreakerResetTimer) clearTimeout(circuitBreakerResetTimer);

    Object.values(cluster.workers).forEach((w) => {
      if (w) w.send({ cmd: "STOP_TEST" });
    });

    activeTest.logs.unshift({
      time: new Date().toLocaleTimeString(),
      level: "WARNING",
      message: "[User Action] Stress test manually terminated by operator."
    });

    broadcastSSE(activeTest);

    res.json({
      success: true,
      message: "Stress test cluster stopped",
      state: activeTest
    });
  });

  // ==========================================
  // VITE DEV SERVER / PRODUCTION STATIC SERVING
  // ==========================================

  async function startServer() {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Primary Process PID ${process.pid}] Server running on http://0.0.0.0:${PORT}`);
    });
  }

  startServer();
}
