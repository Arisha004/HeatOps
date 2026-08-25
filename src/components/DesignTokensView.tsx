import React from 'react';
import { RISK_COLOR_TOKENS } from '../constants';
import { Code, Layers, Palette, Type, Grid } from 'lucide-react';

interface DesignTokensViewProps {
  language: 'en' | 'hi';
}

export const DesignTokensView: React.FC<DesignTokensViewProps> = ({ language }) => {
  return (
    <div id="design-tokens-container" className="max-w-2xl mx-auto py-4 px-4 space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-200">
          <Code className="w-3.5 h-3.5 text-neutral-600" />
          <span>Developer Specification & Tokens</span>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
          HeatOps System Tokens
        </h2>
        <p className="text-sm text-neutral-600">
          Explicit typography, spacing, corner radii, and risk color pairs for frontend handoff.
        </p>
      </div>

      {/* 1. Risk Color Tokens Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-neutral-800" />
          <h3 className="text-sm font-bold text-neutral-900">1. Risk Color Tokens (Foreground & Background Pairs)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 font-mono text-[11px]">
                <th className="py-2 px-3">Risk State</th>
                <th className="py-2 px-3">Foreground Hex</th>
                <th className="py-2 px-3">Background Hex</th>
                <th className="py-2 px-3">Border Hex</th>
                <th className="py-2 px-3">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
              {Object.values(RISK_COLOR_TOKENS).map((token) => (
                <tr key={token.level}>
                  <td className="py-2.5 px-3 font-bold text-neutral-900">{token.label}</td>
                  <td className="py-2.5 px-3 text-neutral-700">{token.fgHex}</td>
                  <td className="py-2.5 px-3 text-neutral-700">{token.bgHex}</td>
                  <td className="py-2.5 px-3 text-neutral-700">{token.borderHex}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${token.badgeClass}`}>
                      {token.label.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Type Scale */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-neutral-800" />
          <h3 className="text-sm font-bold text-neutral-900">2. Type Scale (Inter / System Sans)</h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="font-mono text-neutral-400 text-[10px]">Display (28px / 34px)</span>
              <p className="text-2xl font-bold text-neutral-900">Is it safe to work today?</p>
            </div>
            <span className="font-mono text-neutral-500">28px / lh 34px</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="font-mono text-neutral-400 text-[10px]">Heading (20px / 26px)</span>
              <p className="text-xl font-bold text-neutral-900">Noida Sec-62 Concrete Pouring</p>
            </div>
            <span className="font-mono text-neutral-500">20px / lh 26px</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="font-mono text-neutral-400 text-[10px]">Body (16px / 24px)</span>
              <p className="text-base text-neutral-800">Pause outdoor labor 11:00 AM – 3:00 PM due to extreme heat index.</p>
            </div>
            <span className="font-mono text-neutral-500">16px / lh 24px</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="font-mono text-neutral-400 text-[10px]">Caption (13px / 18px)</span>
              <p className="text-xs text-neutral-500">WBGT threshold 35°C limit applied.</p>
            </div>
            <span className="font-mono text-neutral-500">13px / lh 18px</span>
          </div>
        </div>
      </div>

      {/* 3. Spacing & Radius Scales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold text-neutral-900">3. Spacing Scale (4px Base)</h3>
          </div>
          <ul className="text-xs font-mono space-y-1 text-neutral-700">
            <li>4px  (0.25rem) — micro gaps</li>
            <li>8px  (0.5rem)  — chip padding</li>
            <li>12px (0.75rem) — internal card gap</li>
            <li>16px (1.0rem)  — container outer padding</li>
            <li>24px (1.5rem)  — major section gaps</li>
            <li>32px (2.0rem)  — modal padding</li>
            <li>48px (3.0rem)  — min touch target CTA</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold text-neutral-900">4. Corner Radius Scale</h3>
          </div>
          <ul className="text-xs font-mono space-y-2 text-neutral-700">
            <li className="flex items-center justify-between">
              <span>sm (8px) — badges & chips</span>
              <span className="w-6 h-6 border border-neutral-400 rounded-sm bg-neutral-100" />
            </li>
            <li className="flex items-center justify-between">
              <span>md (12px) — inner input fields</span>
              <span className="w-6 h-6 border border-neutral-400 rounded-md bg-neutral-100" />
            </li>
            <li className="flex items-center justify-between">
              <span>lg (16px) — primary cards & sheets</span>
              <span className="w-6 h-6 border border-neutral-400 rounded-lg bg-neutral-100" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
