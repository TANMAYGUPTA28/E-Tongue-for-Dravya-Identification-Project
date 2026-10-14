import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Antaragni3DCanvas({ interactive = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Central Holographic Biomimetic Sensor Core (3D Geometric Crystal)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner wireframe icosahedron
    const coreGeometry = new THREE.IcosahedronGeometry(7, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(coreMesh);

    // Inner solid glowing dodecahedron with Fresnel-like glow
    const innerGeom = new THREE.DodecahedronGeometry(4.5, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerMesh);

    // 3. 6 Rotating Orbital Quantum Rings (Representing 6 Working Electrodes)
    const rings = [];
    const ringColors = [0x2dd4bf, 0x38bdf8, 0x2563eb, 0xd97706, 0xa855f7, 0x10b981];

    ringColors.forEach((color, i) => {
      const ringGeom = new THREE.TorusGeometry(10 + i * 1.5, 0.05, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = (Math.PI / 6) * i;
      ring.rotation.y = (Math.PI / 4) * i;
      coreGroup.add(ring);
      rings.push({ mesh: ring, speed: (i % 2 === 0 ? 1 : -1) * (0.003 + i * 0.001) });
    });

    // 4. Floating 3D Starfield / Bio-Aerosol Particles (1,500 particles)
    const particleCount = 1500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0x2dd4bf),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xa855f7),
      new THREE.Color(0x34d399),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 5. Mouse Interaction & Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      if (!interactive) return;
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    // 6. Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', onResize);

    // 7. 60 FPS Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow (spring physics)
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      coreGroup.rotation.y = elapsedTime * 0.2 + targetX * 0.8;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.2 + targetY * 0.6;
      coreGroup.position.y = Math.sin(elapsedTime * 0.6) * 0.8;

      // Rotate individual orbital rings
      rings.forEach(({ mesh, speed }) => {
        mesh.rotation.z += speed;
      });

      // Slowly rotate particle field
      particleSystem.rotation.y = elapsedTime * 0.03;
      particleSystem.rotation.x = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
    />
  );
}
