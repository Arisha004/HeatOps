import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, RotateCw, Flame, Info } from 'lucide-react';

interface ThermalGlobe3DProps {
  language: 'en' | 'hi';
}

export const ThermalGlobe3D: React.FC<ThermalGlobe3DProps> = ({ language }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTime, setSelectedTime] = useState<'10am' | '1pm' | '4pm'>('1pm');
  const [currentTemp, setCurrentTemp] = useState<number>(43.5);
  const [currentWbgt, setCurrentWbgt] = useState<number>(34.8);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const heatBandMeshRef = useRef<THREE.Mesh | null>(null);

  // Time preset configurations
  const timePresets = {
    '10am': {
      temp: 34.2,
      wbgt: 29.5,
      sunPos: new THREE.Vector3(4, 5, 3),
      heatColor: 0xf59e0b, // Amber
      bandColor: 0xfbbf24,
      intensity: 1.4,
      labelEn: '10:00 AM (Early Surge)',
      labelHi: 'सुबह 10:00 (शुरुआती गर्मी)',
      risk: 'CAUTION',
    },
    '1pm': {
      temp: 44.8,
      wbgt: 35.6,
      sunPos: new THREE.Vector3(0.5, 7, 1.5),
      heatColor: 0xef4444, // Red / Crimson
      bandColor: 0xd97706,
      intensity: 2.4,
      labelEn: '01:00 PM (Peak Solar Radiation)',
      labelHi: 'दोपहर 01:00 (चरम विकिरण)',
      risk: 'CRITICAL NO-GO',
    },
    '4pm': {
      temp: 39.1,
      wbgt: 32.2,
      sunPos: new THREE.Vector3(-4, 4, 3),
      heatColor: 0xf97316, // Orange
      bandColor: 0xea580c,
      intensity: 1.6,
      labelEn: '04:00 PM (Thermal Retention)',
      labelHi: 'शाम 04:00 (ताप संचय)',
      risk: 'HIGH RISK',
    },
  };

  const handleTimeChange = (time: '10am' | '1pm' | '4pm') => {
    setSelectedTime(time);
    const config = timePresets[time];
    setCurrentTemp(config.temp);
    setCurrentWbgt(config.wbgt);

    if (sunLightRef.current && globeMeshRef.current && atmosphereMeshRef.current && heatBandMeshRef.current) {
      sunLightRef.current.position.copy(config.sunPos);
      
      const mat = globeMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.setHex(0x1e293b);
      mat.emissive.setHex(config.heatColor);
      mat.emissiveIntensity = 0.35;

      const atmosMat = atmosphereMeshRef.current.material as THREE.MeshBasicMaterial;
      atmosMat.color.setHex(config.heatColor);

      const bandMat = heatBandMeshRef.current.material as THREE.MeshBasicMaterial;
      bandMat.color.setHex(config.bandColor);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.replaceChildren(renderer.domElement);

    // 3. Globe Mesh (Earth Sphere with wireframe & core)
    const globeGeom = new THREE.SphereGeometry(1.6, 40, 40);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      wireframe: false,
    });
    const globeMesh = new THREE.Mesh(globeGeom, globeMat);
    globeMeshRef.current = globeMesh;
    scene.add(globeMesh);

    // Latitude & Longitude Wire Grid
    const wireGeom = new THREE.SphereGeometry(1.61, 24, 16);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    globeMesh.add(wireMesh);

    // North India 28°N Latitude Thermal Heat Ring
    const bandGeom = new THREE.TorusGeometry(1.58, 0.08, 16, 64);
    const bandMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.85,
    });
    const heatBand = new THREE.Mesh(bandGeom, bandMat);
    heatBand.rotation.x = Math.PI / 2.3;
    heatBand.position.y = 0.52; // Approximate 28°N latitude tilt
    heatBandMeshRef.current = heatBand;
    globeMesh.add(heatBand);

    // Atmosphere Glow Layer
    const atmosGeom = new THREE.SphereGeometry(1.85, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosGeom, atmosMat);
    atmosphereMeshRef.current = atmosphereMesh;
    scene.add(atmosphereMesh);

    // Radiant Solar Heat Particles
    const particleCount = 180;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      scales[i] = Math.random();
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.045,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeom, particleMat);
    particleSystemRef.current = particleSystem;
    scene.add(particleSystem);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    sunLight.position.set(0.5, 7, 1.5);
    sunLightRef.current = sunLight;
    scene.add(sunLight);

    // 5. Mouse Drag Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !globeMeshRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      globeMeshRef.current.rotation.y += deltaX * 0.006;
      globeMeshRef.current.rotation.x += deltaY * 0.006;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !globeMeshRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      globeMeshRef.current.rotation.y += deltaX * 0.006;
      globeMeshRef.current.rotation.x += deltaY * 0.006;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 6. Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      if (globeMeshRef.current && isRotating && !isDragging) {
        globeMeshRef.current.rotation.y += 0.004;
      }

      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y = elapsedTime * 0.03;
        particleSystemRef.current.rotation.x = Math.sin(elapsedTime * 0.2) * 0.05;
      }

      if (atmosphereMeshRef.current) {
        const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.03;
        atmosphereMeshRef.current.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
    };
  }, [isRotating]);

  const activeConfig = timePresets[selectedTime];

  return (
    <div className="relative w-full rounded-2xl bg-neutral-950 border border-neutral-800 text-white overflow-hidden shadow-2xl p-5 space-y-4">
      {/* Top Header & Live Telemetry Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <span>{language === 'en' ? '3D Solar Radiation & Thermal Dome' : '3D सौर विकिरण एवं हीट डोम मॉडल'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 animate-pulse">
                28°N LATITUDE
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              {language === 'en' ? 'Simulating North India Sub-Tropical Heat Accumulation' : 'उत्तरी भारत का वास्तविक 3D सौर विकिरण मॉडल'}
            </p>
          </div>
        </div>

        {/* Orbit Toggle */}
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
            isRotating
              ? 'bg-neutral-900 border-neutral-700 text-amber-400'
              : 'bg-neutral-800 border-neutral-600 text-neutral-300'
          }`}
          title="Toggle Auto-Rotation"
        >
          <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
          <span>{isRotating ? 'Auto-Orbiting' : 'Manual Orbit'}</span>
        </button>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden bg-radial from-neutral-900 via-neutral-950 to-black cursor-grab active:cursor-grabbing">
        <div ref={containerRef} className="w-full h-full" />

        {/* Floating Telemetry HUD Card */}
        <div className="absolute top-3 left-3 bg-neutral-900/85 backdrop-blur-md border border-neutral-700/70 rounded-xl p-3 text-xs space-y-1 shadow-lg pointer-events-none">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] uppercase font-bold">
            <Flame className="w-3 h-3" />
            <span>Thermal Indices</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-200">
            <div>
              <span className="text-[10px] text-neutral-400 block">Ambient Temp</span>
              <span className="text-sm font-bold font-mono text-white">{currentTemp}°C</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block">Calculated WBGT</span>
              <span className="text-sm font-bold font-mono text-amber-400">{currentWbgt}°C</span>
            </div>
          </div>
          <div className="pt-1 border-t border-neutral-800">
            <span
              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded block text-center ${
                activeConfig.risk.includes('CRITICAL')
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : activeConfig.risk.includes('HIGH')
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              {activeConfig.risk}
            </span>
          </div>
        </div>

        {/* Interactive Hint */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-neutral-400 pointer-events-none flex items-center gap-1 border border-neutral-800">
          <span>Click & Drag to Rotate 3D Globe</span>
        </div>
      </div>

      {/* Interactive Time-of-Day Selectors */}
      <div className="space-y-2 relative z-10 pt-1">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="font-semibold">{language === 'en' ? 'Select Solar Exposure Window:' : 'सौर विकिरण समय चुनें:'}</span>
          <span className="text-[11px] font-mono text-amber-400">
            {language === 'en' ? activeConfig.labelEn : activeConfig.labelHi}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['10am', '1pm', '4pm'] as const).map((time) => {
            const isSelected = selectedTime === time;
            const preset = timePresets[time];
            return (
              <button
                key={time}
                onClick={() => handleTimeChange(time)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700'
                }`}
              >
                <span className="block font-mono text-xs">{time.toUpperCase()}</span>
                <span className="text-[10px] opacity-80">{preset.temp}°C Ambient</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
