import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DisclaimerModal({ isOpen, onConfirm, onCancel }: DisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-none p-4">
      <div className="bg-white border-4 border-[#0A0A0A] max-w-lg w-full p-8 shadow-[8px_8px_0px_0px_#0A0A0A] text-[#0A0A0A] space-y-6">
        <div className="flex items-center space-x-3 text-[#0A0A0A] border-b-2 border-[#0A0A0A] pb-4">
          <AlertTriangle className="w-8 h-8 flex-shrink-0 text-amber-500" />
          <h3 className="text-xl font-black uppercase tracking-tight">Legal Disclaimer</h3>
        </div>

        <div className="space-y-4 text-xs font-mono font-bold leading-relaxed">
          <p className="text-black bg-amber-200 border-2 border-[#0A0A0A] p-3">
            THIS TOOL IS DESIGNED FOR AUTHORIZED SECURITY TESTING AND PIPELINE BENCHMARKING ONLY.
          </p>
          <p>
            You must only execute stress tests against systems you own or have explicit, written authorization to test. Unauthorized stress testing against third-party servers is illegal and violates computer crime laws.
          </p>
          <div className="bg-[#FDFDFD] border-2 border-[#0A0A0A] p-3 text-xs">
            By proceeding, you confirm that you have proper authorization and accept full legal responsibility for any generated traffic.
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-3 text-xs font-black uppercase tracking-widest text-[#0A0A0A] bg-white hover:bg-slate-100 border-2 border-[#0A0A0A] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center space-x-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-white bg-[#0A0A0A] hover:bg-white hover:text-[#0A0A0A] border-2 border-[#0A0A0A] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>I Agree & Authorize</span>
          </button>
        </div>
      </div>
    </div>
  );
}
