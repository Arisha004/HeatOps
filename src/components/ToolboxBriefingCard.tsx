import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Copy,
  Check,
  Printer,
  HardHat,
  Sparkles,
  Users,
  ShieldCheck,
  Clock,
  Droplets,
  Languages
} from 'lucide-react';
import { ToolboxBriefing } from '../types';

interface ToolboxBriefingCardProps {
  briefing: ToolboxBriefing;
  siteName: string;
  location: string;
  activityType: string;
  headcount: number;
  workRestCycle: string;
  hydrationRate: number;
  safestWindow: string;
  decisionStatus: string;
  uhiDeltaC: number;
  language: 'en' | 'hi';
}

export const ToolboxBriefingCard: React.FC<ToolboxBriefingCardProps> = ({
  briefing,
  siteName,
  location,
  activityType,
  headcount,
  workRestCycle,
  hydrationRate,
  safestWindow,
  decisionStatus,
  uhiDeltaC,
  language: parentLanguage,
}) => {
  const [activeLang, setActiveLang] = useState<'en' | 'hi'>(parentLanguage === 'hi' ? 'hi' : 'en');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Stop speech synthesis when unmounting or switching
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentText = activeLang === 'hi' ? briefing.hindi : briefing.english;

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.lang = activeLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.92; // Clear, deliberate site briefing pace
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>HeatOps Toolbox Briefing - ${siteName}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; }
              .header { border-bottom: 2px solid #ea580c; padding-bottom: 16px; margin-bottom: 24px; }
              .title { font-size: 24px; font-weight: bold; margin: 0; color: #0f172a; }
              .meta { font-size: 14px; color: #64748b; margin-top: 6px; }
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; background: #f8fafc; padding: 16px; border-radius: 8px; }
              .item label { font-size: 11px; font-weight: bold; color: #64748b; display: block; text-transform: uppercase; }
              .item value { font-size: 15px; font-weight: bold; color: #0f172a; }
              .speech-box { background: #fff7ed; border-left: 4px solid #ea580c; padding: 20px; border-radius: 4px; font-size: 16px; line-height: 1.6; margin-top: 24px; }
              .signoff { margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">HEATOPS — Daily Crew Safety Toolbox Briefing</h1>
              <div class="meta">${siteName} (${location}) • Activity: ${activityType} • Date: ${new Date().toLocaleDateString('en-IN')}</div>
            </div>
            <div class="grid">
              <div class="item"><label>Safety Verdict</label><value>${decisionStatus}</value></div>
              <div class="item"><label>Shift Recommendation</label><value>${safestWindow}</value></div>
              <div class="item"><label>Work-Rest Regimen</label><value>${workRestCycle}</value></div>
              <div class="item"><label>Hydration Target</label><value>${hydrationRate} L / worker / hr</value></div>
              <div class="item"><label>Site Crew Size</label><value>${headcount} Workers</value></div>
              <div class="item"><label>Hyperlocal UHI Delta</label><value>+${uhiDeltaC}°C over city baseline</value></div>
            </div>
            <h3 style="margin-top: 24px;">Morning Supervisor Spoken Script (${activeLang === 'hi' ? 'Devanagari Hindi' : 'English'}):</h3>
            <div class="speech-box">
              "${currentText}"
            </div>
            <div class="signoff">
              <div>Supervisor Signature: _______________________</div>
              <div>Date & Time: _______________________</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  return (
    <div id="toolbox-briefing-card" className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-600">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                {activeLang === 'en' ? 'Crew Safety Toolbox Talk (Spoken Briefing)' : 'श्रमिक सुरक्षा टूलबॉक्स ब्रीफिंग (ऑडियो)'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-extrabold uppercase font-mono tracking-wider">
                120-WORD TALK
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {activeLang === 'en'
                ? 'Pre-shift verbal toolbox script for site supervisors with synthetic voice broadcast'
                : 'साइट सुपरवाइजर के लिए सुबह की मौखिक सुरक्षा ब्रीफिंग'}
            </p>
          </div>
        </div>

        {/* Action Controls & Language Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
            <button
              onClick={() => {
                if (isPlaying) window.speechSynthesis.cancel();
                setIsPlaying(false);
                setActiveLang('en');
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeLang === 'en'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => {
                if (isPlaying) window.speechSynthesis.cancel();
                setIsPlaying(false);
                setActiveLang('hi');
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeLang === 'hi'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              हिंदी
            </button>
          </div>

          <button
            id="btn-copy-toolbox"
            onClick={handleCopy}
            title="Copy briefing script"
            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            id="btn-print-toolbox"
            onClick={handlePrint}
            title="Print briefing card"
            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spoken Speech Bubble Container */}
      <div className="relative bg-orange-50/60 rounded-xl p-4 sm:p-5 border border-orange-200/80 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>{activeLang === 'en' ? 'Spoken Field Script for Foreperson' : 'सुपरवाइजर के लिए बोलने योग्य निर्देश'}</span>
          </div>

          <button
            id="btn-play-speech"
            onClick={handleToggleSpeech}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-2xs transition-all cursor-pointer ${
              isPlaying
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{activeLang === 'en' ? 'Stop Speech' : 'रोकें'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{activeLang === 'en' ? 'Play Spoken Voice' : 'ऑडियो सुनें'}</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans font-medium italic">
          "{currentText}"
        </p>

        {/* 4 Fast Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-orange-200/60 text-xs">
          <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
            <span className="text-[10px] text-neutral-500 block uppercase font-bold">Crew Headcount</span>
            <span className="font-bold font-mono text-neutral-900 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-neutral-600" />
              {headcount} Workers
            </span>
          </div>

          <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
            <span className="text-[10px] text-neutral-500 block uppercase font-bold">Work-Rest Protocol</span>
            <span className="font-bold text-neutral-900 text-[11px] truncate block" title={workRestCycle}>
              {workRestCycle}
            </span>
          </div>

          <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
            <span className="text-[10px] text-neutral-500 block uppercase font-bold">Hydration Rate</span>
            <span className="font-bold font-mono text-blue-700 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              {hydrationRate} L / worker / hr
            </span>
          </div>

          <div className="bg-white/80 p-2 rounded-lg border border-orange-100">
            <span className="text-[10px] text-neutral-500 block uppercase font-bold">Safe Shift Window</span>
            <span className="font-bold font-mono text-emerald-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {safestWindow}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
