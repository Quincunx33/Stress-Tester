import React, { useState } from 'react';
import {
  Server,
  Monitor,
  HardDrive,
  Shield,
  Cpu,
  Globe,
  Lock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code,
  Activity,
  Layers,
  Terminal
} from 'lucide-react';
import { ServerFingerprint } from '../types';
import networkNodeBanner from '../assets/images/network_node_banner_1786655121476.jpg';

interface ServerFingerprintCardProps {
  fingerprint: ServerFingerprint | null;
  isLoading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSelectProtocol?: (protocol: 'http/1.1' | 'http/2' | 'http/3') => void;
}

export function ServerFingerprintCard({
  fingerprint,
  isLoading,
  error,
  onRefresh,
  onSelectProtocol
}: ServerFingerprintCardProps) {
  const [showRawHeaders, setShowRawHeaders] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-[#F8F9FA] dark:bg-[#121212] border-2 border-[#0A0A0A] dark:border-white p-5 space-y-4 animate-pulse">
        <div className="flex items-center justify-between border-b border-[#0A0A0A]/20 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 bg-amber-500 rounded-full animate-ping opacity-75"></div>
            <div className="h-4 w-48 bg-slate-300 dark:bg-slate-700 rounded"></div>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
            Probing DNS, TLS, ALPN & Headers...
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-600 p-4 space-y-2 text-rose-950 dark:text-rose-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="text-xs font-black uppercase tracking-wider">Server Reconnaissance Notice</span>
        </div>
        <p className="text-xs font-mono">{error}</p>
      </div>
    );
  }

  if (!fingerprint) {
    return null;
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHeader(label);
    setTimeout(() => setCopiedHeader(null), 2000);
  };

  const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-600 text-white',
    'A': 'bg-emerald-500 text-white',
    'B': 'bg-blue-600 text-white',
    'C': 'bg-amber-500 text-white',
    'D': 'bg-orange-600 text-white',
    'F': 'bg-rose-600 text-white'
  };

  const isCloudflare = fingerprint.wafOrCdn.toLowerCase().includes('cloudflare');
  const isAws = fingerprint.wafOrCdn.toLowerCase().includes('aws') || fingerprint.wafOrCdn.toLowerCase().includes('cloudfront');
  const isAkamai = fingerprint.wafOrCdn.toLowerCase().includes('akamai');

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#141414] border-2 border-[#0A0A0A] dark:border-white p-4 sm:p-6 space-y-5 shadow-none transition-colors">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b-2 border-[#0A0A0A] dark:border-white gap-2.5 w-full min-w-0">
        <div className="flex items-start sm:items-center space-x-2.5 min-w-0 flex-1 w-full">
          <div className="p-1.5 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
            <Monitor className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                <span>Server & Host Identification Results</span>
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-500 text-[10px] font-mono font-black uppercase flex items-center gap-1 flex-shrink-0">
                <Monitor className="w-2.5 h-2.5" />
                <span>Online</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all sm:break-normal mt-1 leading-normal">
              Target Host: <span className="font-bold text-[#0A0A0A] dark:text-white">{fingerprint.hostname}</span> • IP: <span className="font-bold">{fingerprint.ip}</span> • Latency: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fingerprint.responseTimeMs}ms</span> ({fingerprint.statusCode} {fingerprint.statusMessage})
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-2.5 py-1 text-xs font-mono font-bold border border-[#0A0A0A] dark:border-white bg-slate-100 dark:bg-zinc-800 hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex-shrink-0 self-start sm:self-center"
          >
            🔄 Re-Scan
          </button>
        )}
      </div>

      {/* Visual Network Graphic Banner */}
      <div className="relative border-2 border-[#0A0A0A] dark:border-white h-24 sm:h-28 overflow-hidden bg-black group">
        <img
          src={networkNodeBanner}
          alt="Network Server Node Topology"
          className="w-full h-full object-cover object-center opacity-80 group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-3 sm:p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-400 text-black text-[10px] font-mono font-black uppercase tracking-wider">
              HARDWARE TELEMETRY LOG
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline">
              LIVE NETWORK TOPOLOGY DETECTED
            </span>
          </div>
          <div className="flex items-center justify-between text-white font-mono text-xs">
            <span className="font-black text-amber-300 drop-shadow">
              {fingerprint.cloudProvider} Infrastructure
            </span>
            <span className="text-[10px] bg-black/60 px-2 py-0.5 border border-white/20">
              Protocol: {fingerprint.httpProtocol}
            </span>
          </div>
        </div>
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* 1. Web Server Software */}
        <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] border border-[#0A0A0A] dark:border-zinc-700 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <Monitor className="w-3.5 h-3.5 text-blue-600" />
              <span>Server Hardware / Node</span>
            </span>
            {fingerprint.serverVersion && (
              <span className="font-mono text-blue-700 dark:text-blue-400">v{fingerprint.serverVersion}</span>
            )}
          </div>
          <div className="text-sm font-mono font-black text-[#0A0A0A] dark:text-white truncate flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>{fingerprint.serverSoftware}</span>
          </div>
          {fingerprint.operatingSystem && (
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <HardDrive className="w-2.5 h-2.5 text-slate-400" />
              <span>OS: {fingerprint.operatingSystem}</span>
            </div>
          )}
        </div>

        {/* 2. WAF & CDN Shield */}
        <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] border border-[#0A0A0A] dark:border-zinc-700 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <Shield className={`w-3.5 h-3.5 ${isCloudflare ? 'text-amber-500' : isAws ? 'text-orange-500' : isAkamai ? 'text-blue-500' : 'text-slate-500'}`} />
              <span>WAF / CDN Guard</span>
            </span>
            <span className={`px-1.5 py-0.2 text-[9px] font-mono font-black ${
              fingerprint.wafConfidence === 'HIGH' ? 'bg-amber-100 text-amber-900 border border-amber-400' : 'bg-slate-200 text-slate-800'
            }`}>
              {fingerprint.wafConfidence}
            </span>
          </div>
          <div className="text-sm font-mono font-black text-[#0A0A0A] dark:text-white truncate">
            {fingerprint.wafOrCdn}
          </div>
          {fingerprint.wafDetails && fingerprint.wafDetails.length > 0 && (
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {fingerprint.wafDetails[0]}
            </div>
          )}
        </div>

        {/* 3. Tech Stack & Backend */}
        <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] border border-[#0A0A0A] dark:border-zinc-700 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>Backend & CMS</span>
            </span>
            {fingerprint.programmingLanguage && (
              <span className="font-mono text-purple-700 dark:text-purple-400">{fingerprint.programmingLanguage}</span>
            )}
          </div>
          <div className="text-sm font-mono font-black text-[#0A0A0A] dark:text-white truncate">
            {fingerprint.cms || fingerprint.framework || 'Custom / Static'}
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
            {fingerprint.cms && fingerprint.framework ? `${fingerprint.framework}` : fingerprint.cloudProvider || 'Standard Host'}
          </div>
        </div>

        {/* 4. Protocols & Transport */}
        <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] border border-[#0A0A0A] dark:border-zinc-700 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Supported Protocols</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {fingerprint.supportedProtocols.map((p) => {
              const isH3 = p.includes('HTTP/3');
              const isH2 = p.includes('HTTP/2');
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectProtocol && onSelectProtocol(isH3 ? 'http/3' : isH2 ? 'http/2' : 'http/1.1')}
                  className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 text-[10px] font-mono font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  title="Click to apply this protocol in Test Config"
                >
                  {p.split(' ')[0]}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {fingerprint.hasHttp3 ? '⚡ HTTP/3 QUIC Ready' : fingerprint.hasHttp2 ? '🚀 HTTP/2 Multiplexed' : 'Standard HTTP/1.1'}
          </div>
        </div>
      </div>

      {/* Network & TLS Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
        
        {/* Network & Host Info */}
        <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] border border-slate-300 dark:border-zinc-700 p-3 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-zinc-700 pb-1">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Infrastructure & DNS</span>
          </div>
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 flex-shrink-0">IPv4 Address:</span>
              <span className="font-bold text-[#0A0A0A] dark:text-white truncate min-w-0 text-right">{fingerprint.ip}</span>
            </div>
            {fingerprint.ipv6 && (
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500 flex-shrink-0">IPv6 Address:</span>
                <span className="font-bold text-[#0A0A0A] dark:text-white truncate min-w-0 text-right">{fingerprint.ipv6}</span>
              </div>
            )}
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 flex-shrink-0">Cloud / Host:</span>
              <span className="font-bold text-[#0A0A0A] dark:text-white truncate min-w-0 text-right">{fingerprint.cloudProvider}</span>
            </div>
            {fingerprint.reverseDns && (
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500 flex-shrink-0">PTR / rDNS:</span>
                <span className="font-bold text-[#0A0A0A] dark:text-white truncate min-w-0 text-right">{fingerprint.reverseDns}</span>
              </div>
            )}
          </div>
        </div>

        {/* TLS / SSL Certificate Info */}
        <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] border border-slate-300 dark:border-zinc-700 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-zinc-700 pb-1 gap-1">
            <span className="flex items-center space-x-1.5 min-w-0">
              <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">TLS / SSL Certificate</span>
            </span>
            {fingerprint.tlsInfo && (
              <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase flex-shrink-0 ${
                fingerprint.tlsInfo.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {fingerprint.tlsInfo.valid ? 'Valid SSL' : 'Invalid / Expired'}
              </span>
            )}
          </div>
          {fingerprint.tlsInfo ? (
            <div className="space-y-1 pt-1 text-[11px]">
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500 flex-shrink-0">Issuer CA:</span>
                <span className="font-bold text-[#0A0A0A] dark:text-white truncate min-w-0 text-right">
                  {fingerprint.tlsInfo.issuer || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500 flex-shrink-0">Protocol & Cipher:</span>
                <span className="font-bold text-[#0A0A0A] dark:text-white truncate min-w-0 text-right">
                  {fingerprint.tlsInfo.protocol || 'TLS'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Days Remaining:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {fingerprint.tlsInfo.daysRemaining !== undefined ? `${fingerprint.tlsInfo.daysRemaining} days` : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 pt-2">Plain HTTP connection (No TLS certificate)</div>
          )}
        </div>

        {/* Security Headers Scorecard */}
        <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] border border-slate-300 dark:border-zinc-700 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-zinc-700 pb-1">
            <span className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Security Headers Score</span>
            </span>
            <span className={`px-2 py-0.5 text-xs font-black font-mono ${gradeColors[fingerprint.securityHeadersScore.grade] || 'bg-slate-600 text-white'}`}>
              Grade {fingerprint.securityHeadersScore.grade}
            </span>
          </div>
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Compliance Score:</span>
              <span className="font-bold text-[#0A0A0A] dark:text-white">
                {fingerprint.securityHeadersScore.score}/100 ({fingerprint.securityHeadersScore.passed}/{fingerprint.securityHeadersScore.total} Passed)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSecurityDetails(!showSecurityDetails)}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 pt-1"
            >
              <span>{showSecurityDetails ? 'Hide Header Audit' : 'View Full Header Audit'}</span>
              {showSecurityDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Security Header Audit Details */}
      {showSecurityDetails && (
        <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 p-3 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
            HTTP Security Headers Checklist
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {fingerprint.securityHeadersScore.checks.map((check) => (
              <div
                key={check.header}
                className={`p-2 border flex items-start space-x-2 ${
                  check.present
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                }`}
              >
                {check.present ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0A0A0A] dark:text-white truncate">{check.name}</span>
                    <span className={`text-[9px] font-bold uppercase ${check.present ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {check.present ? 'Present' : 'Missing'}
                    </span>
                  </div>
                  {check.value && (
                    <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                      Value: <code className="bg-white dark:bg-zinc-800 px-1 border">{check.value}</code>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {check.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Raw Headers Viewer */}
      <div className="border-t border-slate-200 dark:border-zinc-800 pt-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowRawHeaders(!showRawHeaders)}
            className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw Server Response Headers ({Object.keys(fingerprint.rawHeaders).length})</span>
            {showRawHeaders ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRawHeaders && (
            <button
              type="button"
              onClick={() => {
                const headerText = Object.entries(fingerprint.rawHeaders)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('\n');
                handleCopy(headerText, 'all');
              }}
              className="px-2 py-0.5 text-[10px] font-mono font-bold border border-[#0A0A0A] dark:border-white bg-white dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center space-x-1"
            >
              {copiedHeader === 'all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHeader === 'all' ? 'Copied' : 'Copy All Headers'}</span>
            </button>
          )}
        </div>

        {showRawHeaders && (
          <div className="mt-2 bg-[#0A0A0A] text-[#00FF66] p-3 font-mono text-xs overflow-x-auto max-h-64 space-y-1 border border-black">
            {Object.entries(fingerprint.rawHeaders).map(([key, value]) => (
              <div key={key} className="flex items-start justify-between hover:bg-zinc-900 px-1 py-0.5 group">
                <div className="truncate">
                  <span className="text-[#00FFFF] font-bold">{key}:</span>{' '}
                  <span className="text-white">{value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(`${key}: ${value}`, key)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white text-[10px] flex-shrink-0 ml-2"
                  title="Copy this header"
                >
                  {copiedHeader === key ? '✓' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
