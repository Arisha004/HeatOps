import React from 'react';
import { Wifi, WifiOff, Menu, Plus, Bell, User, LogIn, ShieldCheck, Trophy, Sparkles, Terminal } from 'lucide-react';
import { Logo } from './Logo';
import { AuthProfile } from '../lib/supabase';

interface HeaderProps {
  isOffline: boolean;
  onToggleOffline: () => void;
  onNewSiteClick: () => void;
  onHomeClick?: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenNotifications?: () => void;
  hasActiveNotifications?: boolean;
  user?: AuthProfile | null;
  onOpenAuth?: () => void;
  onOpenJudgeTour?: () => void;
  onOpenDocs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOffline,
  onToggleOffline,
  onNewSiteClick,
  onHomeClick,
  onToggleSidebar,
  onOpenNotifications,
  hasActiveNotifications = false,
  user,
  onOpenAuth,
  onOpenJudgeTour,
  onOpenDocs,
}) => {
  return (
    <header id="heatops-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-2.5 min-h-[60px] flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-700 min-w-[40px] min-h-[40px] flex items-center justify-center border border-neutral-200 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          id="btn-header-home"
          onClick={() => {
            if (onHomeClick) {
              onHomeClick();
            } else if (onNewSiteClick) {
              onNewSiteClick();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer hover:opacity-90 transition-opacity"
          title="Go to HeatOps Home / Landing Page"
        >
          <Logo size={34} />
          <div>
            <div className="flex items-center gap-2">
              <h1 id="app-title" className="font-bold text-neutral-900 text-base leading-snug tracking-tight group-hover:text-amber-600 transition-colors">
                HeatOps
              </h1>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
                v3.4
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-tight hidden sm:block font-medium">
              ISO 7243 Heat Safety Intelligence
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* FortyGuard API & Architecture Docs Button */}
        {onOpenDocs && (
          <button
            id="btn-fortyguard-docs"
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 shadow-2xs transition-all min-h-[38px] cursor-pointer"
            title="FortyGuard API Endpoints, 6-Stage Pipeline & Project Impact"
          >
            <Terminal className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="hidden lg:inline">API & Specs</span>
          </button>
        )}

        {/* Demo Scenarios & Quick-Start Button */}
        {onOpenJudgeTour && (
          <button
            id="btn-demo-scenarios"
            onClick={onOpenJudgeTour}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 border border-orange-500 shadow-sm transition-all min-h-[38px] cursor-pointer"
            title="Interactive Demo & Live Site Scenarios"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Quick Scenarios</span>
          </button>
        )}

        {/* Supabase Contractor Auth Button */}
        {onOpenAuth && (
          <button
            id="btn-header-auth"
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all min-h-[38px] cursor-pointer ${
              user
                ? 'bg-amber-50 text-neutral-900 border-amber-300 hover:bg-amber-100'
                : 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
            }`}
            title={user ? `Logged in as ${user.fullName} (${user.organization})` : 'Sign in with Supabase'}
          >
            {user ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate max-w-[90px] sm:max-w-[120px] hidden sm:inline">{user.fullName.split(' ')[0]}</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-200/80 text-amber-900 uppercase">
                  {user.role === 'hse_lead' ? 'HSE' : user.role === 'site_supervisor' ? 'SUP' : 'CONT'}
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Login</span>
              </>
            )}
          </button>
        )}

        {/* Notification Bell Action */}
        {onOpenNotifications && (
          <button
            id="btn-header-notifications"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
            title="Dispatch Crew SMS Alert"
          >
            <Bell className="w-4 h-4 text-neutral-700" />
            {hasActiveNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
            )}
          </button>
        )}

        {/* Connection status badge / toggle */}
        <button
          id="btn-toggle-connection"
          onClick={onToggleOffline}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all min-h-[38px] cursor-pointer ${
            isOffline
              ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
              : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
          }`}
          title={isOffline ? 'Simulating Offline Mode' : 'Online Telemetry Connected'}
        >
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="hidden lg:inline">Offline</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden lg:inline">Live</span>
            </>
          )}
        </button>

        {/* New site CTA */}
        <button
          id="btn-header-new-site"
          onClick={onNewSiteClick}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-all min-h-[38px] shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New Site</span>
        </button>
      </div>
    </header>
  );
};
