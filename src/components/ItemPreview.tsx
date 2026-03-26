'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Image from 'next/image';
import { involvementsPreviewConfig, resumeData } from '../data/resume';

interface ItemPreviewProps {
  itemId: string;
  color: string;
}

export default function ItemPreview({ itemId, color }: ItemPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const item = resumeData.find(i => i.id === itemId);
  const isInvolvementsPreview = itemId === 'involvements';
  const MAX_PREVIEW_PIXEL_RATIO = 1.5;

  useEffect(() => {
    if (!mountRef.current || ((!item || item.imageUrl) && !isInvolvementsPreview)) return;

    const mountNode = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const spinGroup = new THREE.Group();
    const displayGroup = new THREE.Group();
    const fitGroup = new THREE.Group();
    displayGroup.add(fitGroup);
    spinGroup.add(displayGroup);
    scene.add(spinGroup);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PREVIEW_PIXEL_RATIO));
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

    const fitToView = (target: THREE.Object3D) => {
      target.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(target);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const s = 3 / maxDim;
        target.scale.set(s, s, s);
        target.updateMatrixWorld(true);
        const newBox = new THREE.Box3().setFromObject(target);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        target.position.x = -newCenter.x;
        target.position.y = -newCenter.y;
        target.position.z = -newCenter.z;
      }
    };

    const loader = new GLTFLoader();
    const shape = item?.shape;
    const previewConfig = isInvolvementsPreview ? involvementsPreviewConfig : item?.previewConfig;

    const applyPreviewTransform = (target: THREE.Object3D) => {
      if (previewConfig?.rotation) {
        target.rotation.set(
          THREE.MathUtils.degToRad(previewConfig.rotation[0]),
          THREE.MathUtils.degToRad(previewConfig.rotation[1]),
          THREE.MathUtils.degToRad(previewConfig.rotation[2])
        );
      } else {
        target.rotation.set(0, 0, 0);
      }

      if (previewConfig?.position) {
        target.position.set(
          previewConfig.position[0],
          previewConfig.position[1],
          previewConfig.position[2]
        );
      } else {
        target.position.set(0, 0, 0);
      }

      const previewScale = previewConfig?.scale ?? 1;
      target.scale.setScalar(previewScale);
    };

    const applyModelMaterialTuning = (mesh: THREE.Mesh, currentItemId: string) => {
      if (!mesh.material) return;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m: any) => {
        m.side = THREE.DoubleSide;
        if (!m.isMeshStandardMaterial) return;

        m.envMapIntensity = 1.5;
        if (m.metalness > 0.5) m.roughness = Math.max(m.roughness, 0.25);

        if (currentItemId === 'delphi') {
          const isBlackWeight = m.name === 'Material.001';
          if (isBlackWeight) {
            m.color = new THREE.Color('#1a1a1a');
            m.metalness = 0.1;
            m.roughness = 0.8;
            m.emissive = new THREE.Color('#000000');
            m.emissiveIntensity = 0;
          } else {
            m.color = new THREE.Color('#cccccc');
            m.metalness = 0.5;
            m.roughness = 0.4;
            m.emissive = new THREE.Color('#000000');
            m.emissiveIntensity = 0;
          }
        }
      });
    };

    const finalizeModel = (model: THREE.Object3D) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          applyModelMaterialTuning(child, itemId);
        }
      });
      fitGroup.clear();
      fitGroup.add(model);
      fitToView(fitGroup);
      applyPreviewTransform(displayGroup);
    };

    if (isInvolvementsPreview) {
      const boardGroup = new THREE.Group();
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.68, 0.14),
        new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.8, metalness: 0.15 })
      );
      board.castShadow = true;
      board.receiveShadow = true;
      boardGroup.add(board);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(2.6, 0.68, 0.14)),
        new THREE.LineBasicMaterial({ color: '#666666', transparent: true, opacity: 0.35 })
      );
      boardGroup.add(edges);

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 110px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('INVOLVEMENTS', canvas.width / 2, canvas.height / 2);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(2.22, 0.5),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
      );
      label.position.z = 0.071;
      boardGroup.add(label);
      finalizeModel(boardGroup);
    } else if (item?.modelUrl) {
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
        // The diploma_frame.glb has an inherent tilt baked into its child nodes.
        // Zero them out so the previewConfig rotation is the sole source of truth.
        if (itemId === 'osu') {
          model.children.forEach((child: THREE.Object3D) => {
            child.rotation.set(0, 0, 0);
          });
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
    } else if (itemId === 'fireboy-watergirl' || itemId === 'arbitrage-app') {
      loader.load('/cyberpunk_desk.glb', (gltf) => {
        const desk = gltf.scene;
        const previewGroup = new THREE.Group();
        desk.updateMatrixWorld(true);

        const addCloneWithWorldTransform = (source: THREE.Mesh, customize?: (clone: THREE.Mesh) => void) => {
          const clone = source.clone();
          if (clone.material) {
            clone.material = Array.isArray(clone.material)
              ? clone.material.map((material) => material.clone())
              : clone.material.clone();

            const cloneMaterials = Array.isArray(clone.material) ? clone.material : [clone.material];
            cloneMaterials.forEach((material) => {
              if ('transparent' in material) material.transparent = false;
              if ('opacity' in material) material.opacity = 1;
              if ('alphaTest' in material) material.alphaTest = 0;
              if ('depthWrite' in material) material.depthWrite = true;
              material.needsUpdate = true;
            });
          }
          clone.position.copy(source.getWorldPosition(new THREE.Vector3()));
          clone.quaternion.copy(source.getWorldQuaternion(new THREE.Quaternion()));
          clone.scale.copy(source.getWorldScale(new THREE.Vector3()));
          customize?.(clone);
          previewGroup.add(clone);
        };

        desk.traverse((child: any) => {
          if (child.isMesh) {
            if (itemId === 'fireboy-watergirl' && (child.name === 'Object_5' || child.name === 'Object_6')) {
              addCloneWithWorldTransform(child, (clone) => {
                if (child.name === 'Object_5' && (clone.material as any).emissive) {
                  (clone.material as any).emissive.set(color);
                  (clone.material as any).emissiveIntensity = item?.glowEnabled ? 2 : 0;
                }
              });
            }
            if (itemId === 'arbitrage-app' && child.name === 'Object_8') {
              addCloneWithWorldTransform(child);
            }
          }
        });
        const previewBox = new THREE.Box3().setFromObject(previewGroup);
        const previewCenter = previewBox.getCenter(new THREE.Vector3());
        previewGroup.children.forEach(child => child.position.sub(previewCenter));
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
      const speed = previewConfig?.rotationSpeed ?? 0.005;
      if (previewConfig?.autoRotate !== false) spinGroup.rotation.y += speed;
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
  }, [item, color, itemId, isInvolvementsPreview]);

  if (item?.imageUrl) {
    return (
      <div className="w-full h-48 relative flex items-center justify-center bg-zinc-50 border-b border-zinc-200">
        <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-2">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover object-[50%_18%] scale-110"
            priority
          />
        </div>
      </div>
    );
  }

  return <div ref={mountRef} className="w-full h-48" />;
}
