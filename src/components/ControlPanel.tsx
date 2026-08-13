import React from 'react';
import { Play, Square, Sliders, Globe, Zap, Shield, RefreshCw } from 'lucide-react';
import { TestConfig } from '../types';

interface ControlPanelProps {
  config: TestConfig;
  onChangeConfig: (config: TestConfig) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onRequireDisclaimer: (callback: () => void) => void;
}

export function ControlPanel({
  config,
  onChangeConfig,
  isRunning,
  onStart,
  onStop,
  onRequireDisclaimer
}: ControlPanelProps) {
  const handleChange = (field: keyof TestConfig, value: any) => {
    onChangeConfig({
      ...config,
      [field]: value
    });
  };

  const handleStartClick = () => {
    onRequireDisclaimer(() => {
      onStart();
    });
  };

  return (
    <div className="bg-white border-2 border-[#0A0A0A] p-4 sm:p-6 space-y-6 shadow-none">
      <div className="flex items-center justify-between border-b-2 border-[#0A0A0A] pb-4">
        <div className="flex items-center space-x-2 text-[#0A0A0A]">
          <Sliders className="w-5 h-5 text-[#0A0A0A]" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em]">Test Configuration</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Single Universal Target Input Box */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Target (URL or IP:Port)</span>
          </label>
          <input
            type="text"
            disabled={isRunning}
            value={config.target}
            onChange={(e) => handleChange('target', e.target.value)}
            placeholder="http://target.com or 192.168.1.1:8080"
            className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] placeholder-slate-400 focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        
        <div className="col-span-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center justify-between">
            <span>Duration (sec)</span>
            <span className="font-mono font-black">{config.duration}s</span>
          </label>
          <input
            type="number"
            min="5"
            max="7200"
            disabled={isRunning}
            value={config.duration}
            onChange={(e) => handleChange('duration', Number(e.target.value))}
            className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        
        <div className="col-span-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center justify-between">
            <span>Parallel Conns</span>
            <span className="font-mono font-black">{config.pipelines}</span>
          </label>
          <input
            type="number"
            min="1"
            max="200"
            disabled={isRunning}
            value={config.pipelines}
            onChange={(e) => handleChange('pipelines', Number(e.target.value))}
            className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        
        <div className="col-span-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center justify-between">
            <span>Burst Pipelining Size</span>
            <span className="font-mono font-black">{config.pipeliningFactor}x</span>
          </label>
          <input
            type="number"
            min="1"
            max="20"
            disabled={isRunning}
            value={config.pipeliningFactor}
            onChange={(e) => handleChange('pipeliningFactor', Number(e.target.value))}
            className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        
        <div className="col-span-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>HTTP Protocol</span>
          </label>
          <select
            disabled={isRunning}
            value={config.protocol}
            onChange={(e) => {
              const val = e.target.value as any;
              const defaultProtocolMix = config.protocolMix || { 'http/1.1': 50, 'http/2': 40, 'http/3': 10 };
              onChangeConfig({
                ...config,
                protocol: val,
                protocolMix: defaultProtocolMix
              });
            }}
            className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
          >
            <option value="http/1.1">HTTP/1.1 (Pipelined)</option>
            <option value="http/2">HTTP/2 (Multiplexed Session)</option>
            <option value="http/3">HTTP/3 (QUIC/UDP)</option>
            <option value="MIXED">🔀 MIXED (Weighted Protocol Mix System)</option>
          </select>
        </div>

        
        <div className="col-span-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
            <span>HTTP Method</span>
          </label>
          <select
            disabled={isRunning}
            value={config.httpMethod || 'GET'}
            onChange={(e) => {
              const val = e.target.value as any;
              const defaultMix = config.methodMix || { GET: 70, POST: 20, PUT: 5, DELETE: 5, PATCH: 0, HEAD: 0 };
              onChangeConfig({
                ...config,
                httpMethod: val,
                methodMix: defaultMix
              });
            }}
            className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
          >
            <option value="GET">GET (Read Only)</option>
            <option value="POST">POST (Create / Submit)</option>
            <option value="PUT">PUT (Update Replace)</option>
            <option value="DELETE">DELETE (Remove)</option>
            <option value="PATCH">PATCH (Partial Update)</option>
            <option value="HEAD">HEAD (Headers Only)</option>
            <option value="OPTIONS">OPTIONS (CORS Check)</option>
            <option value="MIXED">🔀 MIXED (Weighted Method Mix System)</option>
          </select>
        </div>

        
        <div className="col-span-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center space-x-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Pattern</span>
          </label>
          <select
            disabled={isRunning}
            value={config.pattern}
            onChange={(e) => handleChange('pattern', e.target.value)}
            className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
          >
            <option value="flat">Flat Constant Rate</option>
            <option value="ramp-up">Ramp-Up Curve</option>
            <option value="spike">Periodic Spike</option>
            <option value="sine">Sine Wave Oscillation</option>
          </select>
        </div>

        
        <div className="col-span-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center justify-between">
            <span>Think-Time (ms)</span>
            <span className="font-mono font-black">{config.thinkTimeMs || 0}ms</span>
          </label>
          <input
            type="number"
            min="0"
            max="5000"
            disabled={isRunning}
            value={config.thinkTimeMs || 0}
            onChange={(e) => handleChange('thinkTimeMs', Number(e.target.value))}
            className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        
        <div className="col-span-1 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center justify-between">
            <span>Jitter (ms)</span>
            <span className="font-mono font-black">±{config.jitterMs || 0}ms</span>
          </label>
          <input
            type="number"
            min="0"
            max="2000"
            disabled={isRunning}
            value={config.jitterMs || 0}
            onChange={(e) => handleChange('jitterMs', Number(e.target.value))}
            className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-[#0A0A0A] focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-3 self-end pt-2">
          <div className="flex items-center justify-between bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5">
            <div className="flex items-center space-x-2 min-w-0">
              <Shield className="w-4 h-4 text-[#0A0A0A] flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] truncate">WAF Bypass</span>
            </div>
            <input
              type="checkbox"
              disabled={isRunning}
              checked={config.bypassCloudflare}
              onChange={(e) => handleChange('bypassCloudflare', e.target.checked)}
              className="w-4 h-4 accent-black cursor-pointer disabled:opacity-50 flex-shrink-0 ml-2"
            />
          </div>

          <div className="flex items-center justify-between bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5">
            <div className="flex items-center space-x-2 min-w-0">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] truncate">Circuit Breaker</span>
            </div>
            <input
              type="checkbox"
              disabled={isRunning}
              checked={config.circuitBreakerEnabled ?? true}
              onChange={(e) => handleChange('circuitBreakerEnabled', e.target.checked)}
              className="w-4 h-4 accent-black cursor-pointer disabled:opacity-50 flex-shrink-0 ml-2"
            />
          </div>

          <div className="flex items-center justify-between bg-[#FDFDFD] border-2 border-[#0A0A0A] px-3 sm:px-4 py-2.5">
            <div className="flex items-center space-x-2 min-w-0">
              <RefreshCw className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] truncate">Adaptive Pacing</span>
            </div>
            <input
              type="checkbox"
              disabled={isRunning}
              checked={config.adaptiveThinkTimeEnabled ?? false}
              onChange={(e) => handleChange('adaptiveThinkTimeEnabled', e.target.checked)}
              className="w-4 h-4 accent-black cursor-pointer disabled:opacity-50 flex-shrink-0 ml-2"
            />
          </div>
        </div>

        
        {config.adaptiveThinkTimeEnabled && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-blue-50 border-2 border-[#0A0A0A] p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center space-x-1.5">
                <span>⚡ Response-Aware Adaptive Think-Time Engine</span>
              </span>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Automatically scales think-time backoff delay when target server returns 429 Rate Limit or 4xx/5xx errors, decaying back down on 2xx successes.
              </p>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-center flex-shrink-0">
              <label className="text-xs font-mono font-bold uppercase text-[#0A0A0A]">Backoff Factor:</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                disabled={isRunning}
                value={config.adaptivePacingFactor || 1.5}
                onChange={(e) => handleChange('adaptivePacingFactor', Number(e.target.value))}
                className="w-20 bg-white border border-[#0A0A0A] px-2 py-1 text-xs font-mono font-bold text-[#0A0A0A] focus:outline-none"
              />
            </div>
          </div>
        )}

        
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-[#FFF8F0] border-2 border-[#0A0A0A] p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#0A0A0A]/20 pb-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">Security Payload & WAF Test Module</h3>
            </div>
            <span className="px-2 py-0.5 bg-amber-700 text-white font-mono text-[10px] font-black uppercase">
              WAF / Cloudflare Shield Probes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Security Test Mode</label>
              <select
                disabled={isRunning}
                value={config.testMode || 'normal'}
                onChange={(e) => handleChange('testMode', e.target.value)}
                className="w-full bg-white border-2 border-[#0A0A0A] px-2.5 py-1.5 text-xs font-mono font-bold text-[#0A0A0A]"
              >
                <option value="normal">Normal Load Test (No Injections)</option>
                <option value="payload">Payload Injection (Body / Headers)</option>
                <option value="search">Search Parameter Injection (Query Strings)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex justify-between">
                <span>Test Intensity (1-10)</span>
                <span className="font-mono font-black">{config.testIntensity || 5}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                disabled={isRunning}
                value={config.testIntensity || 5}
                onChange={(e) => handleChange('testIntensity', Number(e.target.value))}
                className="w-full accent-black cursor-pointer disabled:opacity-50 mt-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Payload Attack Type</label>
              <select
                disabled={isRunning || config.testMode === 'normal'}
                value={config.payloadType || 'all'}
                onChange={(e) => handleChange('payloadType', e.target.value)}
                className="w-full bg-white border-2 border-[#0A0A0A] px-2.5 py-1.5 text-xs font-mono font-bold text-[#0A0A0A] disabled:opacity-50"
              >
                <option value="all">🌐 All Attack Vectors (Mixed)</option>
                <option value="sql">💉 SQL Injection (SQLi)</option>
                <option value="xss">⚡ Cross-Site Scripting (XSS)</option>
                <option value="cmd">💻 Command Injection</option>
                <option value="path">📁 Path / Directory Traversal</option>
                <option value="headers">📦 Large Header Flood</option>
                <option value="slow">⏳ Slow Connection / Slowloris</option>
                <option value="redos">🔄 ReDoS Backtracking</option>
                <option value="template">🧩 Template Injection (SSTI)</option>
                <option value="hash">🔑 Hash Collision / Pollution</option>
              </select>
            </div>
          </div>

          <div className="bg-amber-100 border border-amber-400 p-2 text-[11px] font-mono text-amber-900 leading-relaxed">
            ⚠️ <strong>Legal Warning:</strong> Security payload injection generates malicious WAF probe signatures. Only execute against authorized targets with explicit permission.
          </div>
        </div>

        
        {config.protocol === 'MIXED' && (() => {
          const pMix = config.protocolMix || { 'http/1.1': 50, 'http/2': 40, 'http/3': 10 };
          const totalPWeight = Object.values(pMix).reduce((a, b) => a + (Number(b) || 0), 0);

          const updateProtocolMix = (pKey: keyof typeof pMix, val: number) => {
            const updated = {
              ...pMix,
              [pKey]: Math.max(0, val)
            };
            onChangeConfig({ ...config, protocolMix: updated });
          };

          const applyProtocolPreset = (p: { 'http/1.1': number; 'http/2': number; 'http/3': number }) => {
            onChangeConfig({
              ...config,
              protocolMix: p
            });
          };

          return (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-[#F0F7FF] border-2 border-[#0A0A0A] p-3 sm:p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#0A0A0A]/20 pb-2 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-900 text-white text-[10px] font-black uppercase font-mono">
                    HTTP Protocol Mix Engine
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                    Multiplex & Transport Distribution
                  </span>
                </div>

                <div className="text-xs font-mono font-bold flex items-center space-x-2">
                  <span>Total Weight:</span>
                  <span className={`px-2 py-0.5 border text-[11px] ${
                    totalPWeight === 100
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-500'
                      : 'bg-amber-100 text-amber-900 border-amber-500'
                  }`}>
                    {totalPWeight}% {totalPWeight !== 100 ? '(Auto-Scaled)' : '✓ Perfect'}
                  </span>
                </div>
              </div>

              
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Quick Protocol Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => applyProtocolPreset({ 'http/1.1': 10, 'http/2': 60, 'http/3': 30 })}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                  >
                    🚀 Modern Web (10/60/30)
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => applyProtocolPreset({ 'http/1.1': 10, 'http/2': 40, 'http/3': 50 })}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                  >
                    🚀 Next-Gen QUIC (10/40/50)
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => applyProtocolPreset({ 'http/1.1': 70, 'http/2': 25, 'http/3': 5 })}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                  >
                    🚀 Legacy Compat (70/25/5)
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => applyProtocolPreset({ 'http/1.1': 33, 'http/2': 33, 'http/3': 34 })}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                  >
                    🚀 Equal Tri-Mix (33/33/34)
                  </button>
                </div>
              </div>

              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {(['http/1.1', 'http/2', 'http/3'] as const).map((pKey) => {
                  const weightVal = pMix[pKey] ?? 0;
                  const calculatedPct = totalPWeight > 0 ? Math.round((weightVal / totalPWeight) * 100) : 0;

                  return (
                    <div key={pKey} className="bg-white border border-[#0A0A0A] p-3 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="font-black text-[#0A0A0A] uppercase">{pKey}</span>
                        <span className="text-[10px] text-slate-500">{calculatedPct}% Ratio</span>
                      </div>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={isRunning}
                        value={weightVal}
                        onChange={(e) => updateProtocolMix(pKey, Number(e.target.value))}
                        className="w-full bg-[#FDFDFD] border border-[#0A0A0A] px-2.5 py-1 text-xs font-mono font-bold text-[#0A0A0A] focus:outline-none"
                      />

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        disabled={isRunning}
                        value={weightVal}
                        onChange={(e) => updateProtocolMix(pKey, Number(e.target.value))}
                        className="w-full accent-black cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        
        {(() => {
          const proxyConfig = config.proxyConfig || {
            enabled: false,
            proxyType: 'Tor',
            instanceCount: 3,
            country: 'ANY',
            rotationStrategy: 'ip-rotation-every-n-requests',
            rotationCount: 5,
            customProxyList: ''
          };

          const handleProxyChange = (field: string, value: any) => {
            onChangeConfig({
              ...config,
              proxyConfig: {
                ...proxyConfig,
                [field]: value
              }
            });
          };

          return (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-[#F8F9FA] border-2 border-[#0A0A0A] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-700" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0A0A0A]">Tor & Proxy Routing / IP Rotation</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isRunning}
                    checked={proxyConfig.enabled}
                    onChange={(e) => handleProxyChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none border border-[#0A0A0A] peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A0A0A]"></div>
                  <span className="ml-2 text-xs font-mono font-bold uppercase">{proxyConfig.enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              {proxyConfig.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#0A0A0A]/20">
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Proxy Protocol</label>
                    <select
                      disabled={isRunning}
                      value={proxyConfig.proxyType}
                      onChange={(e) => handleProxyChange('proxyType', e.target.value)}
                      className="w-full bg-white border-2 border-[#0A0A0A] px-2.5 py-1.5 text-xs font-mono font-bold text-[#0A0A0A]"
                    >
                      <option value="Tor">Tor (Anonymous Onion Circuits)</option>
                      <option value="SOCKS5">SOCKS5 Proxy Pool</option>
                      <option value="HTTP">HTTP/HTTPS Proxy Pool</option>
                    </select>
                  </div>

                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      {proxyConfig.proxyType === 'Tor' ? 'Tor Instances (3-5)' : 'Instance Pool Count'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      disabled={isRunning}
                      value={proxyConfig.instanceCount}
                      onChange={(e) => handleProxyChange('instanceCount', Number(e.target.value))}
                      className="w-full bg-white border-2 border-[#0A0A0A] px-2.5 py-1.5 text-xs font-mono font-bold text-[#0A0A0A]"
                    />
                  </div>

                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Country Routing</label>
                    <select
                      disabled={isRunning}
                      value={proxyConfig.country}
                      onChange={(e) => handleProxyChange('country', e.target.value)}
                      className="w-full bg-white border-2 border-[#0A0A0A] px-2.5 py-1.5 text-xs font-mono font-bold text-[#0A0A0A]"
                    >
                      <option value="ANY">🌍 Any / Global Random</option>
                      <option value="US">🇺🇸 United States (US)</option>
                      <option value="CA">🇨🇦 Canada (CA)</option>
                      <option value="GB">🇬🇧 United Kingdom (GB)</option>
                      <option value="DE">🇩🇪 Germany (DE)</option>
                      <option value="FR">🇫🇷 France (FR)</option>
                      <option value="JP">🇯🇵 Japan (JP)</option>
                      <option value="AU">🇦🇺 Australia (AU)</option>
                      <option value="NL">🇳🇱 Netherlands (NL)</option>
                      <option value="SE">🇸🇪 Sweden (SE)</option>
                      <option value="CH">🇨🇭 Switzerland (CH)</option>
                    </select>
                  </div>

                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Rotation Strategy</label>
                    <select
                      disabled={isRunning}
                      value={proxyConfig.rotationStrategy}
                      onChange={(e) => handleProxyChange('rotationStrategy', e.target.value)}
                      className="w-full bg-white border-2 border-[#0A0A0A] px-2.5 py-1.5 text-xs font-mono font-bold text-[#0A0A0A]"
                    >
                      <option value="ip-rotation-every-n-requests">Rotate every N requests</option>
                      <option value="round-robin">Round-Robin per request</option>
                      <option value="random">Random per request</option>
                      <option value="sticky">Sticky per pipeline</option>
                    </select>
                  </div>

                  
                  {proxyConfig.rotationStrategy === 'ip-rotation-every-n-requests' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Rotate every N reqs</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        disabled={isRunning}
                        value={proxyConfig.rotationCount}
                        onChange={(e) => handleProxyChange('rotationCount', Number(e.target.value))}
                        className="w-full bg-white border-2 border-[#0A0A0A] px-2.5 py-1.5 text-xs font-mono font-bold text-[#0A0A0A]"
                      />
                    </div>
                  )}

                  
                  {proxyConfig.proxyType !== 'Tor' && (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4 space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Custom Proxy List (host:port or user:pass@host:port, one per line)</label>
                      <textarea
                        rows={2}
                        disabled={isRunning}
                        value={proxyConfig.customProxyList || ''}
                        onChange={(e) => handleProxyChange('customProxyList', e.target.value)}
                        placeholder={'127.0.0.1:9050\nproxy.example.com:8080\nuser:pass@proxy.example.org:3128'}
                        className="w-full bg-white border-2 border-[#0A0A0A] p-2 text-xs font-mono font-bold text-[#0A0A0A] placeholder-slate-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        
        {config.httpMethod === 'MIXED' && (() => {
          const mix = config.methodMix || { GET: 70, POST: 20, PUT: 5, DELETE: 5, PATCH: 0, HEAD: 0 };
          const totalWeight = Object.values(mix).reduce((a, b) => a + (Number(b) || 0), 0);

          const updateMixMethod = (methodKey: keyof typeof mix, val: number) => {
            const updated = {
              ...mix,
              [methodKey]: Math.max(0, val)
            };
            onChangeConfig({ ...config, methodMix: updated });
          };

          const applyMixPreset = (p: { GET: number; POST: number; PUT: number; DELETE: number; PATCH?: number; HEAD?: number }) => {
            onChangeConfig({
              ...config,
              methodMix: { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, HEAD: 0, ...p }
            });
          };

          return (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-[#F8F9FA] border-2 border-[#0A0A0A] p-3 sm:p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#0A0A0A]/20 pb-2 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#0A0A0A] text-white text-[10px] font-black uppercase font-mono">
                    HTTP Method Mix Engine
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                    Weighted Distribution Config
                  </span>
                </div>

                <div className="text-xs font-mono font-bold flex items-center space-x-2">
                  <span>Total Weight:</span>
                  <span className={`px-2 py-0.5 border text-[11px] ${
                    totalWeight === 100
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-500'
                      : 'bg-amber-100 text-amber-900 border-amber-500'
                  }`}>
                    {totalWeight}% {totalWeight !== 100 ? '(Auto-Scaled)' : '✓ Perfect'}
                  </span>
                </div>
              </div>

              
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  Quick Workload Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => applyMixPreset({ GET: 80, POST: 15, PUT: 3, DELETE: 2 })}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                  >
                    ⚡ Read Heavy (80/15/3/2)
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => applyMixPreset({ GET: 30, POST: 50, PUT: 15, DELETE: 5 })}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                  >
                    ⚡ Write Heavy (30/50/15/5)
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => applyMixPreset({ GET: 40, POST: 30, PUT: 20, DELETE: 10 })}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                  >
                    ⚡ REST CRUD Mix (40/30/20/10)
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => applyMixPreset({ GET: 60, POST: 25, PUT: 10, DELETE: 5 })}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                  >
                    ⚡ Microservice API (60/25/10/5)
                  </button>
                </div>
              </div>

              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'] as const).map((mKey) => {
                  const weightVal = mix[mKey] ?? 0;
                  const calculatedPct = totalWeight > 0 ? Math.round((weightVal / totalWeight) * 100) : 0;

                  return (
                    <div key={mKey} className="bg-white border border-[#0A0A0A] p-2.5 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="font-black text-[#0A0A0A]">{mKey}</span>
                        <span className="text-[10px] text-slate-500">{calculatedPct}%</span>
                      </div>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={isRunning}
                        value={weightVal}
                        onChange={(e) => updateMixMethod(mKey, Number(e.target.value))}
                        className="w-full bg-[#FDFDFD] border border-[#0A0A0A] px-2 py-1 text-xs font-mono font-bold text-[#0A0A0A] focus:outline-none"
                      />

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        disabled={isRunning}
                        value={weightVal}
                        onChange={(e) => updateMixMethod(mKey, Number(e.target.value))}
                        className="w-full accent-black cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        
        {(() => {
          const [mode, setMode] = React.useState<'builder' | 'raw'>('builder');
          
          // Parse raw into pairs
          const rawText = config.customHeadersRaw || '';
          const pairs: { key: string; value: string }[] = rawText
            .split(/\r?\n/)
            .map(line => {
              const idx = line.indexOf(':');
              if (idx === -1) return { key: line.trim(), value: '' };
              return {
                key: line.slice(0, idx).trim(),
                value: line.slice(idx + 1).trim()
              };
            })
            .filter(p => p.key || p.value);

          const updatePairs = (newPairs: { key: string; value: string }[]) => {
            const serialized = newPairs
              .filter(p => p.key.trim())
              .map(p => `${p.key.trim()}: ${p.value.trim()}`)
              .join('\n');
            handleChange('customHeadersRaw', serialized);
          };

          return (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 space-y-3 pt-3 border-t border-[#0A0A0A]/20 bg-[#F8F9FA] border-2 border-[#0A0A0A] p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#0A0A0A]/20 pb-2">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                    Custom HTTP Headers
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  
                  <div className="flex border border-[#0A0A0A] bg-white text-[10px] font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setMode('builder')}
                      className={`px-2 py-1 transition-colors ${mode === 'builder' ? 'bg-[#0A0A0A] text-white' : 'hover:bg-slate-100 text-[#0A0A0A]'}`}
                    >
                      Key-Value Builder
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('raw')}
                      className={`px-2 py-1 transition-colors ${mode === 'raw' ? 'bg-[#0A0A0A] text-white' : 'hover:bg-slate-100 text-[#0A0A0A]'}`}
                    >
                      Raw Text (1 per line)
                    </button>
                  </div>
                </div>
              </div>

              
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500">Quick Presets:</span>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    const next = [...pairs, { key: 'Authorization', value: 'Bearer token_{{uuid}}' }];
                    updatePairs(next);
                  }}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                >
                  + Bearer Auth
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    const next = [...pairs, { key: 'X-API-Key', value: 'key_{{random_number}}' }];
                    updatePairs(next);
                  }}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                >
                  + API Key
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    const next = [...pairs, { key: 'X-Tenant-ID', value: 'tenant_{{user_id}}' }];
                    updatePairs(next);
                  }}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                >
                  + Tenant ID
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    const next = [...pairs, { key: 'X-Correlation-ID', value: '{{uuid}}' }];
                    updatePairs(next);
                  }}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-[#0A0A0A] hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                >
                  + Correlation ID
                </button>
              </div>

              {mode === 'builder' ? (
                <div className="space-y-2">
                  {pairs.length === 0 ? (
                    <div className="p-4 bg-white border border-dashed border-slate-300 text-center text-xs font-mono text-slate-500">
                      No custom headers configured yet. Click "+ Add Header" or choose a preset above.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase font-mono text-slate-600 px-1">
                        <div className="col-span-5">Header Name (Key)</div>
                        <div className="col-span-6">Header Value (Supports {'{{tags}}'})</div>
                        <div className="col-span-1 text-center">Action</div>
                      </div>
                      {pairs.map((p, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white border border-[#0A0A0A] p-1.5">
                          <input
                            type="text"
                            disabled={isRunning}
                            placeholder="e.g. Authorization"
                            value={p.key}
                            onChange={(e) => {
                              const updated = [...pairs];
                              updated[idx].key = e.target.value;
                              updatePairs(updated);
                            }}
                            className="col-span-5 bg-[#FDFDFD] border border-slate-300 px-2 py-1 text-xs font-mono font-bold text-[#0A0A0A] focus:outline-none focus:border-black"
                          />
                          <input
                            type="text"
                            disabled={isRunning}
                            placeholder="e.g. Bearer token_123"
                            value={p.value}
                            onChange={(e) => {
                              const updated = [...pairs];
                              updated[idx].value = e.target.value;
                              updatePairs(updated);
                            }}
                            className="col-span-6 bg-[#FDFDFD] border border-slate-300 px-2 py-1 text-xs font-mono font-bold text-[#0A0A0A] focus:outline-none focus:border-black"
                          />
                          <button
                            type="button"
                            disabled={isRunning}
                            onClick={() => {
                              const updated = pairs.filter((_, i) => i !== idx);
                              updatePairs(updated);
                            }}
                            className="col-span-1 h-7 flex items-center justify-center bg-red-50 hover:bg-red-500 hover:text-white border border-red-300 text-red-600 font-bold transition-colors disabled:opacity-50"
                            title="Remove header"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 flex justify-between items-center">
                    <button
                      type="button"
                      disabled={isRunning}
                      onClick={() => {
                        const next = [...pairs, { key: '', value: '' }];
                        updatePairs(next);
                      }}
                      className="px-3 py-1.5 text-xs font-mono font-bold bg-[#0A0A0A] hover:bg-white hover:text-[#0A0A0A] text-white border-2 border-[#0A0A0A] transition-colors disabled:opacity-50 flex items-center space-x-1"
                    >
                      <span>+ Add Header Row</span>
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">
                      {pairs.length} active header{pairs.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <textarea
                    rows={3}
                    disabled={isRunning}
                    value={config.customHeadersRaw || ''}
                    onChange={(e) => handleChange('customHeadersRaw', e.target.value)}
                    placeholder={'Authorization: Bearer token_abc123\nX-Tenant-ID: tenant_99\nX-Correlation-ID: {{uuid}}'}
                    className="w-full bg-white border-2 border-[#0A0A0A] p-2.5 text-xs font-mono font-bold text-[#0A0A0A] placeholder-slate-400 focus:outline-none transition-colors disabled:opacity-50 resize-y"
                  />
                  <p className="text-[10px] font-mono text-slate-500">
                    Enter one header per line in standard <code className="bg-slate-200 px-1">Key: Value</code> format. Dynamic tags like <code className="bg-slate-200 px-1">{'{{uuid}}'}</code> are fully supported.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        
        {(config.httpMethod === 'POST' || config.httpMethod === 'PUT' || config.httpMethod === 'PATCH' || config.httpMethod === 'MIXED') && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 space-y-2 pt-2 border-t border-[#0A0A0A]/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] flex flex-wrap items-center gap-2">
                <span>Request Payload / Body</span>
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-400 text-[10px] font-mono font-bold">
                  Dynamic Template Supported
                </span>
              </label>

              
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500">Insert Tags:</span>
                {[
                  { tag: '{{user_id}}', label: 'user_id' },
                  { tag: '{{timestamp}}', label: 'timestamp' },
                  { tag: '{{uuid}}', label: 'uuid' },
                  { tag: '{{counter}}', label: 'counter' },
                  { tag: '{{random_number}}', label: 'rand_num' },
                  { tag: '{{email}}', label: 'email' }
                ].map(({ tag, label }) => (
                  <button
                    key={tag}
                    type="button"
                    disabled={isRunning}
                    onClick={() => {
                      const current = config.payload || '{\n  "user_id": {{user_id}},\n  "timestamp": {{timestamp}}\n}';
                      handleChange('payload', current + ' ' + tag);
                    }}
                    className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white hover:bg-purple-950 hover:text-white border border-[#0A0A0A] transition-colors disabled:opacity-50"
                  >
                    + {label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              disabled={isRunning}
              value={config.payload || ''}
              onChange={(e) => handleChange('payload', e.target.value)}
              placeholder='{\n  "user_id": {{user_id}},\n  "session_token": "{{uuid}}",\n  "timestamp": {{timestamp}},\n  "email": "{{email}}",\n  "request_seq": {{counter}}\n}'
              className="w-full bg-[#FDFDFD] border-2 border-[#0A0A0A] p-3 text-xs font-mono font-bold text-[#0A0A0A] placeholder-slate-400 focus:outline-none focus:bg-white transition-colors disabled:opacity-50 resize-y"
            />
            <p className="text-[11px] font-mono text-slate-600 leading-relaxed">
              💡 <span className="font-bold text-[#0A0A0A]">Payload Templating:</span> Tags like <code className="bg-slate-100 border px-1">{'{{user_id}}'}</code>, <code className="bg-slate-100 border px-1">{'{{timestamp}}'}</code>, and <code className="bg-slate-100 border px-1">{'{{uuid}}'}</code> generate unique dynamic values per request for realistic API stress testing.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end pt-2 gap-3">
        {!isRunning ? (
          <button
            onClick={handleStartClick}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-[#0A0A0A] hover:bg-white hover:text-[#0A0A0A] text-white font-black uppercase tracking-widest text-sm border-2 border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Stress Test</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-[#FF0000] hover:bg-[#0A0A0A] text-white font-black uppercase tracking-widest text-sm border-2 border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop Test</span>
          </button>
        )}
      </div>
    </div>
  );
}
