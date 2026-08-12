import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { LiveDashboard } from './components/LiveDashboard';
import { SecurityAnalyzer } from './components/SecurityAnalyzer';
import { ResultsSummary } from './components/ResultsSummary';
import { DisclaimerModal } from './components/DisclaimerModal';
import { TestConfig, TestState } from './types';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (currentTheme: 'light' | 'dark') => {
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const [config, setConfig] = useState<TestConfig>({
    target: '',
    duration: 30,
    pipelines: 15,
    pipeliningFactor: 5,
    protocol: 'http/1.1',
    pattern: 'flat',
    bypassCloudflare: true,
    proxyConfig: {
      enabled: false,
      proxyType: 'Tor',
      instanceCount: 3,
      country: 'ANY',
      rotationStrategy: 'ip-rotation-every-n-requests',
      rotationCount: 5,
      customProxyList: ''
    }
  });

  const [testState, setTestState] = useState<TestState>({
    running: false,
    target: '',
    duration: 30,
    pipelines: 15,
    pipeliningFactor: 5,
    protocol: 'http/1.1',
    pattern: 'flat',
    startTime: 0,
    elapsed: 0,
    totalRequests: 0,
    successfulResponses: 0,
    failedResponses: 0,
    bytesSent: 0,
    peakRps: 0,
    currentRps: 0,
    successRate: 100,
    healthScore: 100,
    logs: [],
    history: []
  });

  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // SSE + Polling fallback for sub-second telemetry streaming
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollingInterval: any = null;

    if (testState.running) {
      // Connect to Server-Sent Events stream
      try {
        eventSource = new EventSource('/api/test/stream');
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setTestState(data);
          } catch (e) {
            console.error('SSE JSON parse error:', e);
          }
        };
        eventSource.onerror = () => {
          if (eventSource) eventSource.close();
        };
      } catch (e) {
        console.error('SSE setup error:', e);
      }

      // Polling fallback every 500ms
      pollingInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/test/status');
          if (!res.ok) {
            throw new Error(`Server returned HTTP status ${res.status}`);
          }
          const data = await res.json();
          setTestState(data);
          if (!data.running && pollingInterval) {
            clearInterval(pollingInterval);
          }
        } catch (e) {
          console.error('Status fetch error:', e);
        }
      }, 500);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [testState.running]);

  const handleStartTest = async () => {
    setErrorMessage(null);
    if (!config.target || !config.target.trim()) {
      setErrorMessage('Target URL cannot be empty. Please enter a valid URL (e.g. http://example.com).');
      return;
    }

    try {
      const res = await fetch('/api/test/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success && data.state) {
        setTestState(data.state);
      } else if (data.error) {
        setErrorMessage(`Failed to start test: ${data.error}`);
      } else {
        setErrorMessage('Failed to initialize stress test. Please verify configuration and try again.');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(`Network or server error encountered: ${e.message || 'Unable to connect to test server'}`);
    }
  };

  const handleStopTest = async () => {
    try {
      const res = await fetch('/api/test/stop', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.state) {
        setTestState(data.state);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(`Failed to stop test gracefully: ${e.message || 'Server communication error'}`);
    }
  };

  const handleRequireDisclaimer = (callback: () => void) => {
    setPendingAction(() => callback);
    setIsDisclaimerOpen(true);
  };

  const handleConfirmDisclaimer = () => {
    setIsDisclaimerOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelDisclaimer = () => {
    setIsDisclaimerOpen(false);
    setPendingAction(null);
  };

  const handleReset = () => {
    setTestState(prev => ({ ...prev, running: false, totalRequests: 0, logs: [], history: [] }));
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-white flex flex-col font-sans border-[4px] sm:border-[8px] md:border-[12px] border-[#0A0A0A] dark:border-[#FDFDFD] selection:bg-[#0A0A0A] dark:selection:bg-white dark:selection:text-[#0A0A0A] selection:text-white overflow-x-hidden transition-colors duration-200">
      <Header
        isRunning={testState.running}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        theme={theme}
        onChangeTheme={handleThemeChange}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {errorMessage && (
          <div className="bg-rose-100 border-2 border-rose-600 text-rose-900 p-4 font-mono text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="font-black uppercase tracking-wider text-rose-700">Error:</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="px-2 py-0.5 bg-rose-600 text-white font-bold hover:bg-rose-800 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <ControlPanel
          config={config}
          onChangeConfig={setConfig}
          isRunning={testState.running}
          onStart={handleStartTest}
          onStop={handleStopTest}
          onRequireDisclaimer={handleRequireDisclaimer}
        />

        <LiveDashboard state={testState} />

        {testState.securityStats && testState.testMode !== 'normal' && (
          <SecurityAnalyzer 
            stats={testState.securityStats}
            testMode={testState.testMode}
            intensity={testState.testIntensity}
            payloadType={testState.payloadType}
          />
        )}

        {!testState.running && testState.totalRequests > 0 && (
          <ResultsSummary state={testState} onReset={handleReset} />
        )}
      </main>

      <footer className="bg-[#0A0A0A] text-white px-8 py-4 flex flex-col sm:flex-row justify-between items-center border-t-2 border-[#0A0A0A] dark:border-white">
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 bg-[#00FF00]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Core: Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 bg-[#00FF00]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Pipeline: Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 bg-[#FFD700]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">WAF Bypass: Armed</span>
          </div>
        </div>
        <div className="text-[10px] font-mono tracking-widest opacity-60 mt-2 sm:mt-0">
          XIO PIPELINE ENGINE v8.0
        </div>
      </footer>

      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onConfirm={handleConfirmDisclaimer}
        onCancel={handleCancelDisclaimer}
      />
    </div>
  );
}
