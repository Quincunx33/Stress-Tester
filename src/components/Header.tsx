import React from 'react';
import { ShieldAlert, ExternalLink, Sun, Moon, Monitor } from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  onOpenDisclaimer: () => void;
  theme: 'light' | 'dark' | 'system';
  onChangeTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export function Header({ isRunning, onOpenDisclaimer, theme, onChangeTheme }: HeaderProps) {
  return (
    <header className="border-b-2 border-[#0A0A0A] dark:border-white bg-[#FDFDFD] dark:bg-[#0A0A0A] sticky top-0 z-40 transition-colors duration-200">
      <div className="bg-amber-300 dark:bg-amber-400 border-b-2 border-[#0A0A0A] dark:border-white px-4 sm:px-8 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono font-bold gap-2 text-[#0A0A0A]">
        <span className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#0A0A0A]" />
          <span>AUTHORIZED USE ONLY • RUNS REAL PYTHON STRESS BENCHMARK ENGINE</span>
        </span>
        <div className="flex items-center gap-4">
          <a
            href="https://www.facebook.com/taissuuu?"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 underline uppercase tracking-wider hover:opacity-75 font-black text-amber-950"
          >
            <span>Facebook Profile</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onOpenDisclaimer}
            className="underline uppercase tracking-wider hover:opacity-75 cursor-pointer font-black"
          >
            View Disclaimer
          </button>
        </div>
      </div>
      <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col xl:flex-row items-start xl:items-end justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 dark:text-white/60">Pipeline Instance v8.0</p>
          <h1 className="text-2xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-none tracking-tighter text-[#0A0A0A] dark:text-white break-all sm:break-normal">XIO_STRESS_TESTER</h1>
        </div>

        <div className="flex-shrink-0 flex border-2 border-[#0A0A0A] dark:border-white bg-white dark:bg-[#0E0E0E] font-mono text-xs font-bold divide-x-2 divide-[#0A0A0A] dark:divide-white h-9 sm:h-10 self-start xl:self-end">
          <button
            type="button"
            onClick={() => onChangeTheme('light')}
            className={`px-3 flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                : 'hover:bg-slate-100 text-[#0A0A0A] dark:text-white dark:hover:bg-zinc-800'
            }`}
            title="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">LIGHT</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTheme('dark')}
            className={`px-3 flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                : 'hover:bg-slate-100 text-[#0A0A0A] dark:text-white dark:hover:bg-zinc-800'
            }`}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">DARK</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeTheme('system')}
            className={`px-3 flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'system'
                ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                : 'hover:bg-slate-100 text-[#0A0A0A] dark:text-white dark:hover:bg-zinc-800'
            }`}
            title="System Preference"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">SYSTEM</span>
          </button>
        </div>
      </div>
    </header>
  );
}
