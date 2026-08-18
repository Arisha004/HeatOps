import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Bot } from 'lucide-react';

interface AiReasoningCardProps {
  reasoning: string[];
  language: 'en' | 'hi';
}

export const AiReasoningCard: React.FC<AiReasoningCardProps> = ({ reasoning, language }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div id="ai-reasoning-card" className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-2">
      <button
        id="btn-toggle-ai-reasoning"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold text-xs border border-neutral-200">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
            <span>{language === 'en' ? 'Why this recommendation' : 'यह सिफारिश क्यों दी गई'}</span>
            <span className="text-[10px] text-neutral-500 font-medium font-mono px-1.5 py-0.2 bg-neutral-100 rounded">
              {language === 'en' ? 'AI Reasoning' : 'एआई तर्क'}
            </span>
          </h4>
        </div>

        <div className="flex items-center gap-1 text-neutral-500 text-xs font-medium">
          <span>{isOpen ? (language === 'en' ? 'Hide' : 'छिपाएं') : (language === 'en' ? 'Show' : 'दिखाएं')}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="pt-2 border-t border-neutral-100 space-y-2 text-xs text-neutral-700 animate-fade-in">
          <ul className="space-y-1.5 pl-1">
            {reasoning.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-neutral-400 font-mono pt-1">
            {language === 'en'
              ? 'Calculated using WBGT thermal strain formula & real-time satellite telemetry.'
              : 'WBGT थर्मल स्ट्रेन फॉर्मूला और रियल-टाइम सैटेलाइट डेटा से परिकलित।'}
          </p>
        </div>
      )}
    </div>
  );
};
