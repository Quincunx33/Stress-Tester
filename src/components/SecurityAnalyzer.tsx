// src/components/SecurityAnalyzer.tsx
import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { SecurityStats } from '../security-payloads';

interface SecurityAnalyzerProps {
  stats?: SecurityStats;
  testMode?: string;
  intensity?: number;
  payloadType?: string;
}

export function SecurityAnalyzer({ stats, testMode, intensity, payloadType }: SecurityAnalyzerProps) {
  if (!stats || testMode === 'normal') return null;

  const total = stats.totalTestRequests || 0;
  const blocked = stats.blockedRequests || 0;
  const allowed = stats.allowedRequests || 0;
  const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;

  return (
    <div className="bg-[#FFF8F0] border-2 border-[#0A0A0A] p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#0A0A0A]/20 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-amber-700" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#0A0A0A]">
            WAF / Security Payload Analyzer
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 bg-amber-700 text-white font-bold">
            MODE: {testMode?.toUpperCase()}
          </span>
          <span className="px-2 py-1 bg-[#0A0A0A] text-white font-bold">
            INTENSITY: {intensity || 5}/10
          </span>
          <span className="px-2 py-1 bg-purple-700 text-white font-bold">
            {payloadType?.toUpperCase() || 'ALL'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#0A0A0A] p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Probes</span>
          <span className="text-2xl font-black text-[#0A0A0A]">{total.toLocaleString()}</span>
        </div>
        <div className="bg-white border-2 border-[#0A0A0A] p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 block flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-700" /> WAF Blocked
          </span>
          <span className="text-2xl font-black text-emerald-800">{blocked.toLocaleString()}</span>
        </div>
        <div className="bg-white border-2 border-[#0A0A0A] p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-700" /> Allowed
          </span>
          <span className="text-2xl font-black text-rose-800">{allowed.toLocaleString()}</span>
        </div>
        <div className="bg-white border-2 border-[#0A0A0A] p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 block flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-[#0A0A0A]" /> Block Rate
          </span>
          <span className="text-2xl font-black text-[#0A0A0A]">{blockRate}%</span>
        </div>
      </div>

      {stats.blockedByType && Object.keys(stats.blockedByType).length > 0 && (
        <div className="bg-white border-2 border-[#0A0A0A] p-3">
          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">
            Blocked by Attack Vector
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(stats.blockedByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between bg-slate-50 px-2 py-1 border border-slate-200">
                <span className="text-xs font-mono font-bold text-[#0A0A0A]">{type}</span>
                <span className="text-xs font-black text-rose-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
