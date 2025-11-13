'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function InteractiveCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const cubeRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Canvas 크기 설정
    const width = 320;
    const height = 320;

    // Scene 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera 설정
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer 설정
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 정육면체 생성
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      metalness: 0.5,
      roughness: 0.5,
    });
    const cube = new THREE.Mesh(geometry, material);
    cubeRef.current = cube;
    scene.add(cube);

    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 애니메이션
    const animate = () => {
      requestAnimationFrame(animate);

      // 정육면체 회전
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    // 클릭 핸들러
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      // Canvas의 위치와 크기 가져오기
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();

      // 마우스가 canvas 영역 내에 있는지 확인
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }

      // Canvas 기준으로 마우스 위치를 NDC(Normalized Device Coordinates)로 변환
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(cube);

      if (intersects.length > 0) {
        // 큐브를 클릭했을 때
        setShowTooltip(true);
        setTooltipPosition({
          x: event.clientX,
          y: event.clientY - 80, // 클릭 위치보다 위에 표시
        });

        // 3초 후 말풍선 숨기기
        setTimeout(() => {
          setShowTooltip(false);
        }, 3000);

        // 클릭 효과: 큐브 색상 변경
        (material as THREE.MeshStandardMaterial).color.setHex(0xe24a90);
        setTimeout(() => {
          (material as THREE.MeshStandardMaterial).color.setHex(0x4a90e2);
        }, 300);
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('click', handleClick);

    // 애니메이션 시작
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('click', handleClick);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed left-8 bottom-8 w-80 h-80 z-30">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* 말풍선 */}
      {showTooltip && (
        <div
          className="fixed z-50 px-4 py-2 bg-white rounded-lg shadow-lg border-2 border-blue-500 animate-bounce"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="text-sm font-medium text-gray-800">
            안녕하세요! 정육면체입니다! 🎲
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-500"></div>
          </div>
        </div>
      )}

      {/* 안내 텍스트 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-white text-center whitespace-nowrap">
        <p className="text-xs opacity-70">클릭해보세요!</p>
      </div>
    </div>
  );
}
