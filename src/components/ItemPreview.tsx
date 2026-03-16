'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Image from 'next/image';
import { resumeData } from '../data/resume';

interface ItemPreviewProps {
  itemId: string;
  color: string;
}

export default function ItemPreview({ itemId, color }: ItemPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const item = resumeData.find(i => i.id === itemId);

  useEffect(() => {
    if (!mountRef.current || !item || item.imageUrl) return;

    const mountNode = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const group = new THREE.Group();
    scene.add(group);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    mountNode.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight2.position.set(-5, 2, 2);
    scene.add(dirLight2);

    const topLight = new THREE.PointLight(0xffffff, 2);
    topLight.position.set(0, 5, 2);
    scene.add(topLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1);
    frontLight.position.set(0, 0, 10);
    scene.add(frontLight);

    const fitToView = (model: THREE.Object3D) => {
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const s = 3 / maxDim;
        model.scale.set(s, s, s);
        model.updateMatrixWorld(true);
        const newBox = new THREE.Box3().setFromObject(model);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        model.position.x = -newCenter.x;
        model.position.y = -newCenter.y;
        model.position.z = -newCenter.z;
      }
    };

    const loader = new GLTFLoader();
    const shape = item.shape;

    const finalizeModel = (model: THREE.Object3D) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
              m.side = THREE.DoubleSide;
              if ((m as any).isMeshStandardMaterial) {
                const sm = m as any;
                sm.envMapIntensity = 1.5;
                if (sm.metalness > 0.5) sm.roughness = Math.max(sm.roughness, 0.25);
              }
            });
          }
        }
      });
      group.add(model);
      fitToView(model);
    };

    if (item.modelUrl) {
      loader.load(item.modelUrl, (gltf) => {
        const model = gltf.scene;
        if (itemId === 'chessboard' || itemId === 'chess') {
          model.traverse(child => {
            if (child instanceof THREE.Mesh) {
              const lowName = child.name.toLowerCase();
              const artifactKeywords = ['robot', 'leg', 'arm', 'torso', 'head', 'part', 'mesh', 'joint', 'wire', 'torus', 'arc', 'circle'];
              if (artifactKeywords.some(key => lowName.includes(key))) child.visible = false;
            }
          });
        }
        if (item.previewConfig?.rotation) {
          model.rotation.set(
            THREE.MathUtils.degToRad(item.previewConfig.rotation[0]),
            THREE.MathUtils.degToRad(item.previewConfig.rotation[1]),
            THREE.MathUtils.degToRad(item.previewConfig.rotation[2])
          );
        }
        finalizeModel(model);
      });
    } else if (shape === 'coins') {
      const coinGroup = new THREE.Group();
      const createMat = () => new THREE.MeshStandardMaterial({ color: '#d0d0cc', metalness: 0.9, roughness: 0.1, emissive: '#fffffe', emissiveIntensity: 0.1 });
      for (let i = 0; i < 3; i++) {
        const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32), createMat());
        coin.position.y = i * 0.15 - 0.15;
        coinGroup.add(coin);
      }
      finalizeModel(coinGroup);
    } else if (itemId === 'delphi' || itemId === 'arbitrage-app') {
      loader.load('/cyberpunk_desk.glb', (gltf) => {
        const desk = gltf.scene;
        const previewGroup = new THREE.Group();
        desk.traverse((child: any) => {
          if (child.isMesh) {
            if (itemId === 'delphi' && (child.name === 'Object_5' || child.name === 'Object_6')) {
              const clone = child.clone();
              if (child.name === 'Object_5' && (clone.material as any).emissive) {
                (clone.material as any).emissive.set(color);
                (clone.material as any).emissiveIntensity = item.glowEnabled ? 2 : 0;
              }
              previewGroup.add(clone);
            }
            if (itemId === 'arbitrage-app' && child.name === 'Object_8') previewGroup.add(child.clone());
          }
        });
        const previewBox = new THREE.Box3().setFromObject(previewGroup);
        const previewCenter = previewBox.getCenter(new THREE.Vector3());
        previewGroup.children.forEach(child => child.position.sub(previewCenter));
        if (item.previewConfig?.rotation) {
          previewGroup.rotation.set(
            THREE.MathUtils.degToRad(item.previewConfig.rotation[0]),
            THREE.MathUtils.degToRad(item.previewConfig.rotation[1]),
            THREE.MathUtils.degToRad(item.previewConfig.rotation[2])
          );
        } else previewGroup.rotation.set(Math.PI / 2, Math.PI, Math.PI);
        finalizeModel(previewGroup);
      });
    } else {
      const createMat = () => new THREE.MeshStandardMaterial({ color: '#d0d0cc', metalness: 0.9, roughness: 0.1, emissive: '#fffffe', emissiveIntensity: 0.1 });
      let mesh: THREE.Object3D;
      if (shape === 'column') mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2, 32), createMat());
      else if (shape === 'monitor' || shape === 'computer') {
        const monitorGroup = new THREE.Group();
        const screenMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: color, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.2 });
        const screen = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.4, 0.1), screenMat);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.1 });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 0.15), frameMat);
        frame.position.z = -0.1;
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 16), frameMat);
        stand.position.y = -1;
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.1, 32), frameMat);
        base.position.y = -1.5;
        monitorGroup.add(screen, frame, stand, base);
        mesh = monitorGroup;
      } else mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), createMat());
      finalizeModel(mesh);
      if (item.previewConfig?.position) {
        mesh.position.x += item.previewConfig.position[0];
        mesh.position.y += item.previewConfig.position[1];
        mesh.position.z += item.previewConfig.position[2];
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      const w = mountNode.clientWidth;
      const h = mountNode.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(mountNode);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const speed = item.previewConfig?.rotationSpeed ?? 0.005;
      if (item.previewConfig?.autoRotate !== false) group.rotation.y += speed;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountNode.contains(renderer.domElement)) mountNode.removeChild(renderer.domElement);
      renderer.dispose();
      scene.clear();
    };
  }, [item, color, itemId]);

  if (item?.imageUrl) {
    return (
      <div className="w-full h-48 relative flex items-center justify-center bg-zinc-50 border-b border-zinc-200">
        <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-2">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover scale-110"
            priority
          />
        </div>
      </div>
    );
  }

  return <div ref={mountRef} className="w-full h-48" />;
}
