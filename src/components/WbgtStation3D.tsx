import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Gauge, Shield, Droplets, Sun, Wind, Sparkles, Zap, ArrowRight } from 'lucide-react';

interface WbgtStation3DProps {
}

export const WbgtStation3D: React.FC<WbgtStation3DProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSensor, setActiveSensor] = useState<'globe' | 'wet' | 'dry' | 'wind'>('globe');

  const stationGroupRef = useRef<THREE.Group | null>(null);
  const anemometerCupsRef = useRef<THREE.Group | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const wetBulbMeshRef = useRef<THREE.Mesh | null>(null);
  const reservoirMeshRef = useRef<THREE.Mesh | null>(null);
  const louverGroupRef = useRef<THREE.Group | null>(null);
  const spotLightRef = useRef<THREE.SpotLight | null>(null);
  const beaconRingRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(-0.9, 1.35, 1.8));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(-0.6, 1.15, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(-0.6, 1.15, 0));
  const activeSensorRef = useRef<'globe' | 'wet' | 'dry' | 'wind'>('globe');

  activeSensorRef.current = activeSensor;

  const sensorDescriptions = {
    globe: {
      titleEn: 'Black Globe Thermometer (Tg)',
      formulaWeight: '20% Radiant Weight',
      descEn: '150mm matte black copper globe absorbing direct solar radiation and infrared thermal reflectance from tarmac/concrete.',
      reading: '51.4°C Radiant Temp',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      badge: 'SOLAR RADIATION',
      camPos: new THREE.Vector3(-1.0, 1.35, 1.6),
      lookAt: new THREE.Vector3(-0.6, 1.15, 0),
      lightPos: new THREE.Vector3(-0.6, 2.0, 1.0),
      ringPos: new THREE.Vector3(-0.6, 0.85, 0),
      ringColor: 0xef4444,
    },
    wet: {
      titleEn: 'Natural Wet Bulb Sensor (Twb)',
      formulaWeight: '70% Primary Weight (Evaporative)',
      descEn: 'Cotton wick dipped in distilled water measuring evaporative cooling efficiency. High humidity stops sweat evaporation, spiking heat stroke risk.',
      reading: '31.8°C Wet Bulb',
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      badge: 'HUMIDITY & EVAPORATION',
      camPos: new THREE.Vector3(0.4, 1.25, 1.4),
      lookAt: new THREE.Vector3(0.2, 0.95, 0),
      lightPos: new THREE.Vector3(0.2, 2.0, 1.0),
      ringPos: new THREE.Vector3(0.2, 0.65, 0),
      ringColor: 0x0284c7,
    },
    dry: {
      titleEn: 'Shielded Dry Bulb Temp (Ta)',
      formulaWeight: '10% Ambient Weight',
      descEn: 'Louvered multi-plate radiation-shielded ambient air temperature isolated from direct sun rays.',
      reading: '42.0°C Shade Air',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      badge: 'SHADE TEMPERATURE',
      camPos: new THREE.Vector3(1.1, 1.35, 1.5),
      lookAt: new THREE.Vector3(0.65, 1.15, 0),
      lightPos: new THREE.Vector3(0.65, 2.0, 1.0),
      ringPos: new THREE.Vector3(0.65, 0.85, 0),
      ringColor: 0xf59e0b,
    },
    wind: {
      titleEn: 'Ultrasonic Anemometer & Wind Cups',
      formulaWeight: 'Convective Heat Dissipation',
      descEn: 'Measures site wind velocity. Stagnant hot air (<3 km/h) creates immediate dangerous heat traps on deep urban excavations.',
      reading: '4.2 km/h Wind Velocity',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badge: 'CONVECTIVE AIRFLOW',
      camPos: new THREE.Vector3(0, 1.7, 1.5),
      lookAt: new THREE.Vector3(0, 1.4, 0),
      lightPos: new THREE.Vector3(0, 2.3, 1.0),
      ringPos: new THREE.Vector3(0, 1.25, 0),
      ringColor: 0x10b981,
    },
  };

  // Switch sensor with smooth 3D camera focal change
  const handleSelectSensor = (sensorKey: 'globe' | 'wet' | 'dry' | 'wind') => {
    setActiveSensor(sensorKey);
    const targetConfig = sensorDescriptions[sensorKey];
    targetCamPosRef.current.copy(targetConfig.camPos);
    targetLookAtRef.current.copy(targetConfig.lookAt);

    if (spotLightRef.current) {
      spotLightRef.current.position.copy(targetConfig.lightPos);
      spotLightRef.current.target.position.copy(targetConfig.lookAt);
      spotLightRef.current.color.setHex(targetConfig.ringColor);
    }

    if (beaconRingRef.current) {
      beaconRingRef.current.position.copy(targetConfig.ringPos);
      (beaconRingRef.current.material as THREE.MeshBasicMaterial).color.setHex(targetConfig.ringColor);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(-1.0, 1.35, 1.6);
    camera.lookAt(-0.6, 1.15, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);

    // 3. Station Model Assembly
    const stationGroup = new THREE.Group();
    stationGroupRef.current = stationGroup;
    scene.add(stationGroup);

    // Tripod / Base Mast
    const mastGeom = new THREE.CylinderGeometry(0.035, 0.045, 2.4, 16);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const mast = new THREE.Mesh(mastGeom, mastMat);
    mast.position.y = 0;
    mast.castShadow = true;
    stationGroup.add(mast);

    // Tripod legs
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const legGeom = new THREE.CylinderGeometry(0.02, 0.025, 1.2, 12);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
      const leg = new THREE.Mesh(legGeom, legMat);
      leg.position.set(Math.cos(angle) * 0.4, -0.7, Math.sin(angle) * 0.4);
      leg.rotation.z = Math.cos(angle) * 0.4;
      leg.rotation.x = Math.sin(angle) * -0.4;
      leg.castShadow = true;
      stationGroup.add(leg);
    }

    // Crossbar for Sensors
    const crossbarGeom = new THREE.CylinderGeometry(0.025, 0.025, 1.5, 16);
    const crossbar = new THREE.Mesh(crossbarGeom, mastMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.y = 0.9;
    crossbar.castShadow = true;
    stationGroup.add(crossbar);

    // Sensor 1: Black Globe Thermometer (Left)
    const globeGeom = new THREE.SphereGeometry(0.24, 32, 32);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.15,
      emissive: 0xd97706,
      emissiveIntensity: 0.3,
    });
    const blackGlobe = new THREE.Mesh(globeGeom, globeMat);
    blackGlobe.position.set(-0.6, 1.15, 0);
    blackGlobe.castShadow = true;
    globeMeshRef.current = blackGlobe;
    stationGroup.add(blackGlobe);

    // Globe mount rod
    const globeRodGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8);
    const globeRod = new THREE.Mesh(globeRodGeom, mastMat);
    globeRod.position.set(-0.6, 0.95, 0);
    stationGroup.add(globeRod);

    // Sensor 2: Wet Bulb Thermometer (Center-Right)
    const wetBulbGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.32, 16);
    const wetBulbMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x0369a1,
      emissiveIntensity: 0.25,
    });
    const wetBulb = new THREE.Mesh(wetBulbGeom, wetBulbMat);
    wetBulb.position.set(0.2, 1.1, 0);
    wetBulb.castShadow = true;
    wetBulbMeshRef.current = wetBulb;
    stationGroup.add(wetBulb);

    // Wet bulb water reservoir bottle
    const reservoirGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.2, 16);
    const reservoirMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      transmission: 0.7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
    });
    const reservoir = new THREE.Mesh(reservoirGeom, reservoirMat);
    reservoir.position.set(0.2, 0.82, 0);
    reservoirMeshRef.current = reservoir;
    stationGroup.add(reservoir);

    // Sensor 3: Dry Bulb Shielded Louver (Right)
    const louverGroup = new THREE.Group();
    louverGroup.position.set(0.65, 1.05, 0);
    louverGroupRef.current = louverGroup;
    for (let i = 0; i < 5; i++) {
      const discGeom = new THREE.CylinderGeometry(0.11 - i * 0.008, 0.12 - i * 0.008, 0.025, 16);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.2,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.1,
      });
      const disc = new THREE.Mesh(discGeom, discMat);
      disc.position.y = i * 0.055;
      disc.castShadow = true;
      louverGroup.add(disc);
    }
    stationGroup.add(louverGroup);

    // Sensor 4: Anemometer Wind Cups on Top
    const anemometerGroup = new THREE.Group();
    anemometerGroup.position.set(0, 1.35, 0);
    anemometerCupsRef.current = anemometerGroup;
    stationGroup.add(anemometerGroup);

    const cupCenterGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.12, 12);
    const cupCenter = new THREE.Mesh(cupCenterGeom, mastMat);
    anemometerGroup.add(cupCenter);

    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const armGeom = new THREE.CylinderGeometry(0.007, 0.007, 0.22, 8);
      const arm = new THREE.Mesh(armGeom, mastMat);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = angle;
      arm.position.set(Math.cos(angle) * 0.11, 0.04, Math.sin(angle) * 0.11);
      anemometerGroup.add(arm);

      // Semi-sphere cup
      const cupGeom = new THREE.SphereGeometry(0.04, 12, 12, 0, Math.PI);
      const cupMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.2,
        metalness: 0.3,
        emissive: 0x10b981,
        emissiveIntensity: 0.15,
      });
      const cup = new THREE.Mesh(cupGeom, cupMat);
      cup.position.set(Math.cos(angle) * 0.22, 0.04, Math.sin(angle) * 0.22);
      cup.rotation.y = angle + Math.PI / 2;
      anemometerGroup.add(cup);
    }

    // Dynamic 3D Focus Beacon Ring below selected sensor
    const ringGeom = new THREE.RingGeometry(0.18, 0.22, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const beaconRing = new THREE.Mesh(ringGeom, ringMat);
    beaconRing.rotation.x = Math.PI / 2;
    beaconRing.position.set(-0.6, 0.85, 0);
    beaconRingRef.current = beaconRing;
    stationGroup.add(beaconRing);

    // Floating micro-particles
    const particleCount = 60;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 2.0;
      particlePositions[i + 1] = 0.6 + Math.random() * 1.2;
      particlePositions[i + 2] = (Math.random() - 0.5) * 1.5;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.025,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    particlesRef.current = particles;
    stationGroup.add(particles);

    // Lights & Dynamic Spotlight
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const spotLight = new THREE.SpotLight(0xef4444, 4.0, 5, Math.PI / 4, 0.4);
    spotLight.position.set(-0.6, 2.2, 1.0);
    spotLight.target = blackGlobe;
    scene.add(spotLight);
    scene.add(spotLight.target);
    spotLightRef.current = spotLight;

    // Interactive Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !stationGroupRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      stationGroupRef.current.rotation.y += deltaX * 0.008;
      prevMouseX = e.clientX;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !stationGroupRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      stationGroupRef.current.rotation.y += deltaX * 0.008;
      prevMouseX = e.touches[0].clientX;
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

    // Animation Loop with Smooth Camera Lerp
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth camera interpolation towards target
      if (cameraRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.06);
        currentLookAtRef.current.lerp(targetLookAtRef.current, 0.06);
        camera.lookAt(currentLookAtRef.current);
      }

      // Wind cups spinning (spins faster if wind is selected)
      if (anemometerCupsRef.current) {
        const spinSpeed = activeSensorRef.current === 'wind' ? 0.12 : 0.035;
        anemometerCupsRef.current.rotation.y += spinSpeed;
      }

      // Beacon ring pulsating animation
      if (beaconRingRef.current) {
        const ringScale = 1.0 + Math.sin(elapsedTime * 4) * 0.15;
        beaconRingRef.current.scale.set(ringScale, ringScale, 1.0);
        (beaconRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(elapsedTime * 4) * 0.3;
      }

      // Active sensor glow pulses
      if (globeMeshRef.current) {
        const mat = globeMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = activeSensorRef.current === 'globe'
          ? 0.45 + Math.sin(elapsedTime * 3) * 0.25
          : 0.1;
      }

      if (wetBulbMeshRef.current) {
        const mat = wetBulbMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = activeSensorRef.current === 'wet'
          ? 0.5 + Math.sin(elapsedTime * 3) * 0.25
          : 0.1;
      }

      if (particlesRef.current) {
        const posAttr = particlesRef.current.geometry.attributes.position;
        for (let i = 1; i < posAttr.count * 3; i += 3) {
          posAttr.array[i] += 0.003;
          if (posAttr.array[i] > 1.8) {
            posAttr.array[i] = 0.6;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

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
  }, []);

  const activeSensorData = sensorDescriptions[activeSensor];

  return (
    <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span>3D WBGT Physical Sensor Mast</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                ISO 7243 STANDARD
              </span>
            </h3>
            <p className="text-xs text-neutral-500">
              Interactive Wet Bulb Globe Telemetry Station
            </p>
          </div>
        </div>

        {/* Real ISO Formula Badge */}
        <div className="px-3 py-1 bg-amber-50 rounded-lg border border-amber-200 text-[11px] font-mono font-bold text-amber-900">
          WBGT = 0.7 Twb + 0.2 Tg + 0.1 Ta
        </div>
      </div>

      {/* 3D Canvas + Interactive Sensor Selector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* 3D Canvas */}
        <div className="md:col-span-7 h-[270px] sm:h-[300px] bg-neutral-950 rounded-xl border border-neutral-800 relative overflow-hidden cursor-grab active:cursor-grabbing">
          <div ref={containerRef} className="w-full h-full" />
          
          {/* Active 3D Focus HUD Indicator */}
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono text-neutral-300 border border-neutral-700 flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-400 font-bold">3D FOCUS:</span>
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeSensorData.badge}</span>
          </div>

          {/* Quick On-Canvas Sensor Pills */}
          <div className="absolute top-2 right-2 flex flex-wrap justify-end gap-1 z-10 max-w-[200px] sm:max-w-none">
            {(['globe', 'wet', 'dry', 'wind'] as const).map((k) => {
              const isCurr = activeSensor === k;
              const labels = {
                globe: 'Globe (Tg)',
                wet: 'Wet (Tnwb)',
                dry: 'Dry (Ta)',
                wind: 'Wind (v)'
              };
              return (
                <button
                  key={k}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectSensor(k);
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold transition-all cursor-pointer border ${
                    isCurr
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-xs scale-105'
                      : 'bg-black/70 hover:bg-black text-neutral-300 border-neutral-700 hover:text-white'
                  }`}
                >
                  {labels[k]}
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-neutral-400 border border-neutral-700 z-10 pointer-events-none">
            Drag to Rotate • Click Sensors to Zoom
          </div>
        </div>

        {/* Sensor Breakdown & Interactive Selector */}
        <div className="md:col-span-5 space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleSelectSensor('globe')}
              className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                activeSensor === 'globe'
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-[1.01]'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sun className={`w-3.5 h-3.5 ${activeSensor === 'globe' ? 'text-amber-400' : 'text-neutral-500'}`} />
                <span className="truncate">Black Globe (Tg)</span>
              </div>
              <span className={`text-[10px] font-mono block ${activeSensor === 'globe' ? 'text-amber-300 font-bold' : 'text-neutral-500'}`}>
                20% Solar Heat
              </span>
            </button>

            <button
              onClick={() => handleSelectSensor('wet')}
              className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                activeSensor === 'wet'
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-[1.01]'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Droplets className={`w-3.5 h-3.5 ${activeSensor === 'wet' ? 'text-sky-400' : 'text-neutral-500'}`} />
                <span className="truncate">Wet Bulb (Twb)</span>
              </div>
              <span className={`text-[10px] font-mono block ${activeSensor === 'wet' ? 'text-sky-300 font-bold' : 'text-neutral-500'}`}>
                70% Primary
              </span>
            </button>

            <button
              onClick={() => handleSelectSensor('dry')}
              className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                activeSensor === 'dry'
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-[1.01]'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Shield className={`w-3.5 h-3.5 ${activeSensor === 'dry' ? 'text-amber-400' : 'text-neutral-500'}`} />
                <span className="truncate">Dry Bulb (Ta)</span>
              </div>
              <span className={`text-[10px] font-mono block ${activeSensor === 'dry' ? 'text-amber-300 font-bold' : 'text-neutral-500'}`}>
                10% Ambient
              </span>
            </button>

            <button
              onClick={() => handleSelectSensor('wind')}
              className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                activeSensor === 'wind'
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-[1.01]'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Wind className={`w-3.5 h-3.5 ${activeSensor === 'wind' ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span className="truncate">Anemometer</span>
              </div>
              <span className={`text-[10px] font-mono block ${activeSensor === 'wind' ? 'text-emerald-300 font-bold' : 'text-neutral-500'}`}>
                Wind Velocity
              </span>
            </button>
          </div>

          {/* Active Sensor Details Card */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900">
                {activeSensorData.titleEn}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-200 text-neutral-800">
                {activeSensorData.formulaWeight}
              </span>
            </div>

            <p className="text-neutral-600 leading-relaxed text-[11px]">
              {activeSensorData.descEn}
            </p>

            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500">Live Sample Reading:</span>
              <span className="font-mono font-bold text-neutral-900">{activeSensorData.reading}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
