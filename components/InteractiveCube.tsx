"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function InteractiveModel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const modelRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    //드래그 관련
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const rotationSpeed = 0.005; // 회전 민감도 (원하면 조절)

    // Canvas 크기 설정
    const width = 320;
    const height = 320;

    // Scene 설정
    const scene = new THREE.Scene();
    scene.background = null; // 배경 없음 (투명)

    // Camera 설정
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3.5;

    // Renderer 설정
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 조명 추가 (밝게)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(3, 5, 2);
    scene.add(directionalLight);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.7);
    scene.add(hemiLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // GLTF 모델 로드
    const loader = new GLTFLoader();
    loader.load(
      "/model.glb", // public/models/model.glb
      (gltf) => {
        const model = gltf.scene;

        // 크기 / 위치 조정 (필요할 때 수정)
        model.position.set(0, -0.5, 0);
        model.scale.set(2.5, 2.5, 2.5);

        scene.add(model);
        modelRef.current = model;
      },
      undefined,
      (error) => {
        console.error("GLB 로드 에러:", error);
      }
    );

    // 애니메이션
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    // 클릭 핸들러
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();

      // Canvas 영역 밖이면 무시
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }

      if (!modelRef.current) return; // 모델 아직 안 뜸

      // Canvas 기준으로 마우스 위치를 NDC로 변환
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycasting
      raycaster.setFromCamera(mouse, camera);

      // glTF는 계층 구조가 있어서 children까지 검사하려면 true
      const intersects = raycaster.intersectObject(modelRef.current, true);

      if (intersects.length > 0) {
        // 모델 클릭됨
        setShowTooltip(true);
        setTooltipPosition({
          x: event.clientX,
          y: event.clientY - 80, // 클릭 위치보다 위에 표시
        });

        // 3초 후 말풍선 숨기기
        setTimeout(() => {
          setShowTooltip(false);
        }, 3000);

        // 클릭 효과: 잠깐 크게 만들었다가 원래대로
        const model = modelRef.current;
        if (model) {
          const originalScale = model.scale.clone();
          model.scale.set(
            originalScale.x * 1.1,
            originalScale.y * 1.1,
            originalScale.z * 1.1
          );
          setTimeout(() => {
            model.scale.copy(originalScale);
          }, 300);
        }
      }
    };

    const canvas = canvasRef.current!;

    const onMouseDown = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();

      // 캔버스 영역 안에서만 드래그 시작
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        isDragging = true;
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY,
        };
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging || !modelRef.current) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      };

      // 마우스 이동량에 따라 모델 회전
      modelRef.current.rotation.y += deltaMove.x * rotationSpeed; // 좌우 드래그 → Y 회전
      modelRef.current.rotation.x += deltaMove.y * rotationSpeed; // 상하 드래그 → X 회전

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseLeave = () => {
      isDragging = false;
    };

    // 이벤트 리스너 등록
    window.addEventListener("click", handleClick);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // 애니메이션 시작
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("click", handleClick);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed right-8 bottom-8 w-80 h-80 z-30">
      <canvas ref={canvasRef} className="w-full h-full bg-transparent" />

      {/* 말풍선 */}
      {showTooltip && (
        <div
          className="fixed z-50 px-4 py-2 bg-white rounded-lg shadow-lg border-2 border-blue-500 animate-bounce"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-sm font-medium text-gray-800">
            안녕하세요! glb 모델입니다! 🧊
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-500"></div>
          </div>
        </div>
      )}

      {/* 안내 텍스트 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-white text-center whitespace-nowrap">
        <p className="text-xs opacity-70">모델을 클릭해보세요!</p>
      </div>
    </div>
  );
}
