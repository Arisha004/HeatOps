"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLOBE_CONFIG: any = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 4.5,
  baseColor: [0.3, 0.38, 0.48], // Clear high-contrast slate dots visible on white bg
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [0.92, 0.95, 1],
  markers: [
    { location: [28.6139, 77.209], size: 0.1 }, // Noida / Delhi
    { location: [19.076, 72.8777], size: 0.09 }, // Mumbai
    { location: [26.9124, 75.7873], size: 0.08 }, // Jaipur
    { location: [26.8467, 80.9462], size: 0.08 }, // Lucknow
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.08 },
    { location: [19.4326, -99.1332], size: 0.08 },
    { location: [40.7128, -74.006], size: 0.08 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: any;
}) {
  let phi = 0;
  let width = 600;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<any>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  const updatePointerInteraction = (value: any) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: any) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setR(delta / 200);
    }
  };

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.004;
      state.phi = phi + r;
      state.width = (width || 600) * 2;
      state.height = (width || 600) * 2;
    },
    [r]
  );

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth || canvasRef.current.parentElement?.offsetWidth || 600;
    }
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe: any = null;
    try {
      const renderWidth = (canvas.offsetWidth || canvas.parentElement?.offsetWidth || 600) * 2;
      canvas.width = renderWidth;
      canvas.height = renderWidth;

      globe = createGlobe(canvas, {
        ...config,
        width: renderWidth,
        height: renderWidth,
        onRender,
      } as any);

      canvas.style.opacity = "1";
    } catch (e) {
      console.warn("Globe initialization notice:", e);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (globe && typeof globe.destroy === "function") {
        globe.destroy();
      }
    };
  }, [config, onRender]);

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px] flex items-center justify-center pointer-events-auto",
        className
      )}
    >
      <canvas
        className={cn(
          "w-full h-full opacity-100 transition-opacity duration-300 [contain:layout_paint_size] cursor-grab active:cursor-grabbing"
        )}
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "600px",
          aspectRatio: "1/1",
        }}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}

export function GlobeDemo() {
  return (
    <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg bg-transparent px-4 pb-20 pt-4">
      <Globe className="top-0" />
    </div>
  );
}
