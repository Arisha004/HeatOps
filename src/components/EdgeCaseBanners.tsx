import React from 'react';
import { WifiOff, RefreshCw, AlertOctagon, FileWarning, HelpCircle } from 'lucide-react';

interface EdgeCaseBannersProps {
  isOffline: boolean;
  onRetryConnection: () => void;
  isPartialData: boolean;
  isLowConfidence: boolean;
  hasSensorSpike?: boolean;
  language: 'en' | 'hi';
}

export const EdgeCaseBanners: React.FC<EdgeCaseBannersProps> = ({
  isOffline,
  onRetryConnection,
  isPartialData,
  isLowConfidence,
  hasSensorSpike = false,
  language,
}) => {
  return (
    <div className="space-y-2">
      {/* 1. Offline / No Internet Connection Lost Banner */}
      {isOffline && (
        <div id="banner-offline" className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold block">
                {language === 'en' ? 'Connection Lost — Showing Offline Cached Risk Data' : 'कनेक्शन बंद — सहेजा गया डेटा दिखाया जा रहा है'}
              </span>
              <span className="text-[11px] text-amber-800">
                {language === 'en'
                  ? 'Last updated today at 07:15 AM. On-site decisions remain active.'
                  : 'अंतिम अपडेट आज सुबह 07:15 बजे हुआ था।'}
              </span>
            </div>
          </div>

          <button
            id="btn-retry-offline"
            onClick={onRetryConnection}
            className="px-3 py-1.5 rounded-lg bg-amber-900 text-white font-semibold text-xs hover:bg-amber-800 transition-colors shrink-0 flex items-center gap-1 min-h-[36px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Retry' : 'पुनः प्रयास'}</span>
          </button>
        </div>
      )}

      {/* 2. Partial-Day / Stale Weather Data Banner */}
      {isPartialData && (
        <div id="banner-partial-data" className="p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs flex items-center gap-2.5">
          <FileWarning className="w-4 h-4 text-neutral-600 shrink-0" />
          <div>
            <span className="font-bold">
              {language === 'en' ? 'Partial Satellite Feed' : 'अधूरा सैटेलाइट फीड'}:
            </span>{' '}
            {language === 'en'
              ? 'Live weather sensor feed interrupted after 1:00 PM. Afternoon hours marked UNKNOWN — verify locally.'
              : 'दोपहर 1:00 बजे के बाद का डेटा अप्राप्त है। दोपहर के घंटों की जांच साइट पर करें।'}
          </div>
        </div>
      )}

      {/* 3. Low Confidence Model Warning */}
      {isLowConfidence && !isOffline && (
        <div id="banner-low-confidence" className="p-3 rounded-xl bg-neutral-900 text-white text-xs flex items-center gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-amber-300">
              {language === 'en' ? 'High Meteorological Flux' : 'मौसम में तेज़ी से बदलाव'}:
            </span>{' '}
            {language === 'en'
              ? 'Model confidence moderate for afternoon windows. Increase on-site WBGT reading frequency.'
              : 'मॉडल विश्वसनीयता मध्यम है। साइट पर थर्मामीटर जांच बढ़ाएँ।'}
          </div>
        </div>
      )}

      {/* 4. Extreme Sensor Spike Flag */}
      {hasSensorSpike && (
        <div id="banner-sensor-spike" className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-2.5">
          <AlertOctagon className="w-4 h-4 text-red-700 shrink-0" />
          <div>
            <span className="font-bold">
              {language === 'en' ? 'Extreme Microclimate Thermal Spike Flagged' : 'अत्यधिक तापमान वृद्धि दर्ज'}
            </span>
            <p className="text-[11px] mt-0.5">
              {language === 'en'
                ? 'Local ambient sensor registered a +4.2°C thermal surge at 12:30 PM (Roofing asphalt heat reflection). Unaveraged for safety transparency.'
                : 'लोकल सेंसर में अचानक +4.2°C तापमान वृद्धि दर्ज हुई।'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
