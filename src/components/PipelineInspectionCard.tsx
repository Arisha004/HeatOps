import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldAlert,
  Thermometer,
  Zap,
  Activity,
  FileText
} from 'lucide-react';
import { PipelineStageLog } from '../types';

interface PipelineInspectionCardProps {
  stages: PipelineStageLog[];
  language: 'en' | 'hi';
}

export const PipelineInspectionCard: React.FC<PipelineInspectionCardProps> = ({
  stages,
  language,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const totalDuration = (stages || []).reduce((acc, s) => acc + s.durationMs, 0);

  const stageIcons = [
    <FileText className="w-4 h-4 text-blue-600" key="1" />,
    <Zap className="w-4 h-4 text-amber-600" key="2" />,
    <Thermometer className="w-4 h-4 text-orange-600" key="3" />,
    <ShieldAlert className="w-4 h-4 text-emerald-600" key="4" />,
    <CheckCircle2 className="w-4 h-4 text-purple-600" key="5" />,
    <Sparkles className="w-4 h-4 text-pink-600" key="6" />,
  ];

  return (
    <div id="pipeline-inspection-card" className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                {language === 'en' ? '6-Stage Multi-Agent Safety Pipeline' : '6-चरणीय मल्टी-एजेंट सुरक्षा पाइपलाइन'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-extrabold font-mono uppercase">
                {totalDuration}ms TOTAL
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              {language === 'en'
                ? 'Deterministic telemetry ingestion, ISO 7243 physics calculations, and safety verification trail'
                : 'माइक्रोक्लाइमेट डेटा अंतर्ग्रहण, थर्मल भौतिकी गणना एवं सत्यापन प्रक्रिया'}
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-pipeline-details"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
        >
          <span>{isExpanded ? (language === 'en' ? 'Collapse Stages' : 'संक्षिप्त करें') : (language === 'en' ? 'Inspect 6 Agents' : '6 एजेंट देखें')}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Fast Horizontal Progress Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {(stages || []).map((stage, idx) => (
          <div
            key={stage.stageNumber}
            className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1 text-left relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-neutral-500">STG 0{stage.stageNumber}</span>
              <span className="text-[10px] font-mono font-semibold text-neutral-600">{stage.durationMs}ms</span>
            </div>
            <div className="flex items-center gap-1.5">
              {stageIcons[idx] || <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span className="text-xs font-bold text-neutral-900 truncate">{stage.name}</span>
            </div>
            <div className="w-full bg-emerald-100 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Detailed Audit Log */}
      {isExpanded && (
        <div className="pt-3 border-t border-neutral-100 space-y-3 animate-fadeIn">
          {(stages || []).map((stage, idx) => (
            <div
              key={stage.stageNumber}
              className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    Stage {stage.stageNumber}: {stage.name}
                  </span>
                  <span className="text-neutral-500 font-medium">({stage.agentRole})</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                  <span>•</span>
                  <span>{stage.durationMs}ms</span>
                </div>
              </div>

              <p className="text-neutral-700 font-medium pl-1">
                {stage.details}
              </p>

              <div className="bg-white p-2 rounded-lg border border-neutral-200 text-[11px] text-neutral-900 font-mono flex items-center justify-between">
                <span className="text-neutral-500">Output:</span>
                <span className="font-semibold">{stage.outputSummary}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
