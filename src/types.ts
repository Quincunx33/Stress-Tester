import { SecurityStats } from './security-payloads';

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
  testMode?: string;
  testIntensity?: number;
  payloadType?: string;
  securityStats?: SecurityStats;
  logs: LogEntry[];
  history: HistoryPoint[];
}

export interface PresetTarget {
  name: string;
  url: string;
  pipelines: number;
  duration: number;
  factor: number;
}
