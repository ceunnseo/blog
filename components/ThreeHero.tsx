'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    /* ========================================
       CONFIGURATION
    ======================================== */
    const CONFIG = {
      // Particle count
      PARTICLE_COUNT: 8000,
      PARTICLE_COUNT_MOBILE: 4000,

      // Colors - white only
      PARTICLE_COLOR: 0xffffff,
      BACKGROUND_COLOR: 0x000000,

      // Camera
      CAMERA_FOV: 45,
      CAMERA_START_Z: 8,
      CAMERA_END_Z: 18,

      // Animation timing (scroll progress breakpoints)
      ACT1_START: 0.0,
      ACT1_END: 0.3,
      ACT2_START: 0.3,
      ACT2_END: 0.65,
      ACT3_START: 0.65,
      ACT3_END: 1.0,

      // Mouse repulsion
      MOUSE_REPULSION_RADIUS: 2.5,
      MOUSE_REPULSION_STRENGTH: 0.5,

      // Particle drift
      DRIFT_SPEED: 0.001,
      DRIFT_AMOUNT: 1.2,
      ROTATION_SPEED: 0.002,

      // Circle dimensions
      CIRCLE_RADIUS: 3,

      // Camera rotation
      ROTATION_SENSITIVITY: 0.002,
      ROTATION_DAMPING: 0.9,

      // Performance
      USE_REDUCED_MOTION:
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      IS_MOBILE: typeof window !== 'undefined' && window.innerWidth < 768,
    };

    // JavaScript syntax tokens
    const JS_TOKENS = [
      'const',
      'let',
      'var',
      'function',
      'return',
      'if',
      'else',
      'for',
      'while',
      'do',
      'switch',
      'case',
      'break',
      'continue',
      'class',
      'extends',
      'new',
      'this',
      'import',
      'export',
      'from',
      'as',
      'async',
      'await',
      'Promise',
      'then',
      'try',
      'catch',
      'throw',
      'finally',
      '=>',
      '{}',
      '[]',
      '()',
      '.',
      ';',
      ':',
      '=',
      '==',
      '===',
      '!',
      '!=',
      '!==',
      '&&',
      '||',
      '+',
      '-',
      '*',
      '/',
      '%',
      '<',
      '>',
      '<=',
      '>=',
      '?',
      'null',
      'undefined',
      'true',
      'false',
    ];

    /* ========================================
       GLOBAL STATE
    ======================================== */
    let scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      renderer: THREE.WebGLRenderer;
    const particleSprites: THREE.Mesh[] = [];
    const startPositions: { x: number; y: number; z: number }[] = [];
    const circlePositions: { x: number; y: number; z: number }[] = [];
    const currentOffsets: { x: number; y: number; z: number }[] = [];
    const driftOffsets: {
      speedX: number;
      speedY: number;
      speedZ: number;
      x: number;
      y: number;
      z: number;
    }[] = [];
    const rotationOffsets: {
      speedX: number;
      speedY: number;
      speedZ: number;
    }[] = [];
    let scrollProgress = 0;
    const mouseNDC = { x: 0, y: 0 };
    const mouse3D = new THREE.Vector3();

    // Camera rotation state (spherical coordinates)
    let cameraTheta = 0;
    let cameraPhi = Math.PI / 2;
    let cameraRadius = CONFIG.CAMERA_START_Z;
    let cameraThetaVelocity = 0;
    let cameraPhiVelocity = 0;

    // Mouse drag state
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    /* ========================================
       UTILITY FUNCTIONS
    ======================================== */
    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    function mix(a: number, b: number, t: number) {
      return a * (1 - t) + b * t;
    }

    function smoothstep(edge0: number, edge1: number, x: number) {
      const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
      return t * t * (3.0 - 2.0 * t);
    }

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function easeOutElastic(t: number) {
      const c4 = (2 * Math.PI) / 3;
      return t === 0
        ? 0
        : t === 1
          ? 1
          : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    /* ========================================
       TEXT PLANE CREATION
    ======================================== */
    function createTextPlane(text: string) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;

      canvas.width = 256;
      canvas.height = 128;

      context.fillStyle = 'rgba(0, 0, 0, 0)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.font = 'bold 48px monospace';
      context.fillStyle = '#ffffff';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const geometry = new THREE.PlaneGeometry(0.5, 0.25);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.rotation.x = Math.random() * Math.PI * 2;
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.rotation.z = Math.random() * Math.PI * 2;

      return mesh;
    }

    /* ========================================
       CIRCLE SHAPE GENERATION
    ======================================== */
    function generateCirclePositions() {
      const positions: { x: number; y: number; z: number }[] = [];
      const radius = CONFIG.CIRCLE_RADIUS;
      const samples = CONFIG.IS_MOBILE ? 1500 : 2500;

      const phi = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        positions.push({
          x: x * radius,
          y: y * radius,
          z: z * radius,
        });
      }

      return positions;
    }

    /* ========================================
       PARTICLE SYSTEM
    ======================================== */
    function createParticles() {
      const particleCount = CONFIG.IS_MOBILE
        ? CONFIG.PARTICLE_COUNT_MOBILE
        : CONFIG.PARTICLE_COUNT;

      const sampledPositions = generateCirclePositions();

      for (let i = 0; i < particleCount; i++) {
        const token = JS_TOKENS[Math.floor(Math.random() * JS_TOKENS.length)];
        const sprite = createTextPlane(token);

        const startPos = {
          x: (Math.random() - 0.5) * 25,
          y: (Math.random() - 0.5) * 25,
          z: (Math.random() - 0.5) * 15,
        };
        startPositions.push(startPos);

        const targetIndex = i % sampledPositions.length;
        const targetPos = { ...sampledPositions[targetIndex] };
        circlePositions.push(targetPos);

        sprite.position.set(startPos.x, startPos.y, startPos.z);

        currentOffsets.push({ x: 0, y: 0, z: 0 });
        driftOffsets.push({
          speedX: (Math.random() - 0.5) * CONFIG.DRIFT_SPEED,
          speedY: (Math.random() - 0.5) * CONFIG.DRIFT_SPEED,
          speedZ: (Math.random() - 0.5) * CONFIG.DRIFT_SPEED,
          x: 0,
          y: 0,
          z: 0,
        });
        rotationOffsets.push({
          speedX: (Math.random() - 0.5) * CONFIG.ROTATION_SPEED,
          speedY: (Math.random() - 0.5) * CONFIG.ROTATION_SPEED,
          speedZ: (Math.random() - 0.5) * CONFIG.ROTATION_SPEED,
        });

        scene.add(sprite);
        particleSprites.push(sprite);
      }
    }

    function updateParticles() {
      if (particleSprites.length === 0) return;

      const tA = smoothstep(CONFIG.ACT1_START, CONFIG.ACT1_END, scrollProgress);
      const tB = smoothstep(CONFIG.ACT2_START, CONFIG.ACT2_END, scrollProgress);
      const tC = smoothstep(CONFIG.ACT3_START, CONFIG.ACT3_END, scrollProgress);

      const morphProgress = CONFIG.USE_REDUCED_MOTION ? tB : easeOutCubic(tB);
      const driftActive = CONFIG.USE_REDUCED_MOTION
        ? 0
        : 1 - morphProgress * 0.7;

      for (let i = 0; i < particleSprites.length; i++) {
        const sprite = particleSprites[i];
        const start = startPositions[i];
        const target = circlePositions[i];
        const drift = driftOffsets[i];
        const rotation = rotationOffsets[i];
        const offset = currentOffsets[i];

        drift.x += drift.speedX * driftActive * CONFIG.DRIFT_AMOUNT;
        drift.y += drift.speedY * driftActive * CONFIG.DRIFT_AMOUNT;
        drift.z += drift.speedZ * driftActive * CONFIG.DRIFT_AMOUNT;

        let x = mix(start.x, target.x, morphProgress);
        let y = mix(start.y, target.y, morphProgress);
        let z = mix(start.z, target.z, morphProgress);

        x += drift.x * driftActive;
        y += drift.y * driftActive;
        z += drift.z * driftActive;

        x += offset.x;
        y += offset.y;
        z += offset.z;

        if (morphProgress > 0.7 && !CONFIG.USE_REDUCED_MOTION) {
          const overshoot = easeOutElastic(morphProgress);
          x = mix(start.x, target.x, overshoot) + offset.x;
          y = mix(start.y, target.y, overshoot) + offset.y;
        }

        if (tC > 0.1) {
          const explosionProgress = easeOutCubic(tC);
          const distance = Math.sqrt(
            target.x * target.x + target.y * target.y + target.z * target.z
          );
          const direction = {
            x: target.x / (distance || 1),
            y: target.y / (distance || 1),
            z: target.z / (distance || 1),
          };

          const explosionDistance = explosionProgress * 15;
          x += direction.x * explosionDistance;
          y += direction.y * explosionDistance;
          z += direction.z * explosionDistance;
        }

        sprite.position.set(x, y, z);

        sprite.rotation.x += rotation.speedX;
        sprite.rotation.y += rotation.speedY;
        sprite.rotation.z += rotation.speedZ;

        const scale = mix(1.0, 0.1, tC);
        sprite.scale.set(scale, scale, scale);

        const opacity = mix(0.8, 0.0, tC);
        (sprite.material as THREE.MeshBasicMaterial).opacity = opacity;

        offset.x *= 0.95;
        offset.y *= 0.95;
        offset.z *= 0.95;
      }
    }

    function applyMouseRepulsion() {
      if (particleSprites.length === 0 || CONFIG.USE_REDUCED_MOTION) return;

      const radius = CONFIG.MOUSE_REPULSION_RADIUS;
      const strength = CONFIG.MOUSE_REPULSION_STRENGTH;
      const morphProgress = smoothstep(
        CONFIG.ACT2_START,
        CONFIG.ACT2_END,
        scrollProgress
      );

      for (let i = 0; i < particleSprites.length; i++) {
        const start = startPositions[i];
        const target = circlePositions[i];

        const currentX = mix(start.x, target.x, morphProgress);
        const currentY = mix(start.y, target.y, morphProgress);
        const currentZ = mix(start.z, target.z, morphProgress);

        const dx = currentX - mouse3D.x;
        const dy = currentY - mouse3D.y;
        const dz = currentZ - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        if (dist < radius && dist > 0.01) {
          const falloff = 1 - dist / radius;
          const force = falloff * falloff * strength;

          currentOffsets[i].x += (dx / dist) * force;
          currentOffsets[i].y += (dy / dist) * force;
          currentOffsets[i].z += (dz / dist) * force;
        }
      }
    }

    /* ========================================
       SCROLL HANDLING
    ======================================== */
    function updateScrollProgress() {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      scrollProgress = clamp(scrollY / maxScroll, 0, 1);
    }

    /* ========================================
       CAMERA
    ======================================== */
    function updateCamera() {
      const tB = smoothstep(CONFIG.ACT2_START, CONFIG.ACT2_END, scrollProgress);
      const tC = smoothstep(CONFIG.ACT3_START, CONFIG.ACT3_END, scrollProgress);

      let targetRadius = mix(CONFIG.CAMERA_START_Z, CONFIG.CAMERA_END_Z, tB);
      targetRadius = mix(targetRadius, CONFIG.CAMERA_START_Z - 5, tC);
      cameraRadius = targetRadius;

      cameraThetaVelocity *= CONFIG.ROTATION_DAMPING;
      cameraPhiVelocity *= CONFIG.ROTATION_DAMPING;

      cameraTheta += cameraThetaVelocity;
      cameraPhi += cameraPhiVelocity;

      cameraPhi = clamp(cameraPhi, 0.1, Math.PI - 0.1);

      const x = cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
      const y = cameraRadius * Math.cos(cameraPhi);
      const z = cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);

      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
    }

    /* ========================================
       MOUSE TRACKING
    ======================================== */
    function onMouseDown(event: MouseEvent) {
      isDragging = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }

    function onMouseUp() {
      isDragging = false;
    }

    function onMouseMove(event: MouseEvent) {
      mouseNDC.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(event.clientY / window.innerHeight) * 2 + 1;

      mouse3D.set(
        mouseNDC.x *
          (camera.position.z *
            Math.tan(THREE.MathUtils.degToRad(CONFIG.CAMERA_FOV / 2)) *
            camera.aspect),
        mouseNDC.y *
          (camera.position.z *
            Math.tan(THREE.MathUtils.degToRad(CONFIG.CAMERA_FOV / 2))),
        0
      );

      if (isDragging) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        cameraThetaVelocity += deltaX * CONFIG.ROTATION_SENSITIVITY;
        cameraPhiVelocity += deltaY * CONFIG.ROTATION_SENSITIVITY;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }
    }

    /* ========================================
       RESIZE HANDLING
    ======================================== */
    function onResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    }

    /* ========================================
       ANIMATION LOOP
    ======================================== */
    function animate() {
      requestAnimationFrame(animate);

      updateCamera();
      updateParticles();
      applyMouseRepulsion();

      renderer.render(scene, camera);
    }

    /* ========================================
       INITIALIZATION
    ======================================== */
    function initScene() {
      const canvas = canvasRef.current!;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(CONFIG.BACKGROUND_COLOR);

      camera = new THREE.PerspectiveCamera(
        CONFIG.CAMERA_FOV,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const x = cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
      const y = cameraRadius * Math.cos(cameraPhi);
      const z = cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      createParticles();
    }

    function setupEventListeners() {
      window.addEventListener('scroll', updateScrollProgress, {
        passive: true,
      });
      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('resize', onResize, { passive: true });

      updateScrollProgress();
    }

    // Initialize
    initScene();
    setupEventListeners();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);

      // Dispose Three.js resources
      particleSprites.forEach((sprite) => {
        sprite.geometry.dispose();
        (sprite.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-screen block z-0"
        aria-hidden="true"
      />
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 opacity-100 transition-opacity duration-600 pointer-events-none">
        <div className="text-xs font-light tracking-[2px] uppercase mb-2 text-center text-white">
          Scroll
        </div>
        <div className="w-px h-10 bg-white mx-auto animate-pulse" />
      </div>
    </>
  );
}
