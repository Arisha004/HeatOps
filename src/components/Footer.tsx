import React, { useState } from 'react';
import { Logo } from './Logo';
import {
  ShieldCheck,
  Award,
  Radio,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  FileDown
} from 'lucide-react';
import { AuthProfile } from '../lib/supabase';

interface FooterProps {
  onOpenAuth: () => void;
  user: AuthProfile | null;
  onNavigate?: (tab: 'dashboard' | 'landing') => void;
  onOpenDocs?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAuth,
  user,
  onNavigate,
  onOpenDocs,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="w-full bg-neutral-950 text-neutral-400 border-t border-neutral-800 relative z-20 overflow-hidden font-sans">
      {/* Top subtle accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Col 1 & 2: Brand Identity, Vision & Compliance */}
          <div className="lg:col-span-2 space-y-4">
            <button
              id="btn-footer-home"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('landing');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left group cursor-pointer hover:opacity-90 transition-opacity"
              title="Go to HeatOps Home / Landing Page"
            >
              <Logo size={36} showText theme="dark" />
            </button>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
              HeatOps provides industrial occupational thermal safety intelligence. We compute localized Wet Bulb Globe Temperature (WBGT) and metabolic stress indices conforming to ISO 7243 standards to prevent heat illness and optimize workforce safety.
            </p>

            {/* Compliance & Standards Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ISO 7243:2017</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>NIOSH & OSHA 3154</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300">
                <Lock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Supabase Live Auth</span>
              </div>
            </div>
          </div>

          {/* Col 3: Standards & Methodology */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Standards & Science
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-neutral-300 hover:text-white transition-colors cursor-default block">
                  ISO 7243: WBGT Assessment
                </span>
                <span className="text-[11px] text-neutral-500">Natural wet-bulb & globe measurement</span>
              </li>
              <li>
                <span className="text-neutral-300 hover:text-white transition-colors cursor-default block">
                  OSHA Heat Illness Prevention
                </span>
                <span className="text-[11px] text-neutral-500">Peak midday work cessation thresholds</span>
              </li>
              <li>
                <span className="text-neutral-300 hover:text-white transition-colors cursor-default block">
                  ACGIH TLVs® Work/Rest Cycles
                </span>
                <span className="text-[11px] text-neutral-500">Metabolic pacing from 180W to 460W</span>
              </li>
              <li>
                <span className="text-neutral-300 hover:text-white transition-colors cursor-default block">
                  Solar Radiative Transfer Models
                </span>
                <span className="text-[11px] text-neutral-500">Liljegren algorithm for outdoor WBGT</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Interactive Views */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Platform Solutions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  className="text-neutral-300 hover:text-orange-400 transition-colors text-left cursor-pointer"
                >
                  Site Risk Evaluator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('landing')}
                  className="text-neutral-300 hover:text-orange-400 transition-colors text-left cursor-pointer"
                >
                  3D Solar & Thermal Simulator
                </button>
              </li>
              {onOpenDocs && (
                <li>
                  <button
                    onClick={onOpenDocs}
                    className="text-orange-400 hover:text-orange-300 font-semibold transition-colors text-left cursor-pointer flex items-center gap-1"
                  >
                    <span>FortyGuard API & Architecture</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenAuth}
                  className="text-neutral-300 hover:text-orange-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-orange-400" />
                  {user
                    ? (`Account: ${user.fullName}`)
                    : ('Enterprise Sign In')}
                </button>
              </li>
              <li>
                <span className="text-neutral-400">
                  Automated Shift Safety Reports
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Enterprise Bulletin & Updates */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Safety Bulletins
            </h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Receive daily regional heat action plan (HAP) alerts and advisory dispatches.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full pl-8.5 pr-2 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-700"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Subscribed to Advisory</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe to Alerts</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                NWS Grid 15m Sync
              </span>
              <span className="text-neutral-400">safety@heatops.in</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal & System Status */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>© 2026 HeatOps Technologies Inc.</span>
            <span className="hidden sm:inline">•</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Supabase Auth Engine Active
            </span>
            <span>•</span>
            <span className="text-neutral-400">ISO 7243:2017</span>
            <span>•</span>
            <span className="text-neutral-400">Enterprise v3.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
