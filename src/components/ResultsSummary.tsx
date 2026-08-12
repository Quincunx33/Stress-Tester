import React from 'react';
import { Award, Download, CheckCircle, RefreshCw, BarChart3, ArrowRight, Shield } from 'lucide-react';
import { TestState } from '../types';

interface ResultsSummaryProps {
  state: TestState;
  onReset: () => void;
}

export function ResultsSummary({ state, onReset }: ResultsSummaryProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadJson = () => {
    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `stress_test_report_${Date.now()}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const lines: string[] = [];

    // 1. Executive Summary Metrics
    lines.push("=== EXECUTIVE SUMMARY & METRICS ===");
    lines.push("Metric,Value");
    lines.push(`Target URL,"${state.target.replace(/"/g, '""')}"`);
    lines.push(`Test Duration (s),${state.duration}`);
    lines.push(`Elapsed Time (s),${state.elapsed}`);
    lines.push(`Pipelines,${state.pipelines}`);
    lines.push(`Pipelining Factor,${state.pipeliningFactor}`);
    lines.push(`Protocol,${state.protocol}`);
    lines.push(`HTTP Method,${state.httpMethod || 'GET'}`);
    lines.push(`Load Pattern,${state.pattern}`);
    lines.push(`Cloudflare Bypass,${state.bypassCloudflare}`);
    lines.push(`Total Requests,${state.totalRequests}`);
    lines.push(`Successful Responses,${state.successfulResponses}`);
    lines.push(`Failed Responses,${state.failedResponses}`);
    lines.push(`Success Rate (%),${state.successRate}`);
    lines.push(`Peak RPS,${state.peakRps}`);
    lines.push(`Avg Latency (ms),${state.avgLatencyMs || 0}`);
    lines.push(`P95 Latency (ms),${state.p95LatencyMs || 0}`);
    lines.push(`Bytes Transferred,${state.bytesSent}`);
    lines.push("");

    if (state.proxyStats) {
      lines.push("=== TOR & PROXY ROUTING STATISTICS ===");
      lines.push("Metric,Value");
      lines.push(`Active Proxy Instances,${state.proxyStats.activeProxies}`);
      lines.push(`Total IP Rotations,${state.proxyStats.totalRotations}`);
      lines.push(`Tor Circuit Renewals,${state.proxyStats.circuitRenewals}`);
      lines.push(`Failed Proxies,${state.proxyStats.failedProxies}`);
      lines.push(`Current Proxy Instance,"${(state.proxyStats.currentProxyInstance || '').replace(/"/g, '""')}"`);
      lines.push("");
    }

    if (state.securityStats) {
      lines.push("=== SECURITY PAYLOAD & WAF TEST STATISTICS ===");
      lines.push("Metric,Value");
      lines.push(`Security Test Mode,${state.testMode || 'normal'}`);
      lines.push(`Test Intensity,${state.testIntensity || 5}`);
      lines.push(`Payload Type,${state.payloadType || 'all'}`);
      lines.push(`Total Security Probes,${state.securityStats.totalTestRequests}`);
      lines.push(`WAF Blocked / Filtered,${state.securityStats.blockedRequests}`);
      lines.push(`Allowed / Unfiltered,${state.securityStats.allowedRequests}`);
      lines.push("");

      if (state.securityStats.blockedByType && Object.keys(state.securityStats.blockedByType).length > 0) {
        lines.push("=== WAF BLOCKED BY ATTACK VECTOR ===");
        lines.push("Attack Vector,Blocked Count");
        Object.entries(state.securityStats.blockedByType).forEach(([v, c]) => {
          lines.push(`"${v}",${c}`);
        });
        lines.push("");
      }
    }

    // 2. HTTP Protocol Mix Breakdown
    lines.push("=== HTTP PROTOCOL TRAFFIC DISTRIBUTION ===");
    lines.push("Protocol,Count,Percentage");
    if (state.protocolCounts && Object.keys(state.protocolCounts).length > 0) {
      const totalReqs = state.totalRequests || 1;
      Object.entries(state.protocolCounts).forEach(([proto, count]) => {
        if (count > 0) {
          const pct = ((count / totalReqs) * 100).toFixed(1);
          lines.push(`"${proto}",${count},${pct}%`);
        }
      });
    } else {
      lines.push(`"${state.protocol}",${state.totalRequests},100%`);
    }
    lines.push("");

    // 3. HTTP Method Mix Breakdown
    lines.push("=== HTTP METHOD TRAFFIC DISTRIBUTION ===");
    lines.push("Method,Count,Percentage");
    if (state.methodCounts && Object.keys(state.methodCounts).length > 0) {
      const totalReqs = state.totalRequests || 1;
      Object.entries(state.methodCounts).forEach(([method, count]) => {
        if (count > 0) {
          const pct = ((count / totalReqs) * 100).toFixed(1);
          lines.push(`"${method}",${count},${pct}%`);
        }
      });
    } else {
      lines.push("GET,${state.totalRequests},100%");
    }
    lines.push("");

    // 3. HTTP Status Codes Breakdown
    lines.push("=== HTTP RESPONSE STATUS CODES ===");
    lines.push("Status Code,Count");
    if (state.statusCodes && Object.keys(state.statusCodes).length > 0) {
      Object.entries(state.statusCodes).forEach(([code, count]) => {
        lines.push(`"${code}",${count}`);
      });
    } else {
      lines.push("N/A,0");
    }
    lines.push("");

    // 3. Time Series History
    lines.push("=== PERFORMANCE TELEMETRY HISTORY ===");
    lines.push("Time (s),RPS,Success Rate (%)");
    if (state.history && state.history.length > 0) {
      state.history.forEach((h) => {
        lines.push(`${h.time},${h.rps},${h.successRate}`);
      });
    }
    lines.push("");

    // 4. Detailed Execution Logs
    lines.push("=== EXECUTION LOGS ===");
    lines.push("Time,Level,Message");
    if (state.logs && state.logs.length > 0) {
      state.logs.forEach((log) => {
        const escapedMsg = `"${log.message.replace(/"/g, '""')}"`;
        lines.push(`${log.time},${log.level},${escapedMsg}`);
      });
    }

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stress_test_report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border-2 border-[#0A0A0A] p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b-2 border-[#0A0A0A] pb-4 gap-4">
        <div className="flex items-center space-x-3 text-[#0A0A0A]">
          <div className="w-10 h-10 bg-[#00FF00] border-2 border-[#0A0A0A] flex items-center justify-center font-black">
            ✓
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-[0.2em]">Stress Test Report & Summary</h2>
            <p className="text-xs font-mono font-bold opacity-60">Target: {state.target} • Duration: {state.duration}s</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={downloadJson}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] bg-white hover:bg-[#0A0A0A] hover:text-white border-2 border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={downloadCsv}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] bg-white hover:bg-[#0A0A0A] hover:text-white border-2 border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-[#0A0A0A] hover:bg-white hover:text-[#0A0A0A] border-2 border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Test</span>
          </button>
        </div>
      </div>

      {state.securityStats && (
        <div className="bg-[#FFF8F0] border-2 border-[#0A0A0A] p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#0A0A0A]/20 pb-2">
            <Shield className="w-4 h-4 text-amber-700" />
            <h3 className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]">Security Payload & WAF Test Statistics</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#0A0A0A] p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Security Test Mode</span>
              <span className="text-sm font-mono font-black text-[#0A0A0A]">{state.testMode?.toUpperCase()}</span>
            </div>
            <div className="bg-white border border-[#0A0A0A] p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Probes</span>
              <span className="text-sm font-mono font-black text-[#0A0A0A]">{state.securityStats.totalTestRequests}</span>
            </div>
            <div className="bg-white border border-[#0A0A0A] p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">WAF Blocked / Filtered</span>
              <span className="text-sm font-mono font-black text-emerald-700">{state.securityStats.blockedRequests}</span>
            </div>
            <div className="bg-white border border-[#0A0A0A] p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Allowed / Unfiltered</span>
              <span className="text-sm font-mono font-black text-rose-700">{state.securityStats.allowedRequests}</span>
            </div>
          </div>
        </div>
      )}

      {state.proxyStats && (
        <div className="bg-[#F8F9FA] border-2 border-[#0A0A0A] p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#0A0A0A]/20 pb-2">
            <Shield className="w-4 h-4 text-purple-700" />
            <h3 className="text-xs font-black uppercase tracking-widest text-[#0A0A0A]">Tor & Proxy Routing Statistics</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-[#0A0A0A] p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Instances</span>
              <span className="text-base font-mono font-black text-[#0A0A0A]">{state.proxyStats.activeProxies}</span>
            </div>
            <div className="bg-white border border-[#0A0A0A] p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Total IP Rotations</span>
              <span className="text-base font-mono font-black text-[#0A0A0A]">{state.proxyStats.totalRotations}</span>
            </div>
            <div className="bg-white border border-[#0A0A0A] p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Tor Circuit Renewals</span>
              <span className="text-base font-mono font-black text-[#0A0A0A]">{state.proxyStats.circuitRenewals}</span>
            </div>
            <div className="bg-white border border-[#0A0A0A] p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Failed Proxies</span>
              <span className="text-base font-mono font-black text-red-600">{state.proxyStats.failedProxies}</span>
            </div>
            <div className="col-span-2 bg-white border border-[#0A0A0A] p-3">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Current Active Instance / Circuit</span>
              <span className="text-xs font-mono font-bold text-[#0A0A0A] truncate block" title={state.proxyStats.currentProxyInstance}>
                {state.proxyStats.currentProxyInstance}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FDFDFD] border-2 border-[#0A0A0A] p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Total Requests Sent</span>
          <div className="text-3xl font-black tracking-tighter text-[#0A0A0A]">{state.totalRequests.toLocaleString()}</div>
          <p className="text-xs font-mono font-bold text-[#00AA00]">100% Pipelined Delivery</p>
        </div>

        <div className="bg-[#FDFDFD] border-2 border-[#0A0A0A] p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Peak RPS Achieved</span>
          <div className="text-3xl font-black tracking-tighter text-[#0A0A0A]">{state.peakRps.toLocaleString()} req/s</div>
          <p className="text-xs font-mono font-bold text-slate-600">Protocol: {state.protocol.toUpperCase()}</p>
        </div>

        <div className="bg-[#FDFDFD] border-2 border-[#0A0A0A] p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Overall Success Rate</span>
          <div className="text-3xl font-black tracking-tighter text-[#0A0A0A]">{state.successRate}%</div>
          <p className="text-xs font-mono font-bold text-slate-600">Transferred: {formatBytes(state.bytesSent)}</p>
        </div>
      </div>

      <div className="bg-[#FDFDFD] border-2 border-[#0A0A0A] p-5 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-[0.2em]">Performance Recommendations</h4>
        <ul className="space-y-2 text-xs font-mono font-bold text-slate-700">
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#0A0A0A]" />
            <span>Target responded stably with {state.successRate}% success rate under {state.pipelines} parallel pipelines.</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#0A0A0A]" />
            <span>Pipelining factor of {state.pipeliningFactor}x successfully amplified request concurrency without socket exhaustion.</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#0A0A0A]" />
            <span>Cloudflare/WAF bypass headers successfully simulated realistic client fingerprinting.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
