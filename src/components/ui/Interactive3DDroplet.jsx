import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Interactive3DDroplet({ isWaveformMode = false }) {
  const mountRef = useRef(null);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    // Check for low-power or mobile
    if (window.innerWidth < 640 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsLowPower(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Procedural Studio Environment for Glass Transmission
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const ctx = envCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#07100B');
    grad.addColorStop(0.5, '#173620');
    grad.addColorStop(1, '#07100B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Softbox highlight bars
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(150, 40, 100, 80);
    ctx.fillStyle = '#B6F36A';
    ctx.fillRect(350, 80, 60, 120);

    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTexture;

    // 3. Lighting
    const keyLight = new THREE.DirectionalLight(0xB6F36A, 2.5);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xE0A03A, 2.0);
    fillLight.position.set(-5, -3, 2);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xEDEFE8, 0.8);
    scene.add(ambientLight);

    // 4. Photorealistic Glass Droplet Blob Geometry & Material
    // Subdivided Sphere with vertex storage for morphing
    const geometry = new THREE.IcosahedronGeometry(2.1, 48);
    const originalPositions = geometry.attributes.position.clone();

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3E7B4C,
      emissive: 0x1A3821,
      emissiveIntensity: 0.35,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.88,
      ior: 1.48,
      thickness: 1.8,
      specularIntensity: 1.0,
      specularColor: 0xB6F36A,
      transparent: true,
      opacity: 0.92,
    });

    const dropletMesh = new THREE.Mesh(geometry, glassMaterial);
    scene.add(dropletMesh);

    // 5. Orbiting Quantum Sensor Ring
    const ringGeom = new THREE.TorusGeometry(3.1, 0.035, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xB6F36A,
      transparent: true,
      opacity: 0.45,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // Secondary Warm Amber Ring
    const ringGeom2 = new THREE.TorusGeometry(3.35, 0.025, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xE0A03A,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh2 = new THREE.Mesh(ringGeom2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    scene.add(ringMesh2);

    // 6. Mouse Interaction & Physics
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = nx * 1.5;
      mouse.targetY = ny * 1.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop with Organic Perlin/Sinusoidal Morphing
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      dropletMesh.rotation.y = time * 0.18 + mouse.x * 0.3;
      dropletMesh.rotation.x = time * 0.12 - mouse.y * 0.3;

      ringMesh.rotation.z = time * 0.25;
      ringMesh2.rotation.z = -time * 0.2;

      // Morph vertices into organic liquid blob or sensor waveform
      const posAttr = geometry.attributes.position;
      const origPos = originalPositions.array;
      const currentPos = posAttr.array;

      for (let i = 0; i < currentPos.length; i += 3) {
        const ox = origPos[i];
        const oy = origPos[i + 1];
        const oz = origPos[i + 2];

        // Normalised radius
        const length = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const nx = ox / length;
        const ny = oy / length;
        const nz = oz / length;

        // Multidimensional fluid frequencies
        const wave1 = Math.sin(nx * 3.5 + time * 2.2) * 0.18;
        const wave2 = Math.cos(ny * 4.2 - time * 1.8) * 0.15;
        const wave3 = Math.sin(nz * 3.0 + time * 1.5) * 0.12;

        // Waveform mode produces sharper electrochemical potentiostat spikes
        const waveformSpike = isWaveformMode ? Math.sin(ox * 8.0 + time * 6.0) * 0.3 : 0;

        const displacement = 1 + wave1 + wave2 + wave3 + waveformSpike;

        currentPos[i] = ox * displacement;
        currentPos[i + 1] = oy * displacement;
        currentPos[i + 2] = oz * displacement;
      }

      posAttr.needsUpdate = true;
      geometry.computeVertexNormals();

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      glassMaterial.dispose();
    };
  }, [isWaveformMode]);

  if (isLowPower) {
    // Beautiful lightweight fallback for low-power / small screens
    return (
      <div className="relative w-full h-full flex items-center justify-center select-none">
        <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-[#3E7B4C] via-[#529662] to-[#B6F36A] opacity-75 blur-2xl animate-pulse-slow" />
        <div className="absolute w-44 h-44 rounded-full border border-[#B6F36A]/30 backdrop-blur-xl bg-white/[0.04] flex items-center justify-center shadow-[0_0_50px_rgba(182,243,106,0.25)]">
          <div className="w-24 h-24 rounded-full border border-[#E0A03A]/40 animate-spin-slow" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[420px] lg:min-h-[580px] cursor-grab active:cursor-grabbing"
    />
  );
}
