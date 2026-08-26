import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HardHat, ShieldCheck, Layers, Users, Zap, AlertTriangle, Eye } from 'lucide-react';

interface SiteThermalZone3DProps {
}

export const SiteThermalZone3D: React.FC<SiteThermalZone3DProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedZone, setSelectedZone] = useState<'asphalt' | 'roofing' | 'concrete' | 'shelter'>('roofing');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const siteGroupRef = useRef<THREE.Group | null>(null);
  const zoneSpotLightRef = useRef<THREE.SpotLight | null>(null);
  const zoneHighlightRingRef = useRef<THREE.Mesh | null>(null);

  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(2.2, 2.2, -0.2));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0.85, 0.85, -0.85));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0.85, 0.85, -0.85));
  const selectedZoneRef = useRef<'asphalt' | 'roofing' | 'concrete' | 'shelter'>('roofing');

  selectedZoneRef.current = selectedZone;

  // References to worker meshes & zone slabs for active visual glow
  const workersRef = useRef<{
    asphalt: THREE.Group | null;
    roofing: THREE.Group | null;
    concrete: THREE.Group | null;
    shelter: THREE.Group | null;
  }>({
    asphalt: null,
    roofing: null,
    concrete: null,
    shelter: null,
  });

  const zones = {
    roofing: {
      titleEn: 'Corrugated Metal Roofing Crew',
      heatDelta: '+3.8°C Thermal Reflection',
      risk: 'CRITICAL NO-GO',
      descEn: 'Roofers on elevated galvanized iron sheets. Thermal conduction through boots and gloves with zero convective cross-breeze causes acute dizziness.',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      workerTitle: 'Structural Sheet Installer',
      workerGear: 'Fall-Arrest Harness, Heat Insulated Gloves, Hardhat',
      focusPos: new THREE.Vector3(0.85, 0.75, -0.85),
      camPos: new THREE.Vector3(2.1, 2.2, -0.3),
      spotColor: 0xef4444,
    },
    asphalt: {
      titleEn: 'Asphalt & Bitumen Road Crew',
      heatDelta: '+4.5°C Radiative Exertion',
      risk: 'CRITICAL NO-GO',
      descEn: 'Paving crew on 60°C black bitumen. Direct solar absorption, lack of shade, and continuous forward-leaning shoveling create dangerous cardiac heat stress.',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      workerTitle: 'Road Surface Laborer (Raker / Tamper)',
      workerGear: 'Class 3 Safety Vest, Heat-Proof Boots, UV Neck Flap Hardhat',
      focusPos: new THREE.Vector3(-0.85, 0.25, 0.85),
      camPos: new THREE.Vector3(-2.1, 1.9, 2.1),
      spotColor: 0xf97316,
    },
    concrete: {
      titleEn: 'Reinforced Concrete Pouring Gang',
      heatDelta: '+2.5°C Hydration Reaction',
      risk: 'HIGH RISK',
      descEn: 'Cement exothermic curing generates sustained ambient heat while continuous vibrator and float tool handling triggers high metabolic heat buildup.',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      workerTitle: 'Concrete Finisher & Screeder',
      workerGear: 'Waterproof Safety Boots, Hi-Vis Vest, Hardhat',
      focusPos: new THREE.Vector3(-0.85, 0.35, -0.85),
      camPos: new THREE.Vector3(-2.2, 1.8, -0.2),
      spotColor: 0xeab308,
    },
    shelter: {
      titleEn: 'Air-Cooled Hydration & ORS Bay',
      heatDelta: '-8.0°C Microclimate Relief',
      risk: 'SAFE ZONE',
      descEn: 'Misting fans, cool drinking water, electrolyte ORS packets, and UV canopy shade allow rapid physiological core cooling and recovery.',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      workerTitle: 'Resting Field Worker',
      workerGear: 'Hardhat Removed, Drinking Electrolyte Solution',
      focusPos: new THREE.Vector3(0.85, 0.35, 0.85),
      camPos: new THREE.Vector3(2.1, 1.6, 2.1),
      spotColor: 0x10b981,
    },
  };

  const handleSelectZone = (zoneKey: 'asphalt' | 'roofing' | 'concrete' | 'shelter') => {
    setSelectedZone(zoneKey);
    const config = zones[zoneKey];
    targetCamPosRef.current.copy(config.camPos);
    targetLookAtRef.current.copy(config.focusPos);

    if (zoneSpotLightRef.current) {
      zoneSpotLightRef.current.position.set(config.focusPos.x, config.focusPos.y + 1.8, config.focusPos.z + 0.5);
      zoneSpotLightRef.current.target.position.copy(config.focusPos);
      zoneSpotLightRef.current.color.setHex(config.spotColor);
    }

    if (zoneHighlightRingRef.current) {
      zoneHighlightRingRef.current.position.set(config.focusPos.x, 0.05, config.focusPos.z);
      (zoneHighlightRingRef.current.material as THREE.MeshBasicMaterial).color.setHex(config.spotColor);
    }
  };

  // Helper function to build a procedural 3D worker character
  const createWorkerCharacter = (
    type: 'asphalt' | 'roofing' | 'concrete' | 'shelter',
    scale = 1.0
  ): THREE.Group => {
    const worker = new THREE.Group();
    worker.scale.set(scale, scale, scale);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const vestOrangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, emissive: 0xea580c, emissiveIntensity: 0.2 });
    const vestGreenMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.4, emissive: 0x65a30d, emissiveIntensity: 0.2 });
    const reflectiveMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.8, roughness: 0.1 });
    const hardhatYellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.1 });
    const hardhatWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 });
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

    const vestMat = (type === 'asphalt' || type === 'roofing') ? vestOrangeMat : vestGreenMat;
    const hatMat = type === 'roofing' ? hardhatWhiteMat : hardhatYellowMat;

    if (type === 'shelter') {
      // Resting seated posture
      const torsoGeom = new THREE.BoxGeometry(0.18, 0.22, 0.12);
      const torso = new THREE.Mesh(torsoGeom, vestMat);
      torso.position.y = 0.22;
      worker.add(torso);

      const headGeom = new THREE.SphereGeometry(0.065, 12, 12);
      const head = new THREE.Mesh(headGeom, skinMat);
      head.position.y = 0.38;
      worker.add(head);

      // Legs (Seated bend)
      const upperLegGeom = new THREE.BoxGeometry(0.07, 0.07, 0.16);
      const leftUpperLeg = new THREE.Mesh(upperLegGeom, pantsMat);
      leftUpperLeg.position.set(-0.06, 0.12, 0.08);
      const rightUpperLeg = new THREE.Mesh(upperLegGeom, pantsMat);
      rightUpperLeg.position.set(0.06, 0.12, 0.08);
      worker.add(leftUpperLeg);
      worker.add(rightUpperLeg);

      const lowerLegGeom = new THREE.BoxGeometry(0.06, 0.14, 0.06);
      const leftLowerLeg = new THREE.Mesh(lowerLegGeom, pantsMat);
      leftLowerLeg.position.set(-0.06, 0.05, 0.15);
      const rightLowerLeg = new THREE.Mesh(lowerLegGeom, pantsMat);
      rightLowerLeg.position.set(0.06, 0.05, 0.15);
      worker.add(leftLowerLeg);
      worker.add(rightLowerLeg);

      // Resting bench
      const benchGeom = new THREE.BoxGeometry(0.3, 0.12, 0.2);
      const benchMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
      const bench = new THREE.Mesh(benchGeom, benchMat);
      bench.position.y = 0.06;
      worker.add(bench);

      // ORS Bottle / Glass in hand
      const bottleGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8);
      const bottleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
      const bottle = new THREE.Mesh(bottleGeom, bottleMat);
      bottle.position.set(0.12, 0.24, 0.1);
      worker.add(bottle);

      // Hardhat resting on bench
      const hatGeom = new THREE.SphereGeometry(0.07, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const hat = new THREE.Mesh(hatGeom, hatMat);
      hat.rotation.x = Math.PI;
      hat.position.set(-0.18, 0.14, 0.02);
      worker.add(hat);

    } else {
      // Standing active posture
      const legGeom = new THREE.CylinderGeometry(0.035, 0.04, 0.24, 8);
      const leftLeg = new THREE.Mesh(legGeom, pantsMat);
      leftLeg.position.set(-0.055, 0.12, 0);
      const rightLeg = new THREE.Mesh(legGeom, pantsMat);
      rightLeg.position.set(0.055, 0.12, 0);
      worker.add(leftLeg);
      worker.add(rightLeg);

      // Boots
      const bootGeom = new THREE.BoxGeometry(0.05, 0.04, 0.09);
      const leftBoot = new THREE.Mesh(bootGeom, bootsMat);
      leftBoot.position.set(-0.055, 0.02, 0.02);
      const rightBoot = new THREE.Mesh(bootGeom, bootsMat);
      rightBoot.position.set(0.055, 0.02, 0.02);
      worker.add(leftBoot);
      worker.add(rightBoot);

      // Torso with High-Vis Safety Vest
      const torsoGeom = new THREE.BoxGeometry(0.18, 0.24, 0.12);
      const torso = new THREE.Mesh(torsoGeom, vestMat);
      torso.position.y = 0.34;
      worker.add(torso);

      // Reflective Silver Stripes across vest
      const stripeGeom = new THREE.BoxGeometry(0.184, 0.03, 0.124);
      const stripe = new THREE.Mesh(stripeGeom, reflectiveMat);
      stripe.position.y = 0.35;
      worker.add(stripe);

      // Head & Neck
      const headGeom = new THREE.SphereGeometry(0.065, 12, 12);
      const head = new THREE.Mesh(headGeom, skinMat);
      head.position.y = 0.52;
      worker.add(head);

      // Hardhat
      const hatGeom = new THREE.SphereGeometry(0.075, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.8);
      const hat = new THREE.Mesh(hatGeom, hatMat);
      hat.position.y = 0.54;
      worker.add(hat);

      // Brim
      const brimGeom = new THREE.CylinderGeometry(0.095, 0.095, 0.01, 16);
      const brim = new THREE.Mesh(brimGeom, hatMat);
      brim.position.y = 0.53;
      worker.add(brim);

      // Arms & Work Tools
      const armGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.2, 8);

      if (type === 'asphalt') {
        const leftArm = new THREE.Mesh(armGeom, skinMat);
        leftArm.rotation.x = Math.PI / 3;
        leftArm.position.set(-0.11, 0.32, 0.08);
        const rightArm = new THREE.Mesh(armGeom, skinMat);
        rightArm.rotation.x = Math.PI / 4;
        rightArm.position.set(0.11, 0.32, 0.06);
        worker.add(leftArm);
        worker.add(rightArm);

        // Asphalt Rake
        const toolHandleGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.7, 8);
        const toolHandleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
        const toolHandle = new THREE.Mesh(toolHandleGeom, toolHandleMat);
        toolHandle.rotation.x = Math.PI / 2.8;
        toolHandle.position.set(0.08, 0.25, 0.2);
        worker.add(toolHandle);

        const rakeHeadGeom = new THREE.BoxGeometry(0.25, 0.03, 0.04);
        const rakeHeadMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 });
        const rakeHead = new THREE.Mesh(rakeHeadGeom, rakeHeadMat);
        rakeHead.position.set(0.08, 0.02, 0.45);
        worker.add(rakeHead);

      } else if (type === 'roofing') {
        const leftArm = new THREE.Mesh(armGeom, skinMat);
        leftArm.rotation.x = Math.PI / 2.5;
        leftArm.position.set(-0.11, 0.32, 0.08);
        const rightArm = new THREE.Mesh(armGeom, skinMat);
        rightArm.rotation.x = Math.PI / 2;
        rightArm.position.set(0.11, 0.34, 0.08);
        worker.add(leftArm);
        worker.add(rightArm);

        // Cordless Screw Gun
        const drillGeom = new THREE.BoxGeometry(0.05, 0.08, 0.09);
        const drillMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
        const drill = new THREE.Mesh(drillGeom, drillMat);
        drill.position.set(0.12, 0.34, 0.18);
        worker.add(drill);

        // Safety Lanyard
        const ropeGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.6, 6);
        const ropeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const rope = new THREE.Mesh(ropeGeom, ropeMat);
        rope.rotation.x = -Math.PI / 3;
        rope.position.set(0, 0.38, -0.22);
        worker.add(rope);

      } else if (type === 'concrete') {
        const leftArm = new THREE.Mesh(armGeom, skinMat);
        leftArm.rotation.x = Math.PI / 3;
        leftArm.position.set(-0.11, 0.32, 0.08);
        const rightArm = new THREE.Mesh(armGeom, skinMat);
        rightArm.rotation.x = Math.PI / 3.5;
        rightArm.position.set(0.11, 0.32, 0.08);
        worker.add(leftArm);
        worker.add(rightArm);

        // Concrete Bull Float tool
        const handleGeom = new THREE.CylinderGeometry(0.009, 0.009, 0.65, 8);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
        const handle = new THREE.Mesh(handleGeom, handleMat);
        handle.rotation.x = Math.PI / 2.6;
        handle.position.set(0, 0.22, 0.22);
        worker.add(handle);

        const floatBladeGeom = new THREE.BoxGeometry(0.26, 0.015, 0.08);
        const floatBladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
        const floatBlade = new THREE.Mesh(floatBladeGeom, floatBladeMat);
        floatBlade.position.set(0, 0.02, 0.45);
        worker.add(floatBlade);
      }
    }

    return worker;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.1, 2.2, -0.3);
    camera.lookAt(0.85, 0.75, -0.85);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';
    container.replaceChildren(renderer.domElement);

    const siteGroup = new THREE.Group();
    siteGroupRef.current = siteGroup;
    scene.add(siteGroup);

    // Tagging helper for raycaster zone resolution
    const tagSubtree = (obj: THREE.Object3D, key: 'asphalt' | 'roofing' | 'concrete' | 'shelter') => {
      obj.userData.zoneKey = key;
      obj.traverse((child) => {
        child.userData.zoneKey = key;
      });
    };

    // 1. Ground Slab Base
    const groundGeom = new THREE.BoxGeometry(3.6, 0.1, 3.6);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    siteGroup.add(ground);

    // 2. Zone A: Asphalt Road Strip
    const asphaltGeom = new THREE.BoxGeometry(1.6, 0.12, 1.4);
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
    });
    const asphalt = new THREE.Mesh(asphaltGeom, asphaltMat);
    asphalt.position.set(-0.85, 0.02, 0.85);
    asphalt.receiveShadow = true;
    tagSubtree(asphalt, 'asphalt');
    siteGroup.add(asphalt);

    // Asphalt Road Worker Character
    const asphaltWorker = createWorkerCharacter('asphalt', 0.85);
    asphaltWorker.position.set(-0.85, 0.08, 0.85);
    tagSubtree(asphaltWorker, 'asphalt');
    workersRef.current.asphalt = asphaltWorker;
    siteGroup.add(asphaltWorker);

    // 3. Zone B: Elevated Metal Roof Structure
    const roofGroup = new THREE.Group();
    roofGroup.position.set(0.85, 0.6, -0.85);
    tagSubtree(roofGroup, 'roofing');
    siteGroup.add(roofGroup);

    // Roof pillars
    for (let x of [-0.6, 0.6]) {
      for (let z of [-0.5, 0.5]) {
        const pillarGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        const pillar = new THREE.Mesh(pillarGeom, pillarMat);
        pillar.position.set(x, -0.3, z);
        tagSubtree(pillar, 'roofing');
        roofGroup.add(pillar);
      }
    }

    // Sloped Corrugated Metal Sheet
    const sheetGeom = new THREE.BoxGeometry(1.5, 0.04, 1.3);
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.7,
      roughness: 0.25,
      emissive: 0x991b1b,
      emissiveIntensity: 0.45,
    });
    const sheet = new THREE.Mesh(sheetGeom, sheetMat);
    sheet.rotation.z = 0.08;
    sheet.position.y = 0.02;
    tagSubtree(sheet, 'roofing');
    roofGroup.add(sheet);

    // Roofing Worker Character on top of roof
    const roofWorker = createWorkerCharacter('roofing', 0.85);
    roofWorker.position.set(0.85, 0.65, -0.85);
    tagSubtree(roofWorker, 'roofing');
    workersRef.current.roofing = roofWorker;
    siteGroup.add(roofWorker);

    // 4. Zone C: Concrete Pouring Slab & Crane
    const concreteGeom = new THREE.BoxGeometry(1.5, 0.18, 1.4);
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
    const concrete = new THREE.Mesh(concreteGeom, concreteMat);
    concrete.position.set(-0.85, 0.05, -0.85);
    tagSubtree(concrete, 'concrete');
    siteGroup.add(concrete);

    // Concrete Pouring Worker Character
    const concreteWorker = createWorkerCharacter('concrete', 0.85);
    concreteWorker.position.set(-0.85, 0.14, -0.85);
    tagSubtree(concreteWorker, 'concrete');
    workersRef.current.concrete = concreteWorker;
    siteGroup.add(concreteWorker);

    // Tower crane mast
    const craneMastGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8);
    const craneMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 });
    const craneMast = new THREE.Mesh(craneMastGeom, craneMat);
    craneMast.position.set(-1.4, 0.7, -1.4);
    tagSubtree(craneMast, 'concrete');
    siteGroup.add(craneMast);

    const craneJibGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    const craneJib = new THREE.Mesh(craneJibGeom, craneMat);
    craneJib.rotation.z = Math.PI / 2;
    craneJib.position.set(-0.95, 1.4, -1.4);
    tagSubtree(craneJib, 'concrete');
    siteGroup.add(craneJib);

    // 5. Zone D: Hydration & Shade Shelter
    const shelterGeom = new THREE.BoxGeometry(1.4, 0.05, 1.4);
    const shelterMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.4,
      emissive: 0x059669,
      emissiveIntensity: 0.25,
    });
    const shelter = new THREE.Mesh(shelterGeom, shelterMat);
    shelter.position.set(0.85, 0.65, 0.85);
    tagSubtree(shelter, 'shelter');
    siteGroup.add(shelter);

    for (let x of [0.3, 1.4]) {
      for (let z of [0.3, 1.4]) {
        const pGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x059669 });
        const p = new THREE.Mesh(pGeom, pMat);
        p.position.set(x, 0.32, z);
        tagSubtree(p, 'shelter');
        siteGroup.add(p);
      }
    }

    // Hydration Worker Character (resting in shelter)
    const shelterWorker = createWorkerCharacter('shelter', 0.85);
    shelterWorker.position.set(0.85, 0.05, 0.85);
    tagSubtree(shelterWorker, 'shelter');
    workersRef.current.shelter = shelterWorker;
    siteGroup.add(shelterWorker);

    // Dynamic Zone Ring Indicator
    const zoneRingGeom = new THREE.RingGeometry(0.65, 0.75, 32);
    const zoneRingMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const zoneRing = new THREE.Mesh(zoneRingGeom, zoneRingMat);
    zoneRing.rotation.x = Math.PI / 2;
    zoneRing.position.set(0.85, 0.05, -0.85);
    zoneHighlightRingRef.current = zoneRing;
    siteGroup.add(zoneRing);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    sunLight.position.set(5, 7, 3);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const zoneSpotLight = new THREE.SpotLight(0xef4444, 5.0, 6, Math.PI / 3, 0.4);
    zoneSpotLight.position.set(0.85, 2.8, -0.3);
    zoneSpotLight.target.position.set(0.85, 0.75, -0.85);
    scene.add(zoneSpotLight);
    scene.add(zoneSpotLight.target);
    zoneSpotLightRef.current = zoneSpotLight;

    // Raycaster for Click-to-Focus and Hover Detection
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const findZoneFromIntersection = (clientX: number, clientY: number): 'asphalt' | 'roofing' | 'concrete' | 'shelter' | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(siteGroup.children, true);

      if (intersects.length > 0) {
        // 1. Check if any intersected object has explicit zoneKey tag
        for (const hit of intersects) {
          let current: THREE.Object3D | null = hit.object;
          while (current && current !== siteGroup) {
            if (current.userData && current.userData.zoneKey) {
              return current.userData.zoneKey;
            }
            current = current.parent;
          }
        }

        // 2. Fallback: check coordinate quadrant in siteGroup local space
        const firstHit = intersects[0];
        const localPt = siteGroup.worldToLocal(firstHit.point.clone());
        if (localPt.x >= 0 && localPt.z < 0) return 'roofing';
        if (localPt.x < 0 && localPt.z >= 0) return 'asphalt';
        if (localPt.x < 0 && localPt.z < 0) return 'concrete';
        if (localPt.x >= 0 && localPt.z >= 0) return 'shelter';
      }
      return null;
    };

    // Interactive Drag Rotation & Click-to-Focus
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTime = 0;
    let prevMouseX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartTime = performance.now();
      prevMouseX = e.clientX;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging && siteGroupRef.current) {
        const deltaX = e.clientX - prevMouseX;
        siteGroupRef.current.rotation.y += deltaX * 0.008;
        prevMouseX = e.clientX;
      } else if (!isDragging) {
        // Hover test to show pointer cursor over clickable zones
        const hoveredZone = findZoneFromIntersection(e.clientX, e.clientY);
        renderer.domElement.style.cursor = hoveredZone ? 'pointer' : 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';

      const dist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
      const elapsed = performance.now() - dragStartTime;

      // If user performed a short tap or click (< 8px movement, < 600ms duration)
      if (dist < 8 && elapsed < 600) {
        const clickedZone = findZoneFromIntersection(e.clientX, e.clientY);
        if (clickedZone) {
          handleSelectZone(clickedZone);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth camera interpolation towards target zone position and lookAt
      if (cameraRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.06);
        currentLookAtRef.current.lerp(targetLookAtRef.current, 0.06);
        camera.lookAt(currentLookAtRef.current);
      }

      // Zone ring pulsating
      if (zoneHighlightRingRef.current) {
        const ringScale = 1.0 + Math.sin(elapsedTime * 4) * 0.08;
        zoneHighlightRingRef.current.scale.set(ringScale, ringScale, 1.0);
      }

      // Subtle breath animation on active worker
      const activeWorker = workersRef.current[selectedZoneRef.current];
      if (activeWorker) {
        activeWorker.position.y += Math.sin(elapsedTime * 3) * 0.0006;
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
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, []);

  const activeZone = zones[selectedZone];

  return (
    <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span>3D Construction Crew & Activity Zones</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                ACTIVE CREW MODELS
              </span>
            </h3>
            <p className="text-xs text-neutral-500">
              Real-time physiological strain across trade specializations
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-neutral-100 rounded-lg border border-neutral-200 text-[11px] font-mono text-neutral-700">
          ISO 7243 Metabolic Rating: 180W - 460W
        </div>
      </div>

      {/* 3D Canvas Viewport + Zone Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* 3D Canvas with Real Worker Characters */}
        <div className="md:col-span-7 h-[270px] sm:h-[300px] bg-neutral-950 rounded-xl relative overflow-hidden cursor-grab active:cursor-grabbing border border-neutral-800">
          <div ref={containerRef} className="w-full h-full" />
          
          {/* 3D Overlay Badges */}
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-mono text-neutral-300 border border-neutral-700 flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <HardHat className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400 font-bold uppercase">{selectedZone}:</span>
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeZone.workerTitle}</span>
          </div>

          {/* Floating On-Canvas Zone Focus Pills */}
          <div className="absolute top-2 right-2 flex flex-wrap justify-end gap-1 z-10 max-w-[200px] sm:max-w-none">
            {(['roofing', 'asphalt', 'concrete', 'shelter'] as const).map((k) => {
              const z = zones[k];
              const isCurr = selectedZone === k;
              return (
                <button
                  key={k}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectZone(k);
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold transition-all cursor-pointer border ${
                    isCurr
                      ? 'bg-orange-500 text-white border-orange-400 shadow-xs scale-105'
                      : 'bg-black/70 hover:bg-black text-neutral-300 border-neutral-700 hover:text-white'
                  }`}
                  title={`Focus on ${z.titleEn}`}
                >
                  {k}
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-neutral-400 border border-neutral-700 z-10 pointer-events-none">
            Drag to Orbit • Click Any Zone or Worker
          </div>
        </div>

        {/* Zone Selector & Worker Equipment Breakdown */}
        <div className="md:col-span-5 space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {(['roofing', 'asphalt', 'concrete', 'shelter'] as const).map((key) => {
              const item = zones[key];
              const isSelected = selectedZone === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectZone(key)}
                  className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-[1.01]'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span className="truncate block font-bold">
                    {item.titleEn}
                  </span>
                  <span
                    className={`text-[10px] font-mono block mt-0.5 ${
                      isSelected ? 'text-amber-400 font-bold' : 'text-neutral-500'
                    }`}
                  >
                    {item.heatDelta}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Detail Card with Worker Role & PPE */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900">
                {activeZone.titleEn}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${activeZone.badgeColor}`}>
                {activeZone.risk}
              </span>
            </div>

            <p className="text-neutral-600 leading-relaxed text-[11px]">
              {activeZone.descEn}
            </p>

            <div className="p-2 bg-white rounded-lg border border-neutral-200 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>TRADE ROLE:</span>
                <span className="text-neutral-900 font-bold">{activeZone.workerTitle}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>SAFETY PPE:</span>
                <span className="text-neutral-700 font-medium truncate max-w-[190px]">{activeZone.workerGear}</span>
              </div>
            </div>

            <div className="pt-1 border-t border-neutral-200 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500">Thermal Strain Modifier:</span>
              <span className="font-mono font-bold text-neutral-900">{activeZone.heatDelta}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
