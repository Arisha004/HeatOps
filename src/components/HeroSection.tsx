"use client";

import { Globe } from "@/components/ui/globe";

interface HeroSectionProps {
  onLaunchTool?: () => void;
  onSelectPresetDemo?: (presetIndex: number) => void;
}

export function HeroSection({
  onLaunchTool,
  onSelectPresetDemo,
}: HeroSectionProps) {
  const presets = [
    "Noida Sector 62 (Concrete)",
    "Jaipur Sitapura Industrial Area (Asphalt)",
    "Gurgaon Cyber City (Roofing)",
    "Lucknow Gomti Nagar Extension (Material)",
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white px-4 pb-16 pt-10 sm:px-6 sm:pt-14 md:pb-24 md:pt-16 lg:pb-32">
      {/* Globe background layer — subtle, professional, 3D */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden opacity-85 sm:opacity-90 md:opacity-100 z-0">
        <Globe className="top-0 sm:-top-2 md:-top-6 scale-100 sm:scale-110 md:scale-120" />
      </div>

      {/* Soft radial fade so globe doesn't compete with text */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.55)_50%,rgba(255,255,255,0.98)_85%)] z-[1]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-black px-4 py-1.5 text-xs font-medium sm:text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-green-400">LIVE TELEMETRY:</span>
          <span className="text-white">
            North India Sub-Tropical Heat Grid Active (28.6°N)
          </span>
        </div>

        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl lg:text-6xl">
          Autonomous Heat Stroke{" "}
          <span className="text-orange-600">Risk Management</span> for
          High-Exertion Crews
        </h1>

        <p className="mt-5 max-w-2xl text-sm text-neutral-600 sm:text-base md:mt-6 md:text-lg">
          North Indian ambient heat regularly breaches 42°C with lethal
          wet-bulb humidity. HeatOps automates ISO 7243 WBGT thermal
          calculations, identifies exact work-pause windows, and dispatches
          1-tap bilingual SMS alerts to site supervisors.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <button
            id="btn-hero-launch-evaluator"
            onClick={onLaunchTool}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto sm:text-base cursor-pointer"
          >
            Launch Site Evaluator
            <span aria-hidden>→</span>
          </button>
          <button
            id="btn-hero-demo-noida"
            onClick={() => onSelectPresetDemo?.(0)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 sm:w-auto sm:text-base cursor-pointer"
          >
            <span aria-hidden className="text-orange-500">▶</span>
            Load Live Demo Site (Noida)
          </button>
        </div>

        <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
          <span className="mr-1 text-neutral-500">Quick Presets:</span>
          {presets.map((preset, index) => (
            <button
              key={preset}
              onClick={() => onSelectPresetDemo?.(index)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-neutral-700 transition hover:border-orange-400 hover:text-orange-600 cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
