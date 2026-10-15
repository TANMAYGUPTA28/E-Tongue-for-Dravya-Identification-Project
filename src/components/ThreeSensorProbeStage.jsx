import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ELECTRODE_SPECS = [
  { id: 'WE1', name: 'Lipid Bio-Membrane', material: 'Lipid Bilayer / Au substrate', rasa: 'Madhura (Sweet)', color: 0x14b8a6, colorHex: '#14B8A6', targetV: '0.722V', angle: 0 },
  { id: 'WE2', name: 'Polyaniline Composite', material: 'PANI Conducting Polymer', rasa: 'Amla (Sour)', color: 0x0ea5e9, colorHex: '#0EA5E9', targetV: '0.384V', angle: 60 },
  { id: 'WE3', name: 'Chitosan Hydrogel', material: 'Cross-linked Chitosan Matrix', rasa: 'Lavana (Salty)', color: 0x3b82f6, colorHex: '#3B82F6', targetV: '0.450V', angle: 120 },
  { id: 'WE4', name: 'Phthalocyanine Complex', material: 'Cobalt Phthalocyanine (CoPc)', rasa: 'Tikta (Bitter)', color: 0xf59e0b, colorHex: '#F59E0B', targetV: '2.777V', angle: 180 },
  { id: 'WE5', name: 'Crown Ether Ionophore', material: '18-Crown-6 / PVC Matrix', rasa: 'Katu (Pungent)', color: 0x8b5cf6, colorHex: '#8B5CF6', targetV: '1.151V', angle: 240 },
  { id: 'WE6', name: 'Ruthenium Oxide Micro-film', material: 'Hydrous RuOx / Glassy Carbon', rasa: 'Kashaya (Astringent)', color: 0x10b981, colorHex: '#10B981', targetV: '2.352V', angle: 300 },
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
    // 1. SCENE, CAMERA & RENDERER (STUDIO CALIBER PBR PIPELINE)
    // =========================================================================
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b0e, 0.012);

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 25);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 2. PROCEDURAL HIGH-RESOLUTION STUDIO ENVIRONMENT MAP
    //    (Accurate metallic anistropic sheens and glass caustic reflections)
    // =========================================================================
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const envCtx = envCanvas.getContext('2d');

    // Smooth deep charcoal gradient background
    const bgGrad = envCtx.createLinearGradient(0, 0, 0, 512);
    bgGrad.addColorStop(0, '#04070a');
    bgGrad.addColorStop(0.3, '#0b1117');
    bgGrad.addColorStop(0.7, '#070c10');
    bgGrad.addColorStop(1, '#030508');
    envCtx.fillStyle = bgGrad;
    envCtx.fillRect(0, 0, 1024, 512);

    // Overhead diffuse softbox panel (pure white 6500K)
    envCtx.fillStyle = '#ffffff';
    envCtx.shadowColor = '#d1d5db';
    envCtx.shadowBlur = 40;
    envCtx.fillRect(280, 20, 220, 110);

    // Soft cold lateral strip light (laboratory rim highlight)
    envCtx.fillStyle = '#e2e8f0';
    envCtx.shadowColor = '#94a3b8';
    envCtx.shadowBlur = 50;
    envCtx.fillRect(720, 60, 60, 260);

    // Warm amber counter-bounce (representing herbal sample reflections)
    envCtx.fillStyle = '#b45309';
    envCtx.shadowColor = '#d97706';
    envCtx.shadowBlur = 45;
    envCtx.fillRect(80, 260, 90, 160);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

    // =========================================================================
    // 3. LABORATORY 3-POINT STUDIO LIGHTING
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0e171f, 1.4);
    scene.add(ambientLight);

    // Key Light: Crisp directional daylight
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 3.2);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Fill Light: Soft neutral fill
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.2);
    fillLight.position.set(-14, 8, 12);
    scene.add(fillLight);

    // Rim Light: Cool blue-gray edge separator
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLight.position.set(0, -6, -14);
    scene.add(rimLight);

    // Sample Internal Caustic Light
    const sampleGlow = new THREE.PointLight(0xd97706, 1.8, 16);
    sampleGlow.position.set(0, -5, 0);
    scene.add(sampleGlow);

    // =========================================================================
    // 4. MASTER PBR MATERIAL REPOSITORY (REAL METROHM / GAMRY HARDWARE AESTHETIC)
    // =========================================================================
    const darkTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x151a21,
      metalness: 0.92,
      roughness: 0.22,
    });

    const brushedChromeMat = new THREE.MeshStandardMaterial({
      color: 0xd8e0ea,
      metalness: 0.98,
      roughness: 0.12,
    });

    const knurledSteelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.38,
    });

    const aerospaceGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.96,
      roughness: 0.16,
    });

    const glassyCarbonMat = new THREE.MeshStandardMaterial({
      color: 0x080a0c,
      metalness: 0.85,
      roughness: 0.06,
    });

    const teflonHeadMat = new THREE.MeshStandardMaterial({
      color: 0x1f252d,
      metalness: 0.15,
      roughness: 0.42,
    });

    const labBenchMat = new THREE.MeshStandardMaterial({
      color: 0x070c10,
      metalness: 0.4,
      roughness: 0.6,
    });

    // =========================================================================
    // 5. LABORATORY RETORT STAND & MICROMETER ELEVATION CLAMP
    // =========================================================================
    const standGroup = new THREE.Group();
    scene.add(standGroup);

    // Heavy Cast Laboratory Bench Base Plate
    const basePlateGeom = new THREE.BoxGeometry(16, 0.7, 13);
    const basePlate = new THREE.Mesh(basePlateGeom, darkTitaniumMat);
    basePlate.position.set(0, -11.5, 0);
    basePlate.receiveShadow = true;
    standGroup.add(basePlate);

    // Inset Anodized Work Area Pad
    const padGeom = new THREE.BoxGeometry(14.8, 0.05, 11.8);
    const pad = new THREE.Mesh(padGeom, labBenchMat);
    pad.position.set(0, -11.12, 0);
    pad.receiveShadow = true;
    standGroup.add(pad);

    // Beveled Rubber Foot Pads
    [[-7, -5], [7, -5], [-7, 5], [7, 5]].forEach(([x, z]) => {
      const footG = new THREE.CylinderGeometry(0.6, 0.7, 0.25, 24);
      const footM = new THREE.MeshStandardMaterial({ color: 0x020406, roughness: 0.9 });
      const foot = new THREE.Mesh(footG, footM);
      foot.position.set(x, -11.95, z);
      standGroup.add(foot);
    });

    // Precision Vertical Support Pillar (Polished Chrome)
    const pillarGeom = new THREE.CylinderGeometry(0.38, 0.38, 24, 32);
    const pillarMesh = new THREE.Mesh(pillarGeom, brushedChromeMat);
    pillarMesh.position.set(0, 0.5, -5.2);
    pillarMesh.castShadow = true;
    standGroup.add(pillarMesh);

    // Heavy Mounting Boss-Head Collar on Pillar
    const bossHeadGeom = new THREE.CylinderGeometry(0.7, 0.7, 2.2, 32);
    const bossHead = new THREE.Mesh(bossHeadGeom, darkTitaniumMat);
    bossHead.position.set(0, 4.5, -5.2);
    standGroup.add(bossHead);

    // Knurled Locking Thumb Screw on Boss Head
    const thumbScrewGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 24);
    const thumbScrew = new THREE.Mesh(thumbScrewGeom, knurledSteelMat);
    thumbScrew.rotation.x = Math.PI / 2;
    thumbScrew.position.set(0, 4.5, -4.2);
    standGroup.add(thumbScrew);

    // Horizontal Stainless Steel Extension Arm holding the probe
    const armGeom = new THREE.CylinderGeometry(0.24, 0.24, 5.4, 24);
    const armMesh = new THREE.Mesh(armGeom, brushedChromeMat);
    armMesh.rotation.x = Math.PI / 2;
    armMesh.position.set(0, 4.5, -2.5);
    standGroup.add(armMesh);

    // Precision Clamp Collar gripping the probe
    const probeClampGeom = new THREE.CylinderGeometry(1.65, 1.65, 1.4, 32);
    const probeClamp = new THREE.Mesh(probeClampGeom, darkTitaniumMat);
    probeClamp.position.set(0, 4.5, 0);
    standGroup.add(probeClamp);

    // Clamp adjustment thumb knobs
    const knobG = new THREE.CylinderGeometry(0.35, 0.35, 0.5, 24);
    const knob1 = new THREE.Mesh(knobG, knurledSteelMat);
    knob1.rotation.z = Math.PI / 2;
    knob1.position.set(1.9, 4.5, 0);
    standGroup.add(knob1);

    // =========================================================================
    // 6. PRECISION SENSOR PROBE ASSEMBLY (DRAVYA 6000 ELECTROCHEMISTRY HEAD)
    // =========================================================================
    const probeMaster = new THREE.Group();
    scene.add(probeMaster);

    // Procedural High-Definition Laboratory OLED Display Texture
    const oledCanvas = document.createElement('canvas');
    oledCanvas.width = 512;
    oledCanvas.height = 256;
    const oledCtx = oledCanvas.getContext('2d');
    const oledTexture = new THREE.CanvasTexture(oledCanvas);

    // Braided Carbon Umbilical Signal Cable exiting top of probe
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 9.8, 0),
      new THREE.Vector3(0.4, 11.2, -0.6),
      new THREE.Vector3(0.2, 12.8, -2.4),
      new THREE.Vector3(0, 13.5, -4.8),
      new THREE.Vector3(0, 12.0, -5.2),
    ]);
    const cableGeom = new THREE.TubeGeometry(cableCurve, 32, 0.16, 12, false);
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x11161d,
      roughness: 0.6,
      metalness: 0.2,
    });
    const cableMesh = new THREE.Mesh(cableGeom, cableMat);
    probeMaster.add(cableMesh);

    // Top Strain Relief Cable Gland
    const glandGeom = new THREE.CylinderGeometry(0.45, 0.7, 1.0, 32);
    const glandMesh = new THREE.Mesh(glandGeom, knurledSteelMat);
    glandMesh.position.set(0, 9.5, 0);
    probeMaster.add(glandMesh);

    // Upper Anodized Beveled Probe Cap
    const capGeom = new THREE.CylinderGeometry(0.75, 1.4, 0.8, 48);
    const capMesh = new THREE.Mesh(capGeom, brushedChromeMat);
    capMesh.position.set(0, 8.8, 0);
    probeMaster.add(capMesh);

    // Upper Fine-Knurled Adjustment Ring
    const knurlTopGeom = new THREE.CylinderGeometry(1.44, 1.44, 0.75, 48);
    const knurlTop = new THREE.Mesh(knurlTopGeom, knurledSteelMat);
    knurlTop.position.set(0, 8.1, 0);
    probeMaster.add(knurlTop);

    // Main Cylindrical Aerospace Titanium Body
    const bodyGeom = new THREE.CylinderGeometry(1.38, 1.38, 5.8, 48);
    const bodyMesh = new THREE.Mesh(bodyGeom, darkTitaniumMat);
    bodyMesh.position.set(0, 4.8, 0);
    bodyMesh.castShadow = true;
    probeMaster.add(bodyMesh);

    // Laser-Engraved Identification Badge on Probe Body
    const badgeGeom = new THREE.CylinderGeometry(1.39, 1.39, 1.2, 48, 1, true, -Math.PI / 4, Math.PI / 2);
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 512;
    badgeCanvas.height = 128;
    const bCtx = badgeCanvas.getContext('2d');
    bCtx.fillStyle = '#151a21';
    bCtx.fillRect(0, 0, 512, 128);
    bCtx.fillStyle = '#94a3b8';
    bCtx.font = 'bold 26px monospace';
    bCtx.fillText('DRAVYA 6000 // ISO 17025', 28, 48);
    bCtx.font = '18px monospace';
    bCtx.fillStyle = '#64748b';
    bCtx.fillText('6-CH VOLTAMMETRIC ELECTRODE HEAD', 28, 86);
    const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: badgeTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const badgeMesh = new THREE.Mesh(badgeGeom, badgeMat);
    badgeMesh.position.set(0, 6.6, 0);
    probeMaster.add(badgeMesh);

    // High-Precision Integrated OLED Diagnostic Display Bezel
    const oledGeom = new THREE.CylinderGeometry(1.405, 1.405, 2.4, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const oledMat = new THREE.MeshBasicMaterial({
      map: oledTexture,
      transparent: true,
      opacity: 0.98,
      side: THREE.DoubleSide,
    });
    const oledMesh = new THREE.Mesh(oledGeom, oledMat);
    oledMesh.position.set(0, 4.5, 0);
    probeMaster.add(oledMesh);

    // Lower Knurled Grip Ring
    const knurlBottomGeom = new THREE.CylinderGeometry(1.44, 1.44, 0.75, 48);
    const knurlBottom = new THREE.Mesh(knurlBottomGeom, knurledSteelMat);
    knurlBottom.position.set(0, 1.5, 0);
    probeMaster.add(knurlBottom);

    // Gold-Plated Potentiostat Transition Collar
    const collarGeom = new THREE.CylinderGeometry(1.38, 1.15, 1.0, 48);
    const collarMesh = new THREE.Mesh(collarGeom, aerospaceGoldMat);
    collarMesh.position.set(0, 0.65, 0);
    probeMaster.add(collarMesh);

    // Tapered Chemically-Resistant PEEK Sensor Cartridge Head
    const cartridgeGeom = new THREE.CylinderGeometry(1.15, 0.95, 1.4, 48);
    const cartridgeMesh = new THREE.Mesh(cartridgeGeom, teflonHeadMat);
    cartridgeMesh.position.set(0, -0.55, 0);
    probeMaster.add(cartridgeMesh);

    // Planar Ceramic Electrode Faceplate Disc
    const faceplateGeom = new THREE.CylinderGeometry(0.95, 0.95, 0.25, 48);
    const faceplateMesh = new THREE.Mesh(faceplateGeom, darkTitaniumMat);
    faceplateMesh.position.set(0, -1.35, 0);
    probeMaster.add(faceplateMesh);

    // =========================================================================
    // 7. PRECISION 6-CHANNEL MICRO-DISC ELECTRODE ARRAY + REFERENCE PIN
    // =========================================================================
    const pins = [];
    const electrodeRadius = 0.58;

    // Central Silver / Silver-Chloride (Ag/AgCl) Reference Electrode with ceramic frit
    const refCollarG = new THREE.CylinderGeometry(0.16, 0.16, 0.35, 24);
    const refCollarM = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const refCollar = new THREE.Mesh(refCollarG, refCollarM);
    refCollar.position.set(0, -1.5, 0);
    probeMaster.add(refCollar);

    const refTipG = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 24);
    const refTipM = new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.4, roughness: 0.3 });
    const refTip = new THREE.Mesh(refTipG, refTipM);
    refTip.position.set(0, -1.7, 0);
    probeMaster.add(refTip);

    ELECTRODE_SPECS.forEach((spec, i) => {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * electrodeRadius;
      const z = Math.sin(angle) * electrodeRadius;

      // Outer Gold Contact Collar
      const collarG = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 20);
      const collarM = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.95,
        roughness: 0.18,
      });
      const collar = new THREE.Mesh(collarG, collarM);
      collar.position.set(x, -1.48, z);
      probeMaster.add(collar);

      // Micro-Disc Active Surface
      const discG = new THREE.CylinderGeometry(0.11, 0.11, 0.35, 20);
      let discMat;
      if (spec.id === 'WE1') {
        // Lipid bio-membrane: iridescent emerald sheen
        discMat = new THREE.MeshStandardMaterial({ color: 0x14b8a6, metalness: 0.6, roughness: 0.2 });
      } else if (spec.id === 'WE2') {
        // Polyaniline: conductive polymer deep blue
        discMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
      } else if (spec.id === 'WE3') {
        // Chitosan: translucent hydrogel
        discMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.4, roughness: 0.25 });
      } else if (spec.id === 'WE4') {
        // Phthalocyanine: deep amber/copper
        discMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      } else if (spec.id === 'WE5') {
        // Crown ether: purple ion-selective
        discMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, metalness: 0.5, roughness: 0.3 });
      } else {
        // Ruthenium oxide: deep lustrous glassy carbon
        discMat = glassyCarbonMat;
      }

      const discMesh = new THREE.Mesh(discG, discMat);
      discMesh.position.set(x, -1.55, z);
      discMesh.userData = { index: i, spec };
      probeMaster.add(discMesh);
      pins.push(discMesh);
    });

    // Subtle Micro-Luminescent Double-Layer Aura at electrode interface (activates on dip)
    const auraGeom = new THREE.RingGeometry(0.1, 0.9, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const auraRing = new THREE.Mesh(auraGeom, auraMat);
    auraRing.rotation.x = Math.PI / 2;
    auraRing.position.set(0, -1.65, 0);
    probeMaster.add(auraRing);

    // =========================================================================
    // 8. BOROSILICATE GLASS LABORATORY BEAKER & DRAVYA FLUID
    // =========================================================================
    const beakerGroup = new THREE.Group();
    beakerGroup.position.set(0, -6.8, 0);
    scene.add(beakerGroup);

    // Accurate Glass Beaker Geometry (Cylinder with wall thickness & rounded lip)
    const beakerOuterGeom = new THREE.CylinderGeometry(4.2, 4.0, 8.8, 64, 1, true);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 0.4,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 1.4,
      reflectivity: 0.92,
      specularIntensity: 1.0,
    });
    const beakerMesh = new THREE.Mesh(beakerOuterGeom, glassMaterial);
    beakerGroup.add(beakerMesh);

    // Beaker Thick Glass Bottom Base
    const beakerBaseGeom = new THREE.CylinderGeometry(4.0, 4.0, 0.4, 64);
    const beakerBase = new THREE.Mesh(beakerBaseGeom, glassMaterial);
    beakerBase.position.y = -4.2;
    beakerGroup.add(beakerBase);

    // Beaker Curved Top Pour Lip Rim
    const rimGeom = new THREE.TorusGeometry(4.2, 0.09, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeom, glassMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 4.4;
    beakerGroup.add(rimMesh);

    // Beaker White Ceramic Graduation Marks (50mL, 100mL, 150mL, 200mL, 250mL)
    const graduationsCanvas = document.createElement('canvas');
    graduationsCanvas.width = 512;
    graduationsCanvas.height = 512;
    const gCtx = graduationsCanvas.getContext('2d');
    gCtx.clearRect(0, 0, 512, 512);
    gCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    gCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    gCtx.lineWidth = 3;
    gCtx.font = 'bold 22px sans-serif';

    const graduationLevels = [
      { y: 390, ml: '50 mL' },
      { y: 310, ml: '100 mL' },
      { y: 230, ml: '150 mL' },
      { y: 150, ml: '200 mL' },
      { y: 70, ml: '250 mL' },
    ];
    graduationLevels.forEach(({ y, ml }) => {
      gCtx.beginPath();
      gCtx.moveTo(40, y);
      gCtx.lineTo(95, y);
      gCtx.stroke();
      gCtx.fillText(ml, 110, y + 7);
    });

    const gradTexture = new THREE.CanvasTexture(graduationsCanvas);
    const gradGeom = new THREE.CylinderGeometry(4.21, 4.01, 8.7, 64, 1, true, -Math.PI / 6, Math.PI / 2.5);
    const gradMat = new THREE.MeshBasicMaterial({
      map: gradTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const gradMesh = new THREE.Mesh(gradGeom, gradMat);
    beakerGroup.add(gradMesh);

    // Authentic Herbal Extract Solution (Rich Golden-Amber Decoction / Kashayam)
    const liquidGeom = new THREE.CylinderGeometry(4.08, 3.92, 6.4, 48);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xc2781a,
      emissive: 0x78350f,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.88,
      roughness: 0.1,
      transmission: 0.76,
      ior: 1.34,
    });
    const liquidMesh = new THREE.Mesh(liquidGeom, liquidMat);
    liquidMesh.position.y = -0.9;
    beakerGroup.add(liquidMesh);

    // Realistic Fluid Surface Meniscus Disk
    const meniscusGeom = new THREE.RingGeometry(0.1, 4.05, 48);
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
    });
    const meniscusMesh = new THREE.Mesh(meniscusGeom, meniscusMat);
    meniscusMesh.rotation.x = -Math.PI / 2;
    meniscusMesh.position.y = 2.25;
    beakerGroup.add(meniscusMesh);

    // =========================================================================
    // 9. SECTION 4: CALIBRATED 6-AXIS CHEMOMETRIC VOLTAMMETRIC RADAR
    //    (Replaces the cartoon spider cage with a true analytical radar grid)
    // =========================================================================
    const radar3DGroup = new THREE.Group();
    radar3DGroup.position.set(0, 0, 0);
    radar3DGroup.visible = false;
    scene.add(radar3DGroup);

    // Concentric Calibration Rings (0.5V, 1.0V, 2.0V, 3.0V scale)
    [2.2, 4.4, 6.6, 8.5].forEach((r, idx) => {
      const ringG = new THREE.RingGeometry(r - 0.02, r + 0.02, 64);
      const ringM = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: idx === 3 ? 0.45 : 0.2,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringG, ringM);
      radar3DGroup.add(ring);
    });

    // 6 Spatial Radiating Calibrated Measurement Axes
    const radarLines = [];
    ELECTRODE_SPECS.forEach((spec, i) => {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle) * 8.5;
      const y = Math.sin(angle) * 8.5;

      const axisGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, 0),
      ]);
      const axisMat = new THREE.LineBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.75,
      });
      const axisLine = new THREE.Line(axisGeom, axisMat);
      radar3DGroup.add(axisLine);

      // Precision Calibrated Axis Node (Spherical Jewel Bead)
      const nodeG = new THREE.SphereGeometry(0.24, 24, 24);
      const nodeM = new THREE.MeshStandardMaterial({
        color: spec.color,
        emissive: spec.color,
        emissiveIntensity: 0.6,
        metalness: 0.9,
      });
      const node = new THREE.Mesh(nodeG, nodeM);
      node.position.set(x, y, 0);
      radar3DGroup.add(node);
      radarLines.push(node);
    });

    // Voltammetric Fingerprint Polygon (Connecting current potential points)
    const radarPolyGeom = new THREE.BufferGeometry();
    const radarPolyMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const radarPoly = new THREE.Mesh(radarPolyGeom, radarPolyMat);
    radar3DGroup.add(radarPoly);

    // =========================================================================
    // 10. MOUSE INTERACTION & ORBIT CONTROL
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
      targetParallax.x = nx * 2.8;
      targetParallax.y = ny * 1.6;
    };

    container.addEventListener('mousemove', onPointerMove);

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
        radar3DGroup.rotation.y += deltaX * 0.008;
        radar3DGroup.rotation.x += deltaY * 0.008;
      } else {
        probeMaster.rotation.y += deltaX * 0.008;
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
    // 11. OLED DIAGNOSTIC SCREEN PAINTER
    // =========================================================================
    const drawOledScreen = (time, activeSection) => {
      oledCtx.fillStyle = '#0a0e14';
      oledCtx.fillRect(0, 0, 512, 256);

      // Fine oscilloscope background grid
      oledCtx.strokeStyle = 'rgba(74, 222, 128, 0.1)';
      oledCtx.lineWidth = 1;
      for (let x = 0; x < 512; x += 32) {
        oledCtx.beginPath();
        oledCtx.moveTo(x, 0);
        oledCtx.lineTo(x, 256);
        oledCtx.stroke();
      }
      for (let y = 0; y < 256; y += 32) {
        oledCtx.beginPath();
        oledCtx.moveTo(0, y);
        oledCtx.lineTo(512, y);
        oledCtx.stroke();
      }

      // Diagnostic Title & Status
      oledCtx.fillStyle = '#10b981';
      oledCtx.font = 'bold 20px monospace';
      oledCtx.fillText('DRAVYA 6000 POTENTIOSTAT', 24, 38);

      oledCtx.fillStyle = '#94a3b8';
      oledCtx.font = '14px monospace';
      oledCtx.fillText(`T = 24.6°C (COMP ON) | 250 S/s`, 24, 64);

      // Live Cyclic Voltammetric / Transient Potential Curve
      oledCtx.beginPath();
      oledCtx.strokeStyle = '#38bdf8';
      oledCtx.lineWidth = 2.5;
      for (let x = 0; x < 512; x += 4) {
        const decay = Math.exp(-x / 300);
        const wave =
          Math.sin(x * 0.05 + time * 5) * 22 * decay +
          Math.cos(x * 0.02 - time * 2) * 10;
        const y = 145 + wave;
        if (x === 0) oledCtx.moveTo(x, y);
        else oledCtx.lineTo(x, y);
      }
      oledCtx.stroke();

      // Channel Readouts
      oledCtx.fillStyle = '#f59e0b';
      oledCtx.font = 'bold 15px monospace';
      oledCtx.fillText('WE1: 0.722V  WE2: 0.384V  WE4: 2.777V', 24, 210);

      oledCtx.fillStyle = '#10b981';
      oledCtx.font = '13px monospace';
      oledCtx.fillText(
        `STATUS: ${activeSection === 1 ? 'IMMERSION / DOUBLE-LAYER EQUILIBRIUM' : activeSection === 3 ? '6-AXIS RASA RADAR VIEW' : 'READY // STANDBY INSPECTION'}`,
        24,
        236
      );

      oledTexture.needsUpdate = true;
    };

    // =========================================================================
    // 12. 60 FPS RENDER LOOP & LABORATORY CHOREOGRAPHY
    // =========================================================================
    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const { activeSection, isDipping } = stateRef.current;

      drawOledScreen(time, activeSection);

      currentParallax.x += (targetParallax.x - currentParallax.x) * 0.05;
      currentParallax.y += (targetParallax.y - currentParallax.y) * 0.05;

      // Section-based Stage Choreography
      if (activeSection === 0) {
        // Section 1: Standby / Hero Inspection
        probeMaster.visible = true;
        beakerGroup.visible = true;
        radar3DGroup.visible = false;
        standGroup.visible = true;

        // Realistic hovering height above liquid meniscus
        const targetY = isDipping ? -3.4 : 1.2;
        probeMaster.position.y += (targetY - probeMaster.position.y) * 0.08;
        if (!isDragging) {
          probeMaster.rotation.y = Math.sin(time * 0.4) * 0.12;
        }

        auraMat.opacity = Math.max(0, auraMat.opacity - 0.05);

        camera.position.x += (currentParallax.x - camera.position.x) * 0.05;
        camera.position.y += (3.5 + currentParallax.y - camera.position.y) * 0.05;
        camera.position.z += (25.0 - camera.position.z) * 0.05;
        camera.lookAt(0, -0.5, 0);

      } else if (activeSection === 1) {
        // Section 2: Precision Immersion Dip
        probeMaster.visible = true;
        beakerGroup.visible = true;
        radar3DGroup.visible = false;
        standGroup.visible = true;

        // Submerge electrodes 20mm beneath liquid surface
        const dipTargetY = -3.8;
        probeMaster.position.y += (dipTargetY - probeMaster.position.y) * 0.08;

        // Gentle surface tension ripple
        meniscusMesh.position.y = 2.25 + Math.sin(time * 6) * 0.04;

        // Soft electrochemical double-layer ionic diffusion aura
        auraMat.opacity = 0.45 + Math.sin(time * 4) * 0.15;

        // Close-up inspection camera view of electrode-fluid interface
        camera.position.x += (currentParallax.x * 0.5 + 2.0 - camera.position.x) * 0.05;
        camera.position.y += (-2.5 + currentParallax.y * 0.5 - camera.position.y) * 0.05;
        camera.position.z += (15.0 - camera.position.z) * 0.05;
        camera.lookAt(0, -3.2, 0);

      } else if (activeSection === 2) {
        // Section 3: Voltammetric Assay Acquisition
        probeMaster.visible = true;
        beakerGroup.visible = true;
        radar3DGroup.visible = false;
        standGroup.visible = true;

        probeMaster.position.y += (-3.6 - probeMaster.position.y) * 0.08;
        if (!isDragging) {
          probeMaster.rotation.y = time * 0.15;
        }

        auraMat.opacity = 0.6 + Math.sin(time * 5) * 0.2;

        // Smooth 45-degree laboratory orbit
        const camOrbitX = Math.cos(time * 0.2) * 19;
        const camOrbitZ = Math.sin(time * 0.2) * 19;
        camera.position.x += (camOrbitX - camera.position.x) * 0.05;
        camera.position.y += (4.0 - camera.position.y) * 0.05;
        camera.position.z += (camOrbitZ - camera.position.z) * 0.05;
        camera.lookAt(0, -1.0, 0);

      } else if (activeSection === 3) {
        // Section 4: 6-Axis Chemometric Radar
        probeMaster.visible = false;
        beakerGroup.visible = false;
        radar3DGroup.visible = true;
        standGroup.visible = false;

        if (!isDragging) {
          radar3DGroup.rotation.y += 0.008;
          radar3DGroup.rotation.x = Math.sin(time * 0.5) * 0.1;
        }

        // Dynamic update of radar polygon based on live potentials
        const polyPoints = [];
        ELECTRODE_SPECS.forEach((spec, idx) => {
          const angle = (idx * Math.PI * 2) / 6;
          const v = [0.72, 0.38, 0.45, 2.78, 1.15, 2.35][idx] || 1.5;
          const r = (v / 3.3) * 8.0;
          polyPoints.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
        });
        radarPolyGeom.setFromPoints(polyPoints);

        camera.position.x += (currentParallax.x * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (currentParallax.y * 0.5 - camera.position.y) * 0.05;
        camera.position.z += (20.0 - camera.position.z) * 0.05;
        camera.lookAt(0, 0, 0);
      }

      // Micro-electrode raycasting for interactive hover details
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
