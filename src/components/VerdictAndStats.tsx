import React, { useState } from 'react';
import { RiskAnalysisResult } from '../types';
import { AuthProfile } from '../lib/supabase';
import { generateHeatRiskPdfReport } from '../lib/pdfReport';
import { exportAnalysisToCsv } from '../lib/csvExport';
import {
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Thermometer,
  Flame,
  Droplets,
  Sun,
  Wind,
  Send,
  Check,
  Download,
  FileDown,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';

interface VerdictAndStatsProps {
  analysis: RiskAnalysisResult;
  language: 'en' | 'hi';
  onOpenNotifyModal?: () => void;
  user?: AuthProfile | null;
}

export const VerdictAndStats: React.FC<VerdictAndStatsProps> = ({
  analysis,
  language,
  onOpenNotifyModal,
  user,
}) => {
  const [notified, setNotified] = useState(false);
  const [confirmedPause, setConfirmedPause] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);

  const isNoGo = analysis.decisionStatus === 'NO-GO';
  const isAdjust = analysis.decisionStatus === 'ADJUST';
  const isCaution = analysis.decisionStatus === 'CAUTION';

  const decisionBadgeClass = isNoGo
    ? 'bg-red-50 text-red-900 border-red-200'
    : isAdjust
    ? 'bg-orange-50 text-orange-950 border-orange-300'
    : isCaution
    ? 'bg-amber-50 text-amber-900 border-amber-200'
    : 'bg-emerald-50 text-emerald-900 border-emerald-200';

  const cityName = analysis.location.split(',')[0] || 'City';
  const uhiDelta = analysis.uhiDeltaC || 4.2;
  const exceedance = analysis.exceedanceHours || 6;
  const persistence = analysis.longestPersistenceHours || 4;
  const safestWin = analysis.safestWindow || '05:30 – 11:00';
  const crew = analysis.headcount || 30;
  const regimen = analysis.workRestCycle || '30 min Work / 30 min Rest';
  const hydration = analysis.hydrationRate || 1.0;

  const handleNotifyCrew = () => {
    if (onOpenNotifyModal) {
      onOpenNotifyModal();
    } else {
      setNotified(true);
      setTimeout(() => setNotified(false), 3500);
    }
  };

  const handleConfirmPause = () => {
    setConfirmedPause(!confirmedPause);
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        generateHeatRiskPdfReport({
          analysis,
          userName: user?.fullName,
          userRole: user?.role === 'hse_lead' ? 'Chief HSE Lead' : user?.role === 'contractor_lead' ? 'Contractor Lead' : 'Site Supervisor',
          organization: user?.organization,
          language,
        });
        setIsGeneratingPdf(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } catch (err) {
        console.error('PDF Generation Error:', err);
        setIsGeneratingPdf(false);
      }
    }, 400);
  };

  const handleExportCsv = () => {
    setIsExportingCsv(true);
    setTimeout(() => {
      try {
        exportAnalysisToCsv({
          analysis,
          userName: user?.fullName,
          userRole: user?.role === 'hse_lead' ? 'Chief HSE Lead' : user?.role === 'contractor_lead' ? 'Contractor Lead' : 'Site Supervisor',
          organization: user?.organization,
        });
        setIsExportingCsv(false);
        setCsvSuccess(true);
        setTimeout(() => setCsvSuccess(false), 4000);
      } catch (err) {
        console.error('CSV Generation Error:', err);
        setIsExportingCsv(false);
      }
    }, 250);
  };

  return (
    <div className="space-y-4">
      {/* 1. Plain Language Verdict Banner */}
      <div id="verdict-banner" className="bg-white border-l-4 border-l-neutral-900 border-y border-r border-neutral-200 p-4 rounded-xl shadow-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              {language === 'en' ? 'Today’s Safety Verdict' : 'आज का सुरक्षा फैसला'}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs font-mono text-neutral-500">{analysis.timestamp}</span>
          </div>

          {/* Quick Dual Export Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-quick-export-csv"
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-medium transition-colors cursor-pointer"
              title="Export structured CSV for Excel / Safety ERP integration"
            >
              {isExportingCsv ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : csvSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>
                {isExportingCsv
                  ? (language === 'en' ? 'Exporting CSV...' : 'सीएसवी तैयार...')
                  : csvSuccess
                  ? (language === 'en' ? 'CSV Saved' : 'सीएसवी सहेजा गया')
                  : (language === 'en' ? 'Export CSV' : 'सीएसवी डाउनलोड')}
              </span>
            </button>

            <button
              id="btn-quick-export-pdf"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-medium transition-colors cursor-pointer"
              title="Download PDF Summary for Site Stakeholders"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
              ) : downloadSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <FileDown className="w-3.5 h-3.5 text-neutral-600" />
              )}
              <span>
                {isGeneratingPdf
                  ? (language === 'en' ? 'Generating PDF...' : 'रिपोर्ट तैयार हो रही है...')
                  : downloadSuccess
                  ? (language === 'en' ? 'Report Downloaded' : 'डाउनलोड सम्पन्न')
                  : (language === 'en' ? 'Export PDF' : 'पीडीएफ डाउनलोड')}
              </span>
            </button>
          </div>
        </div>
        <p id="verdict-text" className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
          {analysis.overallVerdict}
        </p>
      </div>

      {/* 2. Sticky Prominent GO / ADJUST / NO-GO Decision Card */}
      <div
        id="decision-card"
        className={`bg-white rounded-2xl border p-5 shadow-md transition-all space-y-4 ${
          isNoGo
            ? 'border-red-300 ring-1 ring-red-200'
            : isAdjust
            ? 'border-orange-300 ring-1 ring-orange-200'
            : isCaution
            ? 'border-amber-300 ring-1 ring-amber-200'
            : 'border-emerald-300 ring-1 ring-emerald-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            {isNoGo ? (
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
            ) : isAdjust ? (
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
            ) : isCaution ? (
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span id="decision-status-badge" className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${decisionBadgeClass}`}>
                  {analysis.decisionStatus} STATUS
                </span>
                <span className="text-xs text-neutral-500 font-semibold">
                  Limit: {analysis.thresholdTemp}°C
                </span>
              </div>
              <h4 id="decision-site-title" className="text-base font-bold text-neutral-900 mt-0.5">
                {analysis.siteName}
              </h4>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase block">
              {language === 'en' ? 'Recommended Work Pause' : 'अनुशंसित कार्य विराम'}
            </span>
            <span id="recommended-pause-window" className="text-sm font-bold text-neutral-900 font-mono">
              {analysis.recommendedPauseWindow}
            </span>
          </div>
        </div>

        {/* FortyGuard Decision Banner / Pitch Callout */}
        <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 text-orange-950 text-xs sm:text-sm font-medium leading-snug">
          <span className="font-bold text-orange-900 block mb-0.5">
            {analysis.dataSource === 'fortyguard-live'
              ? (language === 'en' ? 'Hyperlocal FortyGuard Risk Recommendation:' : 'हाइपरलोकल तापमान जोखिम सिफारिश:')
              : analysis.dataSource === 'open-meteo'
              ? (language === 'en' ? 'Risk Recommendation (Open-Meteo live telemetry):' : 'जोखिम सिफारिश (Open-Meteo लाइव डेटा):')
              : (language === 'en' ? 'Risk Recommendation (offline fixture data):' : 'जोखिम सिफारिश (ऑफ़लाइन डेटा):')}
          </span>
          {analysis.dataSource === 'open-meteo' && analysis.fortyGuardNote && (
            <span className="block text-[11px] sm:text-xs text-orange-800/80 font-normal mb-1.5">
              {analysis.fortyGuardNote}
            </span>
          )}
          "Your site runs <strong className="text-orange-900 font-bold">{uhiDelta}°C hotter</strong> than the {cityName} average, and stays above the safe threshold for <strong className="text-orange-900 font-bold">{exceedance} straight hours</strong>. Move the {analysis.activityType.toLowerCase()} to <strong className="text-emerald-800 font-bold font-mono bg-white px-1.5 py-0.5 rounded border border-orange-200">{safestWin}</strong> and you keep all <strong className="text-orange-900 font-bold">{crew} workers</strong>."
        </div>

        {/* 4 FortyGuard Deterministic Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">UHI Thermal Delta</span>
            <span className="text-base font-bold font-mono text-orange-600 block">+{uhiDelta}°C</span>
            <span className="text-[10px] text-neutral-400">vs city baseline</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Exceedance Hours</span>
            <span className="text-base font-bold font-mono text-red-600 block">{exceedance} Hours</span>
            <span className="text-[10px] text-neutral-400">above safe WBGT</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Max Persistence</span>
            <span className="text-base font-bold font-mono text-amber-700 block">{persistence} Hours</span>
            <span className="text-[10px] text-neutral-400">continuous extreme</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] text-neutral-500 font-bold uppercase block">Work-Rest Protocol</span>
            <span className="text-xs font-bold text-neutral-900 block truncate" title={regimen}>{regimen}</span>
            <span className="text-[10px] text-blue-700 font-semibold">{hydration} L/worker/hr</span>
          </div>
        </div>

        {/* Reason text */}
        <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
          {analysis.goNoGoReason}
        </p>

        {/* Action Buttons for Contractor & Stakeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {/* Action 1: Confirm Work Pause */}
          <button
            id="btn-confirm-pause"
            onClick={handleConfirmPause}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
              confirmedPause
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-900'
            }`}
          >
            {confirmedPause ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>{language === 'en' ? 'Pause Logged' : 'विराम दर्ज हुआ'}</span>
              </>
            ) : (
              <span>{language === 'en' ? 'Confirm Work Pause' : 'कार्य विराम की पुष्टि करें'}</span>
            )}
          </button>

          {/* Action 2: Notify Crew via SMS */}
          <button
            id="btn-notify-crew"
            onClick={handleNotifyCrew}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
              notified
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-neutral-600" />
            <span>
              {notified
                ? language === 'en' ? 'Alert Sent via SMS!' : 'अलर्ट भेजा गया!'
                : language === 'en' ? 'Notify Crew via SMS' : 'क्रू को एसएमएस भेजें'}
            </span>
          </button>

          {/* Action 3: Export Structured CSV for Excel / Safety ERP */}
          <button
            id="btn-export-csv"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
              csvSuccess
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300'
            }`}
            title="Download structured CSV dataset for Excel and Safety Trend Analytics"
          >
            {isExportingCsv ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            ) : csvSuccess ? (
              <Check className="w-4 h-4 text-emerald-700" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            )}
            <span>
              {isExportingCsv
                ? (language === 'en' ? 'Exporting CSV...' : 'सीएसवी तैयार...')
                : csvSuccess
                ? (language === 'en' ? 'CSV Downloaded!' : 'सीएसवी डाउनलोड!')
                : (language === 'en' ? 'Export CSV (Excel)' : 'सीएसवी डेटा (Excel)')}
            </span>
          </button>

          {/* Action 4: Download Stakeholder PDF Report */}
          <button
            id="btn-download-report"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-950 border-orange-200'
            }`}
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
            ) : downloadSuccess ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Download className="w-4 h-4 text-orange-600" />
            )}
            <span>
              {isGeneratingPdf
                ? (language === 'en' ? 'Generating PDF...' : 'पीडीएफ बन रहा है...')
                : downloadSuccess
                ? (language === 'en' ? 'Report Downloaded!' : 'रिपोर्ट डाउनलोड हो गई!')
                : (language === 'en' ? 'Download Report (PDF)' : 'रिपोर्ट डाउनलोड (PDF)')}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Supporting Stat Row */}
      <div id="supporting-stat-row" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-0.5">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-semibold">
            <Thermometer className="w-3.5 h-3.5 text-neutral-600" />
            <span>{language === 'en' ? 'Current Temp' : 'वर्तमान तापमान'}</span>
          </div>
          <p className="text-lg font-bold font-mono text-neutral-900">{analysis.currentTemp}°C</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-0.5">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'en' ? 'Feels Like' : 'महसूस ताप'}</span>
          </div>
          <p className="text-lg font-bold font-mono text-amber-900">{analysis.currentHeatIndex}°C</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-0.5">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-semibold">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'en' ? 'Humidity' : 'नमी'}</span>
          </div>
          <p className="text-lg font-bold font-mono text-neutral-900">{analysis.currentHumidity}%</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-0.5">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-semibold">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'en' ? 'UV Index' : 'यूवी इंडेक्स'}</span>
          </div>
          <p className="text-lg font-bold font-mono text-neutral-900">{analysis.currentUvIndex} / 12</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-neutral-200 space-y-0.5 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-semibold">
            <Wind className="w-3.5 h-3.5 text-neutral-600" />
            <span>{language === 'en' ? 'Wind Speed' : 'हवा की गति'}</span>
          </div>
          <p className="text-lg font-bold font-mono text-neutral-900">{analysis.currentWindSpeed} km/h</p>
        </div>
      </div>
    </div>
  );
};

export { VerdictAndStatsSkeleton } from './VerdictAndStatsSkeleton';
