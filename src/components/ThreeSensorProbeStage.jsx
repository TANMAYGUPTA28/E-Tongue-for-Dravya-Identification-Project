import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ELECTRODE_SPECS = [
  { id: 'WE1', name: 'Lipid Bio-Membrane', rasa: 'Madhura (Sweet)', color: 0x14b8a6, colorHex: '#14B8A6', targetV: '0.722V', angle: 0 },
  { id: 'WE2', name: 'Polyaniline (PANI)', rasa: 'Amla (Sour)', color: 0x0ea5e9, colorHex: '#0EA5E9', targetV: '0.384V', angle: 60 },
  { id: 'WE3', name: 'Chitosan Hydrogel', rasa: 'Lavana (Salty)', color: 0x3b82f6, colorHex: '#3B82F6', targetV: '0.450V', angle: 120 },
  { id: 'WE4', name: 'Phthalocyanine (Pc)', rasa: 'Tikta (Bitter)', color: 0xf59e0b, colorHex: '#F59E0B', targetV: '2.777V', angle: 180 },
  { id: 'WE5', name: 'Crown Ether Cage', rasa: 'Katu (Pungent)', color: 0x8b5cf6, colorHex: '#8B5CF6', targetV: '1.151V', angle: 240 },
  { id: 'WE6', name: 'Ruthenium Oxide (RuOx)', rasa: 'Kashaya (Astringent)', color: 0x10b981, colorHex: '#10B981', targetV: '2.352V', angle: 300 },
];

export default function ThreeSensorProbeStage({
  activeSection = 0,
  scrollProgress = 0,
  lightingMode = 'dark',
  isDipping = false,
  onPinHover = null,
  liveVoltages = [0.72, 0.38, 0.45, 2.78, 1.15, 2.35],
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    activeSection,
    scrollProgress,
    lightingMode,
    isDipping,
    liveVoltages,
  });

  useEffect(() => {
    stateRef.current = {
      activeSection,
      scrollProgress,
      lightingMode,
      isDipping,
      liveVoltages,
    };
  }, [activeSection, scrollProgress, lightingMode, isDipping, liveVoltages]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // =========================================================================
    // 1. SCENE, CAMERA, RENDERER & ATMOSPHERIC FOG
    // =========================================================================
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 28);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 2. PROCEDURAL HIGH-DYNAMIC-RANGE STUDIO ENVIRONMENT MAP
    //    (Eliminates cartoon look: provides realistic metallic & glass reflections)
    // =========================================================================
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const envCtx = envCanvas.getContext('2d');

    const envGrad = envCtx.createLinearGradient(0, 0, 0, 512);
    envGrad.addColorStop(0, '#020617');
    envGrad.addColorStop(0.3, '#0b1329');
    envGrad.addColorStop(0.7, '#040915');
    envGrad.addColorStop(1, '#020617');
    envCtx.fillStyle = envGrad;
    envCtx.fillRect(0, 0, 1024, 512);

    // Overhead high-contrast softbox light strip
    envCtx.fillStyle = '#ffffff';
    envCtx.shadowColor = '#67e8f9';
    envCtx.shadowBlur = 60;
    envCtx.fillRect(250, 40, 200, 100);

    // Cyan lateral laser strip
    envCtx.fillStyle = '#38bdf8';
    envCtx.shadowColor = '#2dd4bf';
    envCtx.shadowBlur = 70;
    envCtx.fillRect(700, 100, 90, 300);

    // Warm amber counter-bounce strip
    envCtx.fillStyle = '#f59e0b';
    envCtx.shadowColor = '#d97706';
    envCtx.shadowBlur = 50;
    envCtx.fillRect(100, 260, 80, 180);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

    // =========================================================================
    // 3. SCIENTIFIC STUDIO LIGHTING RIG
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 3.5);
    keyLight.position.set(16, 24, 18);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 2.8);
    rimLight.position.set(-18, -6, -16);
    scene.add(rimLight);

    const bottomWarmFill = new THREE.PointLight(0xf59e0b, 2.0, 30);
    bottomWarmFill.position.set(0, -10, 10);
    scene.add(bottomWarmFill);

    // Central levitation plasma point light
    const plasmaLight = new THREE.PointLight(0x2dd4bf, 4.0, 18);
    plasmaLight.position.set(0, 2, 0);
    scene.add(plasmaLight);

    // =========================================================================
    // 4. HOLOGRAPHIC LABORATORY FLOOR & ROTATING RADAR GRID
    // =========================================================================
    const floorGroup = new THREE.Group();
    floorGroup.position.y = -12;
    scene.add(floorGroup);

    // Circular Holographic Radar Ring Grid
    const radarDiscGeom = new THREE.RingGeometry(0.1, 14, 64, 4);
    const radarDiscMat = new THREE.MeshBasicMaterial({
      color: 0x0e7490,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const radarDisc = new THREE.Mesh(radarDiscGeom, radarDiscMat);
    radarDisc.rotation.x = -Math.PI / 2;
    floorGroup.add(radarDisc);

    // Concentric coordinate rings
    [4, 8, 12].forEach((r) => {
      const ringG = new THREE.TorusGeometry(r, 0.04, 8, 64);
      const ringM = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringG, ringM);
      ring.rotation.x = Math.PI / 2;
      floorGroup.add(ring);
    });

    // Holographic radar sweep beam line
    const sweepGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(14, 0.05, 0),
    ]);
    const sweepMat = new THREE.LineBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.7,
    });
    const sweepLine = new THREE.Line(sweepGeom, sweepMat);
    floorGroup.add(sweepLine);

    // =========================================================================
    // 5. INTERACTIVE LIVE OLED SCREEN TEXTURE ON PROBE SHAFT
    //    (Procedural dynamic canvas displaying live waveform & potentiostat data)
    // =========================================================================
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 256;
    const screenCtx = screenCanvas.getContext('2d');
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.wrapS = THREE.ClampToEdgeWrapping;
    screenTexture.wrapT = THREE.ClampToEdgeWrapping;

    // =========================================================================
    // 6. PRECISION AEROSPACE SENSOR PROBE ASSEMBLY (ANTIGRAVITY CORE)
    // =========================================================================
    const probeMaster = new THREE.Group();
    scene.add(probeMaster);

    // --- Sub-assembly A: Main Obsidian Titanium Chassis ---
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.94,
      roughness: 0.18,
    });

    const brushedChromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.12,
    });

    const aerospaceGoldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.96,
      roughness: 0.14,
    });

    // Main Cylindrical Housing Body
    const bodyGeom = new THREE.CylinderGeometry(1.4, 1.4, 9, 48);
    const bodyMesh = new THREE.Mesh(bodyGeom, chassisMat);
    bodyMesh.position.y = 5.5;
    probeMaster.add(bodyMesh);

    // Vertical Titanium Heat-Sink / Cooling Fins (8 ribs)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const finGeom = new THREE.BoxGeometry(0.08, 6.5, 0.4);
      const finMesh = new THREE.Mesh(finGeom, brushedChromeMat);
      finMesh.position.set(Math.cos(angle) * 1.55, 6, Math.sin(angle) * 1.55);
      finMesh.rotation.y = -angle;
      probeMaster.add(finMesh);
    }

    // High-Tech Curved OLED Display Panel
    const oledGeom = new THREE.CylinderGeometry(1.43, 1.43, 3.2, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const oledMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const oledMesh = new THREE.Mesh(oledGeom, oledMat);
    oledMesh.position.y = 5.5;
    probeMaster.add(oledMesh);

    // Upper Quantum Levitation Magnetic Cap
    const capGeom = new THREE.CylinderGeometry(0.9, 1.45, 1.5, 32);
    const capMesh = new THREE.Mesh(capGeom, brushedChromeMat);
    capMesh.position.y = 10.75;
    probeMaster.add(capMesh);

    // Pulsating Levitation Plasma Emitter Orb at Top
    const orbG = new THREE.SphereGeometry(0.7, 32, 32);
    const orbM = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const topPlasmaOrb = new THREE.Mesh(orbG, orbM);
    topPlasmaOrb.position.y = 11.5;
    probeMaster.add(topPlasmaOrb);

    // Glowing Fiber-Optic Cyan Halo Ring
    const haloGeom = new THREE.TorusGeometry(1.5, 0.08, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.95,
    });
    const haloRing = new THREE.Mesh(haloGeom, haloMat);
    haloRing.rotation.x = Math.PI / 2;
    haloRing.position.y = 1.6;
    probeMaster.add(haloRing);

    // Lower Gold-Plated Potentiostat Knurled Collar
    const collarGeom = new THREE.CylinderGeometry(1.42, 1.25, 2.2, 32);
    const collarMesh = new THREE.Mesh(collarGeom, aerospaceGoldMat);
    collarMesh.position.y = 0.5;
    probeMaster.add(collarMesh);

    // Beveled Hexagonal Working Electrode Mount Head
    const hexGeom = new THREE.CylinderGeometry(1.2, 0.9, 1.2, 6);
    const hexMesh = new THREE.Mesh(hexGeom, chassisMat);
    hexMesh.position.y = -1.1;
    probeMaster.add(hexMesh);

    // --- Sub-assembly B: 6 Iridescent Working Electrode Pins with Laser Tips ---
    const pins = [];
    const pinGuideRays = [];
    const pinRadius = 0.78;

    ELECTRODE_SPECS.forEach((spec, i) => {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * pinRadius;
      const z = Math.sin(angle) * pinRadius;

      // Pin Needle Body (Aerospace Gold + Titanium)
      const pinGeom = new THREE.CylinderGeometry(0.08, 0.05, 1.8, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: spec.color,
        emissive: spec.color,
        emissiveIntensity: 0.6,
        metalness: 0.95,
        roughness: 0.15,
      });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.set(x, -2.4, z);
      pinMesh.userData = { index: i, spec };
      probeMaster.add(pinMesh);

      // Iridescent Sapphire Prism Contact Tip (Octahedron crystal)
      const tipGeom = new THREE.OctahedronGeometry(0.14, 0);
      const tipMat = new THREE.MeshBasicMaterial({ color: spec.color });
      const tipMesh = new THREE.Mesh(tipGeom, tipMat);
      tipMesh.position.set(x, -3.3, z);
      probeMaster.add(tipMesh);

      // Laser Guide Line shooting down into solution
      const rayGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, -3.3, z),
        new THREE.Vector3(x, -6.5, z),
      ]);
      const rayMat = new THREE.LineBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.45,
      });
      const rayLine = new THREE.Line(rayGeom, rayMat);
      probeMaster.add(rayLine);
      pinGuideRays.push(rayLine);

      pins.push(pinMesh);
    });

    // =========================================================================
    // 7. TRI-RING ANTIGRAVITY GYROSCOPIC LEVITATION FIELD
    //    (Three concentric metallic rings rotating counter to each other)
    // =========================================================================
    const gyroGroup = new THREE.Group();
    gyroGroup.position.y = 2.5;
    probeMaster.add(gyroGroup);

    // Ring 1 (Inner Cyan Ring with laser emitters)
    const gyro1Geom = new THREE.TorusGeometry(2.2, 0.07, 16, 64);
    const gyro1Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      metalness: 0.96,
      roughness: 0.1,
    });
    const gyro1 = new THREE.Mesh(gyro1Geom, gyro1Mat);
    gyroGroup.add(gyro1);

    // Ring 2 (Middle Titanium Gimbal Ring)
    const gyro2Geom = new THREE.TorusGeometry(2.7, 0.08, 16, 64);
    const gyro2Mat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.98,
      roughness: 0.15,
    });
    const gyro2 = new THREE.Mesh(gyro2Geom, gyro2Mat);
    gyroGroup.add(gyro2);

    // Ring 3 (Outer Gold-Infused Stabilization Ring)
    const gyro3Geom = new THREE.TorusGeometry(3.3, 0.06, 16, 64);
    const gyro3Mat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
      metalness: 0.95,
      roughness: 0.12,
    });
    const gyro3 = new THREE.Mesh(gyro3Geom, gyro3Mat);
    gyroGroup.add(gyro3);

    // =========================================================================
    // 8. DIELECTRIC GLASS BEAKER & HERBAL FLUID VOLUME
    // =========================================================================
    const beakerGroup = new THREE.Group();
    beakerGroup.position.set(0, -6.5, 0);
    scene.add(beakerGroup);

    // High-Precision Lab Glass Cylinder (Dielectric Glass Shader)
    const beakerGeom = new THREE.CylinderGeometry(4.2, 4.2, 8.5, 48, 1, true);
    const beakerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      opacity: 0.4,
      transparent: true,
      roughness: 0.06,
      ior: 1.54,
      metalness: 0.05,
      reflectivity: 0.9,
    });
    const beakerMesh = new THREE.Mesh(beakerGeom, beakerMat);
    beakerGroup.add(beakerMesh);

    // Beaker Lip Spout Rim
    const rimGeom = new THREE.TorusGeometry(4.2, 0.12, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeom, brushedChromeMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 4.25;
    beakerGroup.add(rimMesh);

    // Beaker Volumetric Scale Markings (Etched glass tick rings)
    [-1.5, 0.5, 2.5].forEach((y) => {
      const tickGeom = new THREE.TorusGeometry(4.21, 0.025, 8, 48, Math.PI / 2);
      const tickMat = new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.6,
      });
      const tick = new THREE.Mesh(tickGeom, tickMat);
      tick.rotation.x = Math.PI / 2;
      tick.rotation.z = -Math.PI / 4;
      tick.position.y = y;
      beakerGroup.add(tick);
    });

    // Herbal Dravya Liquid Core (Deep Golden-Amber / Emerald Green)
    const liquidGeom = new THREE.CylinderGeometry(4.02, 4.02, 6.2, 48);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.72,
      roughness: 0.12,
      transmission: 0.65,
      ior: 1.38,
    });
    const liquidMesh = new THREE.Mesh(liquidGeom, liquidMat);
    liquidMesh.position.y = -1.1;
    beakerGroup.add(liquidMesh);

    // Liquid Surface Meniscus Disk with Ripples
    const meniscusGeom = new THREE.CircleGeometry(3.98, 48);
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x10b981,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.82,
      roughness: 0.08,
      metalness: 0.3,
    });
    const meniscusMesh = new THREE.Mesh(meniscusGeom, meniscusMat);
    meniscusMesh.rotation.x = -Math.PI / 2;
    meniscusMesh.position.y = 2.0;
    beakerGroup.add(meniscusMesh);

    // Volumetric Laser Scan Plane Sheet (Sweeps down through liquid)
    const scanPlaneGeom = new THREE.RingGeometry(0.1, 3.95, 32);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeom, scanPlaneMat);
    scanPlane.rotation.x = -Math.PI / 2;
    scanPlane.position.y = 1.9;
    beakerGroup.add(scanPlane);

    // =========================================================================
    // 9. ANTIGRAVITY QUANTUM ION PARTICLES (1,000 levitating particles)
    // =========================================================================
    const particleCount = 1000;
    const particleGeom = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    const ionColorPalette = [
      new THREE.Color(0x2dd4bf),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xf59e0b),
      new THREE.Color(0xa855f7),
      new THREE.Color(0x10b981),
    ];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 3.6;
      particlePos[i * 3] = Math.cos(angle) * r;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePos[i * 3 + 2] = Math.sin(angle) * r;

      const c = ionColorPalette[i % ionColorPalette.length];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;

      particleSpeeds[i] = 0.015 + Math.random() * 0.04;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSwarm = new THREE.Points(particleGeom, particleMat);
    beakerGroup.add(particleSwarm);

    // =========================================================================
    // 10. SECTION 4: HOLOGRAPHIC 6D RADAR SPIDER CAGE
    // =========================================================================
    const radar3DGroup = new THREE.Group();
    radar3DGroup.position.set(0, 0, 0);
    radar3DGroup.visible = false;
    scene.add(radar3DGroup);

    // 6 Spatial Radiating Laser Axis Rods
    const axisNodes = [];
    ELECTRODE_SPECS.forEach((spec, i) => {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * 7.5;
      const y = Math.sin(i * 1.05) * 2.2;
      const z = Math.sin(angle) * 7.5;

      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.8,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      radar3DGroup.add(line);

      // Node Diamond Crystal at axis extremity
      const nodeG = new THREE.OctahedronGeometry(0.35, 0);
      const nodeM = new THREE.MeshStandardMaterial({
        color: spec.color,
        emissive: spec.color,
        emissiveIntensity: 0.8,
        metalness: 0.9,
      });
      const node = new THREE.Mesh(nodeG, nodeM);
      node.position.set(x, y, z);
      radar3DGroup.add(node);
      axisNodes.push(node);
    });

    // Holographic Translucent Radar Spider Cage
    const spiderGeom = new THREE.IcosahedronGeometry(5.8, 1);
    const spiderMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const spiderMesh = new THREE.Mesh(spiderGeom, spiderMat);
    radar3DGroup.add(spiderMesh);

    // Inner Quantum Core Orb
    const coreGeom = new THREE.SphereGeometry(2.4, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    radar3DGroup.add(coreMesh);

    // =========================================================================
    // 11. MOUSE PARALLAX & RAYCASTING INTERACTION
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);
    const targetParallax = { x: 0, y: 0 };
    const currentParallax = { x: 0, y: 0 };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.x = nx;
      mouse.y = ny;
      targetParallax.x = nx * 3.5;
      targetParallax.y = ny * 2.0;
    };

    container.addEventListener('mousemove', onPointerMove);

    // 360-degree Drag Rotation for Section 4 Radar
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMoveDrag = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      if (radar3DGroup.visible) {
        radar3DGroup.rotation.y += deltaX * 0.01;
        radar3DGroup.rotation.x += deltaY * 0.01;
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMoveDrag);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // =========================================================================
    // 12. 60 FPS CHOREOGRAPHY LOOP & PROCEDURAL SCREEN PAINTER
    // =========================================================================
    let animationId;
    const clock = new THREE.Clock();

    const drawOledScreen = (time, activeSection) => {
      screenCtx.fillStyle = '#020617';
      screenCtx.fillRect(0, 0, 512, 256);

      // Cyan grid lines
      screenCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      screenCtx.lineWidth = 1;
      for (let x = 0; x < 512; x += 32) {
        screenCtx.beginPath();
        screenCtx.moveTo(x, 0);
        screenCtx.lineTo(x, 256);
        screenCtx.stroke();
      }
      for (let y = 0; y < 256; y += 32) {
        screenCtx.beginPath();
        screenCtx.moveTo(0, y);
        screenCtx.lineTo(512, y);
        screenCtx.stroke();
      }

      // Live Telemetry Header
      screenCtx.fillStyle = '#38bdf8';
      screenCtx.font = 'bold 20px monospace';
      screenCtx.fillText('E-TONGUE PRO // QUANTUM CORE', 24, 38);

      screenCtx.fillStyle = '#94a3b8';
      screenCtx.font = '14px monospace';
      screenCtx.fillText('AFE POTENTIOSTAT: ACTIVE (250 S/s)', 24, 64);

      // Live Electrochemical Waveform
      screenCtx.beginPath();
      screenCtx.strokeStyle = '#2dd4bf';
      screenCtx.lineWidth = 3;
      for (let x = 0; x < 512; x += 4) {
        const wave =
          Math.sin(x * 0.04 + time * 6) * 28 +
          Math.sin(x * 0.08 - time * 3) * 12;
        const y = 140 + wave;
        if (x === 0) screenCtx.moveTo(x, y);
        else screenCtx.lineTo(x, y);
      }
      screenCtx.stroke();

      // Channel Pills at bottom
      screenCtx.fillStyle = '#f59e0b';
      screenCtx.font = 'bold 15px monospace';
      screenCtx.fillText('WE1: 0.722V   WE4: 2.777V', 24, 210);

      screenCtx.fillStyle = '#10b981';
      screenCtx.fillText(`MODE: ${activeSection === 1 ? 'IMMERSION DIP' : activeSection === 3 ? '3D RADAR' : 'ANTIGRAVITY LEVITATING'}`, 24, 235);

      screenTexture.needsUpdate = true;
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const { activeSection, isDipping } = stateRef.current;

      // Update OLED screen
      drawOledScreen(time, activeSection);

      // Parallax smoothing
      currentParallax.x += (targetParallax.x - currentParallax.x) * 0.05;
      currentParallax.y += (targetParallax.y - currentParallax.y) * 0.05;

      // Antigravity Tri-Ring Gyroscope Counter-Rotations
      gyro1.rotation.x = time * 1.2;
      gyro1.rotation.y = time * 0.8;
      gyro2.rotation.y = -time * 1.0;
      gyro2.rotation.z = time * 0.6;
      gyro3.rotation.x = Math.sin(time * 0.9) * 0.8;
      gyro3.rotation.z = -time * 0.5;

      // Plasma emitter pulse
      const pulse = 1 + Math.sin(time * 4) * 0.25;
      topPlasmaOrb.scale.set(pulse, pulse, pulse);
      plasmaLight.intensity = 3.5 + Math.sin(time * 4) * 1.5;

      // Holographic floor radar sweep
      sweepLine.rotation.y = time * 1.5;

      // Volumetric laser scan sheet sweep
      scanPlane.position.y = 0.5 + Math.sin(time * 2.5) * 1.8;

      // Antigravity ion particle levitation
      const pPos = particleGeom.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pPos[i * 3 + 1] += particleSpeeds[i] * (activeSection === 1 ? 2.5 : 1.0);
        // Particle reset on reaching ceiling
        if (pPos[i * 3 + 1] > 4.5) {
          pPos[i * 3 + 1] = -4.5;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Section-based Scrollytelling Choreography
      if (activeSection === 0) {
        // Section 1: Antigravity Floating Hero Probe
        probeMaster.visible = true;
        beakerGroup.visible = true;
        radar3DGroup.visible = false;

        // Higher physical levitation hovering above beaker rim
        const levitateY = (isDipping ? -1.8 : 4.2) + Math.sin(time * 1.8) * 0.35;
        probeMaster.position.y += (levitateY - probeMaster.position.y) * 0.08;
        probeMaster.rotation.y += 0.007;
        probeMaster.rotation.z = Math.sin(time * 1.2) * 0.03;

        camera.position.x += (currentParallax.x - camera.position.x) * 0.05;
        camera.position.y += (4.5 + currentParallax.y - camera.position.y) * 0.05;
        camera.position.z += (27.5 - camera.position.z) * 0.05;
        camera.lookAt(0, 0.5, 0);

      } else if (activeSection === 1) {
        // Section 2: Sensor Immersion Dip Sequence
        probeMaster.visible = true;
        beakerGroup.visible = true;
        radar3DGroup.visible = false;

        // Plunge probe deep into extract
        const dipTargetY = -2.6;
        probeMaster.position.y += (dipTargetY - probeMaster.position.y) * 0.08;
        probeMaster.rotation.y += 0.004;

        // Liquid surface ripples and agitation
        meniscusMesh.position.y = 2.0 + Math.sin(time * 8) * 0.12;

        // Camera zooms in close to electrode fluid interface
        camera.position.x += (currentParallax.x * 0.5 + 2.5 - camera.position.x) * 0.05;
        camera.position.y += (-1.2 + currentParallax.y * 0.5 - camera.position.y) * 0.05;
        camera.position.z += (16.5 - camera.position.z) * 0.05;
        camera.lookAt(0, -2.5, 0);

      } else if (activeSection === 2) {
        // Section 3: Multi-Agent Swarm Orbit
        probeMaster.visible = true;
        beakerGroup.visible = true;
        radar3DGroup.visible = false;

        probeMaster.position.y += (-1.8 - probeMaster.position.y) * 0.08;
        probeMaster.rotation.y = time * 0.3;

        // Dynamic 45-degree isometric orbit
        const camOrbitX = Math.cos(time * 0.25) * 18;
        const camOrbitZ = Math.sin(time * 0.25) * 18;
        camera.position.x += (camOrbitX - camera.position.x) * 0.05;
        camera.position.y += (5.0 - camera.position.y) * 0.05;
        camera.position.z += (camOrbitZ - camera.position.z) * 0.05;
        camera.lookAt(0, 0, 0);

      } else if (activeSection === 3) {
        // Section 4: 3D Holographic Radar Spider Cage
        probeMaster.visible = false;
        beakerGroup.visible = false;
        radar3DGroup.visible = true;

        if (!isDragging) {
          radar3DGroup.rotation.y += 0.012;
          radar3DGroup.rotation.x = Math.sin(time * 0.6) * 0.2;
        }

        spiderMesh.rotation.z = time * 0.08;
        coreMesh.rotation.y = -time * 0.15;

        // Node crystals oscillate along their axis
        axisNodes.forEach((node, idx) => {
          const s = 1 + Math.sin(time * 3 + idx) * 0.25;
          node.scale.set(s, s, s);
        });

        camera.position.x += (currentParallax.x * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (currentParallax.y * 0.5 - camera.position.y) * 0.05;
        camera.position.z += (21.0 - camera.position.z) * 0.05;
        camera.lookAt(0, 0, 0);
      }

      // Raycasting for Pin Hover Interaction
      if (probeMaster.visible) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pins);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (onPinHover) onPinHover(hit.userData.spec);
        } else {
          if (onPinHover) onPinHover(null);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMoveDrag);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    />
  );
}
