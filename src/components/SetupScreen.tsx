import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Flame,
  ArrowRight,
  AlertCircle,
  Check,
  Sparkles,
  Loader2,
  Users,
  Sun,
  Droplets,
  ShieldCheck,
  Umbrella
} from 'lucide-react';
import { ActivityType, SiteConfig } from '../types';
import { ACTIVITY_TYPES, POPULAR_INDIAN_LOCATIONS, PRESET_SITES } from '../constants';

interface SetupScreenProps {
  onSubmit: (config: SiteConfig) => void;
  language: 'en' | 'hi';
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onSubmit, language }) => {
  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState('Dharavi Leather & Garment Cluster, Mumbai');
  const [activityType, setActivityType] = useState<ActivityType>('Heavy Construction & Excavation');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('18:00');
  const [thresholdTemp, setThresholdTemp] = useState<number>(35);
  const [headcount, setHeadcount] = useState<number>(30);
  const [acclimatized, setAcclimatized] = useState<boolean>(true);
  const [shadeAvailable, setShadeAvailable] = useState<boolean>(false);
  const [waterAvailable, setWaterAvailable] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [liveGeoResults, setLiveGeoResults] = useState<string[]>([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);

  // Debounced live geocoding search
  useEffect(() => {
    if (!location || location.length < 2) {
      setLiveGeoResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingGeo(true);
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(location)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setLiveGeoResults(data.results.map((r: any) => r.formatted));
          } else {
            setLiveGeoResults([]);
          }
        }
      } catch (err) {
        console.warn('Geocoding lookup notice:', err);
      } finally {
        setIsSearchingGeo(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [location]);

  const presetFiltered = POPULAR_INDIAN_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(location.toLowerCase())
  );

  const combinedSuggestions = Array.from(new Set([...liveGeoResults, ...presetFiltered])).slice(0, 6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation edge case handling
    if (!location || location.trim().length < 3) {
      setValidationError(
        language === 'en'
          ? "We couldn't verify that location. Please select or enter a valid landmark or district name (e.g., 'Dharavi, Mumbai')."
          : "स्थान सत्यापित नहीं हो सका। कृपया एक वैध स्थल या जिला चुनें।"
      );
      return;
    }

    if (thresholdTemp < 25 || thresholdTemp > 50) {
      setValidationError(
        language === 'en'
          ? "Threshold temperature must be between 25°C and 50°C."
          : "तापमान सीमा 25°C और 50°C के बीच होनी चाहिए।"
      );
      return;
    }

    onSubmit({
      siteName: siteName.trim() || `${location.split(',')[0]} (${activityType.split(' ')[0]})`,
      location: location.trim(),
      activityType,
      startTime,
      endTime,
      thresholdTemp,
      headcount,
      acclimatized,
      shadeAvailable,
      waterAvailable,
    });
  };

  const loadPreset = (preset: typeof PRESET_SITES[0]) => {
    setSiteName(preset.siteName);
    setLocation(preset.location);
    setActivityType(preset.activityType);
    setStartTime(preset.startTime);
    setEndTime(preset.endTime);
    setThresholdTemp(preset.thresholdTemp);
    if (preset.headcount) setHeadcount(preset.headcount);
    if (preset.acclimatized !== undefined) setAcclimatized(preset.acclimatized);
    if (preset.shadeAvailable !== undefined) setShadeAvailable(preset.shadeAvailable);
    if (preset.waterAvailable !== undefined) setWaterAvailable(preset.waterAvailable);
    setValidationError(null);
  };

  return (
    <div id="setup-screen-container" className="max-w-xl mx-auto py-4 px-4 space-y-6">
      {/* Title & Microcopy */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100/70 text-orange-950 text-xs font-semibold border border-orange-200">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          {language === 'en' ? 'FortyGuard Hyperlocal & ISO 7243 WBGT Engine' : 'FortyGuard माइक्रोक्लाइमेट और WBGT इंजन'}
        </div>
        <h2 id="setup-title" className="text-2xl font-bold text-neutral-900 tracking-tight">
          {language === 'en' ? 'Setup Today’s Site Shift' : 'आज की कार्य साइट सेटअप करें'}
        </h2>
        <p className="text-sm text-neutral-600">
          {language === 'en'
            ? 'Hyperlocal urban heat island delta analysis, crew metabolic offset, and automated Go / Adjust / No-Go decision.'
            : 'हीट-स्ट्रोक जोखिम पूर्वानुमान और ब्रेक समय के लिए साइट का विवरण दर्ज करें।'}
        </p>
      </div>

      {/* Quick 1-Tap Presets */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          {language === 'en' ? 'Quick Indian Site Templates (Demo Anchors)' : 'त्वरित भारतीय साइट टेम्पलेट्स'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_SITES.map((preset, idx) => (
            <button
              key={idx}
              id={`btn-preset-${idx}`}
              type="button"
              onClick={() => loadPreset(preset)}
              className="text-left p-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50/80 transition-all text-xs cursor-pointer shadow-2xs"
            >
              <div className="font-semibold text-neutral-900 truncate">{preset.siteName}</div>
              <div className="text-neutral-500 text-[11px] truncate">{preset.location}</div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-600 pt-1 border-t border-neutral-100">
                <span className="truncate">{preset.activityType.split(' ')[0]}</span>
                <span className="font-semibold text-orange-700 font-mono">Crew: {preset.headcount || 30}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Validation Error Banner (Edge Case) */}
      {validationError && (
        <div
          id="setup-validation-error"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">{language === 'en' ? 'Location Error' : 'स्थान त्रुटि'}:</span>
            <p>{validationError}</p>
          </div>
        </div>
      )}

      {/* Main Setup Form */}
      <form id="setup-form" onSubmit={handleSubmit} className="space-y-5 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        {/* Site Name (Optional custom alias) */}
        <div className="space-y-1.5">
          <label htmlFor="input-site-name" className="block text-xs font-semibold text-neutral-700">
            {language === 'en' ? 'Site / Project Name (Optional)' : 'साइट का नाम (वैकल्पिक)'}
          </label>
          <input
            id="input-site-name"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder={language === 'en' ? 'e.g., Dharavi Metro Station Pier Pour #4' : 'उदा., मेट्रो पियर निर्माण'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm focus:bg-white focus:border-neutral-900 focus:outline-none transition-all min-h-[44px]"
          />
        </div>

        {/* Location search & autocomplete */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <label htmlFor="input-location" className="block text-xs font-semibold text-neutral-700">
              {language === 'en' ? 'Site Location (Hyperlocal 500m Box)' : 'साइट स्थान (500m क्षेत्र)'} <span className="text-red-500">*</span>
            </label>
            {isSearchingGeo && (
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                <span>Geocoding...</span>
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              id="input-location"
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationSuggestions(true);
                setValidationError(null);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              placeholder={language === 'en' ? 'Search city, landmark, or industrial area' : 'शहर या औद्योगिक क्षेत्र खोजें'}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-sm focus:bg-white focus:border-neutral-900 focus:outline-none transition-all min-h-[44px]"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showLocationSuggestions && combinedSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
              {combinedSuggestions.map((loc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setLocation(loc);
                    setShowLocationSuggestions(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-neutral-800 hover:bg-neutral-100 flex items-center gap-2 border-b border-neutral-100 last:border-0 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{loc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Activity Type Selectable Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-700">
            {language === 'en' ? 'Select Outdoor Activity Type' : 'आउटडोर कार्य प्रकार चुनें'} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACTIVITY_TYPES.map((act) => {
              const isSelected = activityType === act;
              return (
                <button
                  key={act}
                  id={`chip-activity-${act.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => setActivityType(act)}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex flex-col justify-between min-h-[64px] cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-neutral-50/50 text-neutral-800 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs">{act}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Crew Size & Shift Window */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Headcount Input */}
          <div className="space-y-1.5">
            <label htmlFor="input-headcount" className="block text-xs font-semibold text-neutral-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-neutral-500" />
              <span>{language === 'en' ? 'Crew Headcount' : 'श्रमिक संख्या'}</span>
            </label>
            <input
              id="input-headcount"
              type="number"
              min={1}
              max={500}
              value={headcount}
              onChange={(e) => setHeadcount(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-xs font-bold font-mono focus:bg-white focus:border-neutral-900 focus:outline-none min-h-[44px]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-start-time" className="block text-xs font-semibold text-neutral-700">
              {language === 'en' ? 'Shift Start Time' : 'शिफ्ट शुरू का समय'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Clock className="w-4 h-4" />
              </div>
              <input
                id="input-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-xs font-medium focus:bg-white focus:border-neutral-900 focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-end-time" className="block text-xs font-semibold text-neutral-700">
              {language === 'en' ? 'Shift End Time' : 'शिफ्ट अंत का समय'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Clock className="w-4 h-4" />
              </div>
              <input
                id="input-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-neutral-900 text-xs font-medium focus:bg-white focus:border-neutral-900 focus:outline-none min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Physiological & Safety Toggles: Acclimatization, Shade, Water */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
            {language === 'en' ? 'Site Infrastructure & Physiology' : 'साइट बुनियादी ढांचा और कार्यबल'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Acclimatization Toggle */}
            <button
              type="button"
              onClick={() => setAcclimatized(!acclimatized)}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                acclimatized
                  ? 'bg-white border-emerald-300 text-neutral-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {acclimatized ? 'Acclimatized' : 'Unacclimatized'}
                </span>
                <span className="text-[10px] font-mono">{acclimatized ? '0°C' : '-1.5°C'}</span>
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                {acclimatized ? '>14 days local exposure' : 'New/migrant crew'}
              </span>
            </button>

            {/* Shade Availability Toggle */}
            <button
              type="button"
              onClick={() => setShadeAvailable(!shadeAvailable)}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                shadeAvailable
                  ? 'bg-white border-emerald-300 text-neutral-900'
                  : 'bg-orange-50/80 border-orange-200 text-orange-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1">
                  <Umbrella className="w-3.5 h-3.5 text-blue-600" />
                  {shadeAvailable ? 'UV Shade' : 'Direct Sun'}
                </span>
                <span className="text-[10px] font-mono">{shadeAvailable ? '0°C' : '+2.0°C'}</span>
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                {shadeAvailable ? 'Shaded rest shelter' : 'Unshaded exposure'}
              </span>
            </button>

            {/* Water Availability Toggle */}
            <button
              type="button"
              onClick={() => setWaterAvailable(!waterAvailable)}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                waterAvailable
                  ? 'bg-white border-emerald-300 text-neutral-900'
                  : 'bg-red-50/80 border-red-200 text-red-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  {waterAvailable ? 'Chilled Water' : 'Limited Water'}
                </span>
                <span className="text-[10px] font-mono">{waterAvailable ? '0°C' : '-1.0°C'}</span>
              </div>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                {waterAvailable ? '<18°C potable water' : 'Restricted hydration'}
              </span>
            </button>
          </div>
        </div>

        {/* Threshold Temperature Numeric Input with quick controls */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
          <div className="flex items-center justify-between">
            <label htmlFor="input-threshold-temp" className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>{language === 'en' ? 'Safety Temperature Limit' : 'सुरक्षा तापमान सीमा'}</span>
            </label>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
              {thresholdTemp}°C WBGT / Heat Index
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              id="btn-temp-minus"
              type="button"
              onClick={() => setThresholdTemp((t) => Math.max(28, t - 1))}
              className="w-10 h-10 rounded-lg bg-white border border-neutral-200 text-neutral-800 font-bold text-base hover:bg-neutral-100 flex items-center justify-center min-w-[40px] min-h-[40px] cursor-pointer"
            >
              -
            </button>
            <input
              id="input-threshold-temp"
              type="number"
              value={thresholdTemp}
              onChange={(e) => setThresholdTemp(Number(e.target.value))}
              className="w-full text-center py-2 rounded-lg border border-neutral-200 bg-white font-bold text-base text-neutral-900 focus:outline-none min-h-[40px]"
            />
            <button
              id="btn-temp-plus"
              type="button"
              onClick={() => setThresholdTemp((t) => Math.min(48, t + 1))}
              className="w-10 h-10 rounded-lg bg-white border border-neutral-200 text-neutral-800 font-bold text-base hover:bg-neutral-100 flex items-center justify-center min-w-[40px] min-h-[40px] cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Primary Action CTA */}
        <button
          id="btn-analyze-today"
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] min-h-[48px] cursor-pointer"
        >
          <span>{language === 'en' ? 'Run 6-Stage FortyGuard HeatOps Pipeline' : '6-चरणीय FortyGuard हीट विश्लेषण चलाएं'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
