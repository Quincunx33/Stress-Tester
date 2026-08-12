import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Zap, CheckCircle2, HardDrive, Clock, Terminal, Gauge, Filter } from 'lucide-react';
import { TestState } from '../types';

interface LiveDashboardProps {
  state: TestState;
}

export function LiveDashboard({ state }: LiveDashboardProps) {
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'>('ALL');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const progressPercent = state.duration > 0 ? Math.min(100, (state.elapsed / state.duration) * 100) : 0;

  const filteredLogs = state.logs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.level === logFilter;
  });

  return (
    <div className="space-y-6">
      
      {state.running && (
        <div className="bg-white border-2 border-[#0A0A0A] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
            <span className="flex items-center space-x-2">
              <Clock className="w-4 h-4 animate-spin text-[#0A0A0A]" />
              <span>Test Execution Active ({state.elapsed}s / {state.duration}s)</span>
            </span>
            <span className="font-mono font-black">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#FDFDFD] h-2.5 overflow-hidden border-2 border-[#0A0A0A]">
            <div
              className="bg-[#0A0A0A] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="bg-white border-2 border-[#0A0A0A] p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#0A0A0A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Current RPS</span>
            <Activity className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-[#0A0A0A] truncate">
            {state.currentRps.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono font-bold text-slate-600 mt-2 truncate">
            PEAK: <span className="text-[#0A0A0A]">{state.peakRps.toLocaleString()} req/s</span>
          </div>
        </div>

        
        <div className="bg-white border-2 border-[#0A0A0A] p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#0A0A0A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Total Requests</span>
            <Zap className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-[#0A0A0A] truncate">
            {state.totalRequests.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono font-bold text-slate-600 mt-2 truncate">
            CONNS: <span className="text-[#0A0A0A]">{state.pipelines} ({state.pipeliningFactor}x)</span>
          </div>
        </div>

        
        <div className="bg-white border-2 border-[#0A0A0A] p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#0A0A0A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Latency (P50/P95)</span>
            <Gauge className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tighter text-[#0A0A0A] truncate">
            {state.p50LatencyMs || 0}<span className="text-xs font-bold text-slate-500">ms P50</span>
          </div>
          <div className="text-[11px] font-mono font-bold text-slate-600 mt-2 space-y-0.5">
            <div className="truncate">P95: <span className="text-[#0A0A0A]">{state.p95LatencyMs || 0}ms</span> | P99: <span className="text-[#0A0A0A]">{state.p99LatencyMs || 0}ms</span></div>
            <div className="text-[10px] text-amber-700 flex flex-wrap items-center justify-between gap-1">
              <span>CO: +{state.coordinatedOmissionMs || 0}ms</span>
              {Boolean(state.adaptivePacingDelayMs && state.adaptivePacingDelayMs > 0) && (
                <span className="text-blue-700 font-black">⚡ Delay: +{state.adaptivePacingDelayMs}ms</span>
              )}
            </div>
          </div>
        </div>

        
        <div className="bg-white border-2 border-[#0A0A0A] p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#0A0A0A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#00AA00]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-[#0A0A0A] truncate">
            {state.successRate}%
          </div>
          <div className="text-[11px] font-mono font-bold text-slate-600 mt-2 truncate">
            FAILED: <span className="text-rose-600">{state.failedResponses.toLocaleString()}</span>
          </div>
        </div>

        
        <div className="bg-white border-2 border-[#0A0A0A] p-4 sm:p-5 relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[#0A0A0A] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Network I/O</span>
            <HardDrive className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tighter text-[#0A0A0A] truncate">
            {formatBytes(state.bytesSent + (state.bytesReceived || 0))}
          </div>
          <div className="text-[11px] font-mono font-bold text-slate-600 mt-2 truncate">
            OUT: <span className="text-[#0A0A0A]">{formatBytes(state.bytesSent)}</span> | IN: <span className="text-[#0A0A0A]">{formatBytes(state.bytesReceived || 0)}</span>
          </div>
        </div>
      </div>

      
      {Boolean(state.testMode && state.testMode !== 'normal') && (
        <div className="bg-[#FFF8F0] border-2 border-[#0A0A0A] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-black uppercase tracking-[0.15em] text-[#0A0A0A] border-b border-[#0A0A0A]/20 pb-2 gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-amber-700 text-white font-mono text-[10px]">
                🛡️ SECURITY TEST MODE: {state.testMode?.toUpperCase()} (INTENSITY: {state.testIntensity || 5})
              </span>
              <span>WAF / Cloudflare Defense Efficacy</span>
            </div>
            <span className="font-mono text-[10px] text-slate-600 font-bold">
              Payload Vector: {state.payloadType?.toUpperCase() || 'ALL'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-white border-2 border-[#0A0A0A] p-3 space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Total Security Probes</div>
              <div className="text-xl font-black">{state.securityStats?.totalTestRequests?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-white border-2 border-[#0A0A0A] p-3 space-y-1">
              <div className="text-[10px] text-emerald-700 font-bold uppercase">WAF Blocked / Filtered</div>
              <div className="text-xl font-black text-emerald-800">{state.securityStats?.blockedRequests?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-white border-2 border-[#0A0A0A] p-3 space-y-1">
              <div className="text-[10px] text-rose-700 font-bold uppercase">Allowed / Unfiltered</div>
              <div className="text-xl font-black text-rose-800">{state.securityStats?.allowedRequests?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>
      )}

      
      {state.protocolCounts && Object.values(state.protocolCounts).some(c => c > 0) && (
        <div className="bg-white border-2 border-[#0A0A0A] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-black uppercase tracking-[0.15em] text-[#0A0A0A] border-b border-[#0A0A0A]/20 pb-2 gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-blue-900 text-white font-mono text-[10px]">
                {state.protocol === 'MIXED' ? '🚀 HTTP PROTOCOL MIX ACTIVE' : `PROTOCOL: ${state.protocol?.toUpperCase()}`}
              </span>
              <span>Protocol Traffic Distribution</span>
            </div>
            <span className="font-mono text-[10px] text-slate-600 font-bold">
              Total Protocol Streams: {Object.values(state.protocolCounts).reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {Object.entries(state.protocolCounts).filter(([_, count]) => count > 0 || state.protocol === 'MIXED').map(([proto, count]) => {
              const totalReqs = state.totalRequests || 1;
              const percentage = Math.min(100, Math.round((count / totalReqs) * 100));

              let colorStyle = "border-blue-700 bg-blue-50 text-blue-950";
              let barStyle = "bg-blue-700";
              if (proto === 'http/2') {
                colorStyle = "border-indigo-700 bg-indigo-50 text-indigo-950";
                barStyle = "bg-indigo-700";
              } else if (proto === 'http/3') {
                colorStyle = "border-purple-700 bg-purple-50 text-purple-950";
                barStyle = "bg-purple-700";
              }

              return (
                <div key={proto} className={`p-2.5 border-2 font-mono space-y-1.5 ${colorStyle}`}>
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="uppercase font-black">{proto}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="text-sm font-black tracking-tight">
                    {count.toLocaleString()} requests
                  </div>
                  <div className="w-full bg-black/10 h-1.5 overflow-hidden border border-black/20">
                    <div className={`h-full ${barStyle} transition-all duration-300`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      
      {state.methodCounts && Object.values(state.methodCounts).some(c => c > 0) && (
        <div className="bg-white border-2 border-[#0A0A0A] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-black uppercase tracking-[0.15em] text-[#0A0A0A] border-b border-[#0A0A0A]/20 pb-2 gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-[#0A0A0A] text-white font-mono text-[10px]">
                {state.httpMethod === 'MIXED' ? '🔀 HTTP METHOD MIX ACTIVE' : `HTTP METHOD: ${state.httpMethod}`}
              </span>
              <span>Method Traffic Distribution</span>
            </div>
            <span className="font-mono text-[10px] text-slate-600 font-bold">
              Total Method Requests: {Object.values(state.methodCounts).reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
            {Object.entries(state.methodCounts).filter(([_, count]) => count > 0 || state.httpMethod === 'MIXED').map(([method, count]) => {
              const totalReqs = state.totalRequests || 1;
              const percentage = Math.min(100, Math.round((count / totalReqs) * 100));

              let colorStyle = "border-cyan-600 bg-cyan-50 text-cyan-950";
              let barStyle = "bg-cyan-600";
              if (method === 'POST') {
                colorStyle = "border-emerald-600 bg-emerald-50 text-emerald-950";
                barStyle = "bg-emerald-600";
              } else if (method === 'PUT') {
                colorStyle = "border-amber-600 bg-amber-50 text-amber-950";
                barStyle = "bg-amber-600";
              } else if (method === 'DELETE') {
                colorStyle = "border-rose-600 bg-rose-50 text-rose-950";
                barStyle = "bg-rose-600";
              } else if (method === 'PATCH') {
                colorStyle = "border-purple-600 bg-purple-50 text-purple-950";
                barStyle = "bg-purple-600";
              } else if (method === 'HEAD' || method === 'OPTIONS') {
                colorStyle = "border-slate-600 bg-slate-50 text-slate-950";
                barStyle = "bg-slate-600";
              }

              return (
                <div key={method} className={`p-2.5 border-2 font-mono space-y-1.5 ${colorStyle}`}>
                  <div className="flex items-center justify-between text-xs font-black">
                    <span>{method}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="text-sm font-black tracking-tight">
                    {count.toLocaleString()}
                  </div>
                  <div className="w-full bg-black/10 h-1.5 overflow-hidden border border-black/20">
                    <div className={`h-full ${barStyle} transition-all duration-300`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      
      {state.statusCodes && Object.keys(state.statusCodes).length > 0 && (
        <div className="bg-white border-2 border-[#0A0A0A] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.15em] text-[#0A0A0A]">
            <span>HTTP Status Code & Response Tracker</span>
            <span className="font-mono text-[10px] opacity-60">Real-Time HTTP Codes</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(state.statusCodes).map(([code, count]) => {
              let badgeColor = "bg-slate-100 border-slate-400 text-slate-900";
              if (code.startsWith("2")) badgeColor = "bg-emerald-100 border-emerald-600 text-emerald-900";
              else if (code.startsWith("3")) badgeColor = "bg-blue-100 border-blue-600 text-blue-900";
              else if (code.startsWith("4")) badgeColor = "bg-amber-100 border-amber-600 text-amber-900";
              else if (code.startsWith("5")) badgeColor = "bg-rose-100 border-rose-600 text-rose-900";
              else badgeColor = "bg-purple-100 border-purple-600 text-purple-900";

              return (
                <div key={code} className={`px-3 py-1 border-2 font-mono text-xs font-bold flex items-center space-x-2 ${badgeColor}`}>
                  <span className="font-black">{code}</span>
                  <span className="opacity-80">({count.toLocaleString()})</span>
                </div>
              );
            })}
          </div>

          
          {(state.statusCodes['429'] || state.statusCodes['403'] || state.statusCodes['503'] || state.statusCodes['TIMEOUT']) && (
            <div className="bg-amber-50 border border-amber-300 p-2.5 text-xs text-amber-900 font-mono space-y-1">
              <span className="font-bold uppercase tracking-wider block">⚡ Diagnostic Note (Adaptive Engine Active):</span>
              <p>
                Target server returned <strong>{state.statusCodes['429'] ? '429 (Rate Limit)' : state.statusCodes['403'] ? '403 (WAF Shield)' : '503 / Timeout'}</strong> responses. The adaptive backoff engine is pacing dynamic delays to prevent socket exhaustion and maintain optimal telemetry output.
              </p>
            </div>
          )}
        </div>
      )}

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white border-2 border-[#0A0A0A] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#0A0A0A] pb-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Requests Per Second (RPS)</h3>
            <span className="text-[10px] font-mono uppercase bg-[#0A0A0A] text-white px-2 py-1 font-bold">
              Telemetry Stream
            </span>
          </div>
          <div className="h-72 w-full">
            {state.history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={state.history}>
                  <defs>
                    <linearGradient id="rpsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-stroke)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--chart-stroke)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="time" stroke="var(--chart-stroke)" fontSize={11} tickFormatter={(t) => `${t}s`} />
                  <YAxis stroke="var(--chart-stroke)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0A', borderColor: 'var(--chart-stroke)', borderRadius: '0px', color: '#ffffff', fontFamily: 'monospace' }}
                    formatter={(value: any) => [`${value} req/s`, 'RPS']}
                    labelFormatter={(label) => `Time: ${label}s`}
                  />
                  <Area type="monotone" dataKey="rps" stroke="var(--chart-stroke)" strokeWidth={3} fillOpacity={1} fill="url(#rpsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-xs opacity-55">
                Start test to view live performance telemetry
              </div>
            )}
          </div>
        </div>

        
        <div className="bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] p-6 flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 border-b border-white/20 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#00FF00]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Execution Logs</h3>
              </div>
              <span className="text-[10px] font-mono opacity-65">{filteredLogs.length} entries</span>
            </div>

            
            <div className="flex items-center space-x-1 pt-1 overflow-x-auto">
              <Filter className="w-3 h-3 text-white/50" />
              {(['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setLogFilter(level)}
                  className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition-colors ${
                    logFilter === level
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-black border border-white/20 p-3 h-64 overflow-y-auto font-mono text-[11px] space-y-2">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-white/40 flex-shrink-0">[{log.time}]</span>
                  <span className={`font-bold flex-shrink-0 ${
                    log.level === 'SUCCESS' ? 'text-[#00FF00]' :
                    log.level === 'WARNING' ? 'text-amber-400' :
                    log.level === 'ERROR' ? 'text-rose-500' : 'text-cyan-400'
                  }`}>
                    {log.level}:
                  </span>
                  <span className="text-white/90 break-all">{log.message}</span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-white/40 font-mono text-xs">
                No logs match the selected filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
