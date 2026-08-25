import React from 'react';
import { Plus, History, Layers, AlertTriangle, ShieldCheck, MapPin, X, Code, WifiOff, FileText, User, LogIn, LogOut, Lock } from 'lucide-react';
import { RiskAnalysisResult, AppView } from '../types';
import { AuthProfile } from '../lib/supabase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedAnalyses: RiskAnalysisResult[];
  activeAnalysisId: string | null;
  onSelectAnalysis: (id: string) => void;
  onNewSite: () => void;
  currentView: AppView;
  onNavigateView: (view: AppView) => void;
  language: 'en' | 'hi';
  
  // Edge case state toggles
  isOffline: boolean;
  onToggleOffline: () => void;
  isPartialData: boolean;
  onTogglePartialData: () => void;
  isLowConfidence: boolean;
  onToggleLowConfidence: () => void;

  // Supabase Auth Integration
  user?: AuthProfile | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onOpenDocs?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  savedAnalyses,
  activeAnalysisId,
  onSelectAnalysis,
  onNewSite,
  currentView,
  onNavigateView,
  language,
  isOffline,
  onToggleOffline,
  isPartialData,
  onTogglePartialData,
  isLowConfidence,
  onToggleLowConfidence,
  user,
  onOpenAuth,
  onSignOut,
  onOpenDocs,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        id="sidebar-backdrop"
        className="fixed inset-0 bg-neutral-900/40 z-40 lg:hidden backdrop-blur-xs"
        onClick={onClose}
      />

      <aside
        id="app-sidebar"
        className="fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-neutral-200 z-50 flex flex-col justify-between overflow-y-auto"
      >
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <button
              onClick={() => {
                onNavigateView('landing');
                onClose();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity cursor-pointer group"
              title="Go to HeatOps Home / Landing Page"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600 group-hover:text-amber-500 transition-colors" />
              <span className="font-bold text-neutral-900 text-sm tracking-tight">HeatOps Console</span>
            </button>
            <button
              id="btn-close-sidebar"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Account / Supabase Auth Card */}
          <div className="p-3 rounded-2xl bg-neutral-900 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                Supabase Auth
              </span>
              {user && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                  {user.role === 'hse_lead' ? 'HSE Lead' : user.role === 'site_supervisor' ? 'Supervisor' : 'Contractor'}
                </span>
              )}
            </div>

            {user ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-neutral-950 font-bold flex items-center justify-center text-xs">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-neutral-100 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{user.organization}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px]">
                  <span className="text-neutral-400 truncate max-w-[140px]">{user.email}</span>
                  {onSignOut && (
                    <button
                      onClick={onSignOut}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-neutral-300">
                  Sign in with Supabase to save audits and enable live crew dispatch.
                </p>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onOpenAuth();
                      onClose();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In / Register
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Primary Action */}
          <button
            id="btn-sidebar-new-site"
            onClick={() => {
              onNewSite();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 transition-colors min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'en' ? 'New Site Audit' : 'नया साइट मूल्यांकन'}</span>
          </button>

          {/* Navigation Views */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1 mb-2">
              {language === 'en' ? 'Core Workspaces' : 'कार्यक्षेत्र'}
            </p>

            <button
              id="nav-btn-landing"
              onClick={() => {
                onNavigateView('landing');
                onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Layers className="w-4 h-4 text-neutral-500" />
              <span>{language === 'en' ? 'Product Tour & 3D Lab' : 'सिस्टम विवरण एवं 3D लैब'}</span>
            </button>

            <button
              id="nav-btn-dashboard"
              onClick={() => {
                onNavigateView('dashboard');
                onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-neutral-500" />
              <span>{language === 'en' ? 'Active Site Dashboard' : 'लाइव साइट डैशबोर्ड'}</span>
            </button>

            {onOpenDocs && (
              <button
                id="nav-btn-docs"
                onClick={() => {
                  onOpenDocs();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-orange-50 hover:text-orange-900 transition-colors cursor-pointer"
              >
                <Code className="w-4 h-4 text-orange-600" />
                <span>{language === 'en' ? 'FortyGuard API & Specs' : 'FortyGuard API दस्तावेज़'}</span>
              </button>
            )}
          </div>

          {/* Saved / Past Site Assessments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {language === 'en' ? 'Recent Site Audits' : 'हाल के मूल्यांकन'}
              </p>
              <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                {savedAnalyses.length}
              </span>
            </div>

            {savedAnalyses.length === 0 ? (
              <div className="p-3 text-center rounded-lg border border-dashed border-neutral-200 text-xs text-neutral-400">
                {language === 'en' ? 'No recent saved sites' : 'कोई सुरक्षित साइट नहीं'}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {savedAnalyses.map((site) => {
                  const isActive = activeAnalysisId === site.id;
                  return (
                    <button
                      key={site.id}
                      onClick={() => {
                        onSelectAnalysis(site.id);
                        onClose();
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                          : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs truncate max-w-[130px]">
                          {site.siteName}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            site.decisionStatus === 'NO-GO'
                              ? isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'
                              : site.decisionStatus === 'CAUTION'
                              ? isActive ? 'bg-amber-500 text-neutral-950' : 'bg-amber-100 text-amber-900'
                              : isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {site.decisionStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] opacity-80 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{site.location}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Edge Case & Deliverable State Simulator */}
          <div className="pt-3 border-t border-neutral-200 space-y-2">
            <div className="flex items-center gap-1.5 px-1 text-neutral-500">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-[11px] font-semibold uppercase tracking-wider">
                {language === 'en' ? 'Edge-Case Simulators' : 'सिम्युलेटर मोड'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5 text-neutral-500" />
                  {language === 'en' ? 'Offline Cached Mode' : 'ऑफ़लाइन मोड'}
                </span>
                <input
                  type="checkbox"
                  checked={isOffline}
                  onChange={onToggleOffline}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  {language === 'en' ? 'Partial / Stale Sensor Feed' : 'अधूरा डेटा (Stale)'}
                </span>
                <input
                  type="checkbox"
                  checked={isPartialData}
                  onChange={onTogglePartialData}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-neutral-500" />
                  {language === 'en' ? 'Low Confidence Weather Model' : 'कम विश्वास संकेत'}
                </span>
                <input
                  type="checkbox"
                  checked={isLowConfidence}
                  onChange={onToggleLowConfidence}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-[11px] text-neutral-500">
          <p className="font-medium text-neutral-700">HeatOps Field Engine v1.2</p>
          <p>North India Climate Protection • Supabase</p>
        </div>
      </aside>
    </>
  );
};
