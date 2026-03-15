'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RotateCcw } from 'lucide-react';
import { resumeData, ResumeItem, cameraConfig } from '../data/resume';

interface InteractiveDeskProps {
  selectedId: string | null;
  onSelect: (id: string | null, previewId?: string | null) => void;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}

// modelMap removed - using centralized resumeData config

export default function InteractiveDesk({ selectedId, onSelect, hoveredId, onHover }: InteractiveDeskProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedItem = useMemo(() => resumeData.find(i => i.id === selectedId), [selectedId]);

  // Refs to hold mutable state for the animation loop without triggering scene rebuilds
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const selectedRef = useRef<string | null>(selectedId);
  const hoveredRef = useRef<string | null>(hoveredId);
  const mixers = useRef<THREE.AnimationMixer[]>([]);
  const zoomRef = useRef<number>(1.0);
  const isGrabbingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef(cameraConfig.recenterRotation); // Initial camera angle

  useEffect(() => {
    if (selectedItem) {
      const pos = selectedItem.position;
      targetRef.current = new THREE.Vector3(...pos);
    } else {
      targetRef.current = null;
    }
    selectedRef.current = selectedId;
  }, [selectedItem, selectedId]);

  useEffect(() => {
    hoveredRef.current = hoveredId;
  }, [hoveredId]);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    // 0. State for Cyberpunk interaction
    const meshes: { obj: THREE.Object3D, item: ResumeItem, baseY: number, isModel: boolean }[] = [];
    (window as any).debugMeshes = meshes;

    const geos: Record<string, THREE.BufferGeometry> = {
      box: new THREE.BoxGeometry(1.2, 1.2, 1.2),
      sphere: new THREE.SphereGeometry(0.7, 32, 32),
      cylinder: new THREE.CylinderGeometry(0.6, 0.6, 1.7, 32),
      pyramid: new THREE.ConeGeometry(0.8, 1.7, 4),
      torus: new THREE.TorusGeometry(0.6, 0.25, 16, 100)
    };

    // 1. Setup Scene, Camera, Renderer
    const width = mountNode.clientWidth;
    const height = mountNode.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#D0D0CC'); // Updated background color

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 7); // Brought camera closer to avoid clipping interior walls
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better cinematic look
    renderer.toneMappingExposure = 1.2; // Restored to previous brightness
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer, cleaner shadows
    mountNode.appendChild(renderer.domElement);

    // Expose scene for debugging
    (window as any).scene = scene;

    // 2. Lighting - Simplified for Sci-Fi
    const intensityMultiplier = 0.25;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2 * intensityMultiplier);
    scene.add(ambientLight);

    const spotCyan = new THREE.SpotLight(0xffffff, 400 * intensityMultiplier, 40, 0.4, 1);
    spotCyan.position.set(5, 12, 8);
    spotCyan.castShadow = true;
    spotCyan.shadow.bias = -0.0001;
    spotCyan.shadow.mapSize.set(2048, 2048);
    scene.add(spotCyan);

    const spotPink = new THREE.SpotLight(0xffffff, 400 * intensityMultiplier, 40, 0.4, 1);
    spotPink.position.set(-5, 12, -8);
    spotPink.castShadow = true;
    spotPink.shadow.bias = -0.0001;
    spotPink.shadow.mapSize.set(2048, 2048);
    scene.add(spotPink);

    const deskLight = new THREE.PointLight(0xffffff, 60 * intensityMultiplier, 15);
    deskLight.position.set(0, 3, 1);
    deskLight.castShadow = true;
    scene.add(deskLight);

    const chairLight = new THREE.PointLight(0xffffff, 40 * intensityMultiplier, 10);
    chairLight.position.set(0, 3, -2);
    scene.add(chairLight);

    const rimLeft = new THREE.DirectionalLight(0xffffff, 2 * intensityMultiplier);
    rimLeft.position.set(-10, 5, -10);
    scene.add(rimLeft);

    const rimRight = new THREE.DirectionalLight(0xffffff, 2 * intensityMultiplier);
    rimRight.position.set(10, 5, -10);
    scene.add(rimRight);

    const robotLight = new THREE.PointLight(0xffffff, 191 * intensityMultiplier, 15);
    robotLight.position.set(0, 2, 2);
    scene.add(robotLight);

    // 3. Environment (Sci-Fi Room only)
    const loader = new GLTFLoader();
    const envUrl = '/sci-fi_interior_room.glb';

    loader.load(envUrl, (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.receiveShadow = true;
          mesh.castShadow = true;

          // Ensure AO is active and using second UV set if present
          if (mesh.material && (mesh.material as any).aoMap) {
            (mesh.material as any).aoMapIntensity = 1.5;
          }

          const lowName = mesh.name.toLowerCase();
          const artifactKeywords = ['decal', 'grid', 'wireframe', 'tv', 'screen', 'part', 'mesh', 'joint', 'wire', 'torus', 'arc', 'torus', 'circle'];
          if (artifactKeywords.some(key => lowName.includes(key))) {
            mesh.visible = false;
          }
        }
      });

      model.scale.set(2.0, 2.0, 2.0);
      model.position.y = -1;

      // Re-integrated desk with precision targeting and centered pivot for the PC (Mesh #6)
      loader.load('/cyberpunk_desk.glb', (deskGltf) => {
        const desk = deskGltf.scene;
        const delphiItem = resumeData.find(d => d.id === 'delphi');
        const sffItem = resumeData.find(d => d.id === 'arbitrage-app');

        // 1. Create a stable floor anchor for everything desk-related
        const deskPivot = new THREE.Group();
        deskPivot.name = 'deskPivot';
        deskPivot.position.set(0, -1, 3.0); // Room floor level
        deskPivot.rotation.y = Math.PI;
        scene.add(deskPivot);

        // Position the desk frame so feet are at Y=0 locally (floor level)
        desk.scale.set(0.8, 0.8, 0.8);
        const dBox = new THREE.Box3().setFromObject(desk);
        const dCenter = dBox.getCenter(new THREE.Vector3());
        desk.position.set(-dCenter.x, -dBox.min.y, -dCenter.z);
        deskPivot.add(desk);

        // Helper to find specific meshes during traversal
        const findMeshes = (): { pc?: THREE.Mesh, monitor?: THREE.Mesh, screen?: THREE.Mesh } => {
          const found: { pc?: THREE.Mesh; monitor?: THREE.Mesh; screen?: THREE.Mesh } = {};
          desk.traverse((child: any) => {
            if (child.isMesh) {
              if (child.name === 'Object_8') found.pc = child;
              if (child.name === 'Object_5') found.monitor = child;
              if (child.name === 'Object_6') found.screen = child;
            }
          });
          return found;
        };

        const targets = findMeshes();

        // 2. Handle PC (SFF-PC) - Mesh #6
        if (targets.pc && sffItem) {
          const activePC = targets.pc;
          activePC.castShadow = true;
          activePC.receiveShadow = true;

          // Calculate center BEFORE detaching to ensure zero drift
          const worldPos = new THREE.Vector3();
          activePC.getWorldPosition(worldPos);

          activePC.geometry.computeBoundingBox();
          const meshCenter = new THREE.Vector3();
          activePC.geometry.boundingBox?.getCenter(meshCenter);
          const worldCenter = activePC.localToWorld(meshCenter.clone());

          const pcPivot = new THREE.Group();
          pcPivot.name = 'pcPivot';

          // Re-parent DIRECTLY to deskPivot for absolute stability
          deskPivot.add(pcPivot);
          pcPivot.position.copy(deskPivot.worldToLocal(worldCenter));
          pcPivot.attach(activePC);

          activePC.userData = { id: 'arbitrage-app' };

          // Final compact size from centralized config
          pcPivot.scale.set(sffItem.scale, sffItem.scale, sffItem.scale);

          meshes.push({ obj: pcPivot, item: sffItem, baseY: pcPivot.position.y, isModel: true });

          const light = new THREE.PointLight(new THREE.Color(sffItem.color), 0, 3);
          light.name = 'hoverLight';
          pcPivot.add(light);
        }

        // 3. Handle Monitors (Delphi) - Meshes #3 and #4 (counters 4 and 5)
        if (targets.monitor && targets.screen && delphiItem) {
          const monitor = targets.monitor;
          const screen = targets.screen;

          monitor.castShadow = true;
          monitor.receiveShadow = true;
          screen.castShadow = true;
          screen.receiveShadow = true;

          // Calculate combined world center BEFORE detaching for zero drift
          const box = new THREE.Box3().setFromObject(monitor);
          box.expandByObject(screen);
          const worldCenter = box.getCenter(new THREE.Vector3());

          const monitorPivot = new THREE.Group();
          monitorPivot.name = 'monitorPivot';

          // 1. Calculate combined bounding box in WORLD space first to find the group's natural center
          const monitorBox = new THREE.Box3().setFromObject(monitor);
          monitorBox.expandByObject(screen);
          const worldAssemblyCenter = monitorBox.getCenter(new THREE.Vector3());

          // 2. Position the pivot at this natural center point on the desk
          // We raise it slightly (y=2.8) to sit on the surface
          monitorPivot.position.set(0, 2.8, 0.15);
          monitorPivot.rotation.y = 0;
          deskPivot.add(monitorPivot);

          // 3. Attach meshes to the pivot - this preserves their world positions
          monitorPivot.attach(monitor);
          monitorPivot.attach(screen);

          // 4. Group-shift the children so their COMBINED local center is at (0,0,0)
          // This makes the pivot the true center for scaling/rotation
          const localAssemblyCenter = monitorPivot.worldToLocal(worldAssemblyCenter.clone());
          monitor.position.sub(localAssemblyCenter);
          screen.position.sub(localAssemblyCenter);

          // 5. Orient correctly (face camera + 180deg Z flip + 90deg X tilt)
          // Since we're using .attach(), we set local rotation relative to the pivot
          monitor.rotation.set(Math.PI / 2, Math.PI, Math.PI);
          screen.rotation.set(Math.PI / 2, Math.PI, Math.PI);

          monitor.userData = { id: 'delphi' };
          screen.userData = { id: 'delphi' };

          monitorPivot.scale.set(delphiItem.scale, delphiItem.scale, delphiItem.scale);

          meshes.push({ obj: monitorPivot, item: delphiItem!, baseY: monitorPivot.position.y, isModel: true });

          const light = new THREE.PointLight(new THREE.Color(delphiItem.color), 0, 3);
          light.position.set(0, 0, 1.0);
          light.name = 'hoverLight';
          monitorPivot.add(light);
        }

        // Apply shadows to remaining desk meshes and hide stray artifacts
        const excluded = [targets.pc, targets.monitor, targets.screen];
        desk.traverse((child: any) => {
          if (child.isMesh) {
            const mesh = child as THREE.Mesh;
            if (excluded.includes(child)) return;

            // Hide stray decorative/broken assets reported by subagent
            if (mesh.name.toLowerCase().includes('leg')) {
              mesh.visible = false;
              return;
            }

            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
      }, undefined, (error) => {
        console.error("An error happened loading the GLB model", error);
      });

      scene.add(model);
    }, undefined, (error) => {
      console.error("An error happened loading the GLB model", error);
    });

    const createCustomShape = (shape: string, colorHex: string) => {
      const group = new THREE.Group();
      // Sci-fi Metallic Material (Warm Minimalist)
      const createMat = () => new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d0d0cc'),
        metalness: 0.9,
        roughness: 0.1,
        emissive: new THREE.Color('#fffffe'),
        emissiveIntensity: 0.1
      });

      if (shape === 'coins') {
        for (let i = 0; i < 3; i++) {
          const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32), createMat());
          coin.position.y = i * 0.15;
          group.add(coin);
        }
      } else if (shape === 'calculator') {
        const calc = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.8), createMat());
        group.add(calc);
      } else {
        // mesh = new THREE.Mesh(geos.box, createMat());
        // group.add(mesh);
      }
      return group;
    };

    resumeData.forEach(item => {
      // Shared position logic for Sci-Fi layout
      if (item.id === 'arbitrage-app') return; // Now represented by the desk model
      if (item.id === 'delphi') return; // Now represented by the desk monitors

      const pos = item.position;

      if (item.modelUrl) {
        loader.load(item.modelUrl, (gltf) => {
          const model = gltf.scene;

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);

          let s = item.scale;
          // Normalize to a standard size first, then apply our scale factor
          const normScale = (1.0 / maxDim) * s;

          // Sci-Fi Room Scaling Tweak (Centralized override)
          if (item.id === 'columbus-capital') {
            // VR headset scale (re-applying scifi multiplier)
            model.scale.set(normScale * 7.5, normScale * 7.5, normScale * 7.5);
          } else if (item.id === 'keybank' || item.id === 'emsi') {
            // Badminton racket / Chessboard scale (re-applying scifi multiplier)
            model.scale.set(normScale * 1.5, normScale * 1.5, normScale * 1.5);
          } else {
            model.scale.set(normScale, normScale, normScale);
          }

          if (item.id === 'hephasbot') {
            // Hephasbot specific positioning
            model.scale.set(item.scale * 0.75, item.scale * 0.75, item.scale * 0.75); // Adjusted ratio
            model.position.set(0, 0, 0);

            // Re-apply centering by computing box on the SCENE not just model
            // This ensures torso and legs are treated as one volume
            model.traverse(c => { if ((c as any).isMesh) (c as any).geometry.computeBoundingBox(); });
            const robotBox = new THREE.Box3().setFromObject(model);
            const robotCenter = robotBox.getCenter(new THREE.Vector3());
            model.position.x = -robotCenter.x;
            model.position.y = -robotBox.min.y;
            model.position.z = -robotCenter.z;

            const pivot = new THREE.Group();
            pivot.add(model);
            // Height offset of -1 matches the room's floor level
            pivot.position.set(0, -1.0, 1.0);
            const radX = THREE.MathUtils.degToRad(item.rotation[0]);
            const radY = THREE.MathUtils.degToRad(item.rotation[1]);
            const radZ = THREE.MathUtils.degToRad(item.rotation[2]);
            pivot.rotation.set(radX, radY, radZ);

            // Enable interaction for the robot
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const mesh = child as THREE.Mesh;
                mesh.userData = { id: 'hephasbot' };
                mesh.castShadow = true;
                mesh.receiveShadow = true;
              }
            });

            // Add hit proxy for easier interaction
            const proxyGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.5);
            const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
            const proxy = new THREE.Mesh(proxyGeo, proxyMat);
            proxy.position.y = 1.25;
            proxy.userData = { id: 'hephasbot' };
            pivot.add(proxy);

            const robotItem = resumeData.find(d => d.id === 'hephasbot');
            if (robotItem) {
              meshes.push({ obj: pivot, item: robotItem, baseY: pivot.position.y, isModel: true });
            }

            scene.add(pivot);
            return; // Maintain original flow but with interaction registered
          }

          if (item.rotation) {
            const radX = THREE.MathUtils.degToRad(item.rotation[0]);
            const radY = THREE.MathUtils.degToRad(item.rotation[1]);
            const radZ = THREE.MathUtils.degToRad(item.rotation[2]);
            model.rotation.set(radX, radY, radZ);
          }

          // Always position regular models
          model.position.set(pos[0], pos[1], pos[2]);

          if (gltf.animations && gltf.animations.length > 0 && item.id !== 'hephasbot') {
            const mixer = new THREE.AnimationMixer(model);
            const clip = gltf.animations[0];
            const action = mixer.clipAction(clip);
            action.play();
            mixers.current.push(mixer);
          }

          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const mesh = child as THREE.Mesh;
              mesh.userData = { id: item.id };
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  mesh.material = mesh.material.map(m => m.clone());
                } else {
                  mesh.material = mesh.material.clone();
                }

                const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                mats.forEach((m: any) => {
                  if (m.isMeshStandardMaterial) {
                    m.envMapIntensity = 1.0;
                    if (m.aoMap) m.aoMapIntensity = 1.5;
                  }
                });
              }

              // Hide broken robot parts and stray mechanical artifacts in chessboard model
              if (item.id === 'chess') {
                const lowName = mesh.name.toLowerCase();
                const artifactKeywords = ['robot', 'leg', 'arm', 'torso', 'head', 'part', 'mesh', 'joint', 'wire', 'torus', 'arc', 'circle'];
                if (artifactKeywords.some(key => lowName.includes(key))) {
                  mesh.visible = false;
                }
              }
            }
          });

          // IMPROVED HIT PROXY: Covers entire racket (head + handle)
          if (item.id === 'keybank') {
            const proxyGeo = new THREE.CylinderGeometry(15, 15, 60);
            const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
            const proxy = new THREE.Mesh(proxyGeo, proxyMat);
            // Re-adjust proxy position to cover the vertical span of the racket
            proxy.position.y = -10;
            proxy.userData = { id: item.id };
            model.add(proxy);
          }

          // Ensure VR and OSU visibility is clear
          if (item.id === 'columbus-capital' || item.id === 'osu') {
            model.traverse(c => {
              if ((c as any).isMesh) {
                (c as any).visible = true;
              }
            });
          }

          const light = new THREE.PointLight(new THREE.Color(item.color), 0, 3);
          light.position.set(0, 1, 0);
          light.name = 'hoverLight';
          model.add(light);

          model.userData = { id: item.id, color: item.color };
          scene.add(model);
          meshes.push({ obj: model, item, baseY: model.position.y, isModel: true });
        });
      } else {
        const customObj = createCustomShape(item.shape, item.color);
        customObj.position.set(pos[0], pos[1], pos[2]);
        const radX = THREE.MathUtils.degToRad(item.rotation[0]);
        const radY = THREE.MathUtils.degToRad(item.rotation[1]);
        const radZ = THREE.MathUtils.degToRad(item.rotation[2]);
        customObj.rotation.set(radX, radY, radZ);

        if (item.id === 'badminton') {
          // Make badminton racket larger
          customObj.scale.set(2, 2, 2);
        } else {
          customObj.scale.set(item.scale, item.scale, item.scale);
        }

        customObj.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.userData = { id: item.id };
          }
        });

        customObj.userData = { id: item.id };
        scene.add(customObj);
        meshes.push({ obj: customObj, item, baseY: customObj.position.y, isModel: false });
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentHover: string | null = null;
    const cameraTarget = new THREE.Vector3(0, 0, 0);

    const playHoverAnimation = (id: string | null, isHovering: boolean) => {
      const targetMesh = meshes.find(m => m.item.id === id);
      if (!targetMesh) return;

      const obj = targetMesh.obj;
      const initialScale = obj.userData.initialScale || obj.scale.clone();
      if (!obj.userData.initialScale) obj.userData.initialScale = initialScale.clone();

      gsap.killTweensOf(obj.scale);

      if (isHovering) {
        const hoverScale = targetMesh.item.hoverScale;
        gsap.to(obj.scale, {
          x: initialScale.x * hoverScale,
          y: initialScale.y * hoverScale,
          z: initialScale.z * hoverScale,
          duration: 0.5,
          ease: "back.out(2)"
        });
      } else {
        gsap.to(obj.scale, {
          x: initialScale.x,
          y: initialScale.y,
          z: initialScale.z,
          duration: 0.3,
          ease: "back.out(2)"
        });
      }
    };

    const checkIntersections = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes.map(m => m.obj), true);

      if (intersects.length > 0) {
        const hit = intersects.find(i => i.object.userData?.id || (i.object.parent && i.object.parent.userData?.id));
        const hitId = hit ? (hit.object.userData.id || hit.object.parent?.userData.id) : null;

        if (hitId && currentHover !== hitId) {
          if (currentHover) playHoverAnimation(currentHover, false);
          currentHover = hitId;
          playHoverAnimation(hitId, true);
          onHover(hitId);
          document.body.style.cursor = 'pointer';
        }
      } else {
        if (currentHover !== null) {
          playHoverAnimation(currentHover, false);
          currentHover = null;
          onHover(null);
          document.body.style.cursor = 'auto';
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const zoomSpeed = 0.001;
      const { minZoom: globalMin, maxZoom: globalMax } = cameraConfig;
      
      // Use latest selectedId from selectedRef to get fresh item data
      const currentItem = resumeData.find(i => i.id === selectedRef.current);
      const minZoom = currentItem?.minZoom ?? globalMin;
      const maxZoom = currentItem?.maxZoom ?? globalMax;
      
      zoomRef.current = Math.max(minZoom, Math.min(maxZoom, zoomRef.current + e.deltaY * zoomSpeed));
    };

    const handlePointerDown = (e: MouseEvent) => {
      checkIntersections(e);
      if (!currentHover) {
        isGrabbingRef.current = true;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      checkIntersections(e);
      if (isGrabbingRef.current) {
        const deltaX = e.clientX - prevMouseRef.current.x;
        const deltaY = e.clientY - prevMouseRef.current.y;
        rotationRef.current.yaw -= deltaX * 0.005;
        rotationRef.current.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.pitch + deltaY * 0.005));
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerUp = () => {
      isGrabbingRef.current = false;
    };

    const handleClick = (e: MouseEvent) => {
      checkIntersections(e);
      if (currentHover) {
        const item = resumeData.find(i => i.id === currentHover);
        if (item && item.clickable !== false) {
          onSelect(currentHover, currentHover);
        }
      } else {
        onSelect(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!mountNode) return;
      const w = mountNode.clientWidth;
      const h = mountNode.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      mixers.current.forEach(m => m.update(delta));

      meshes.forEach(({ obj, item, isModel }) => {
        const isHovered = hoveredRef.current === item.id || currentHover === item.id;
        const isSelectedLocal = selectedRef.current === item.id;

        if (isModel) {
          const light = obj.getObjectByName('hoverLight') as THREE.PointLight;
          if (light) {
            if (isSelectedLocal && item.glowEnabled) light.intensity = 50;
            else light.intensity = 0;
          }
        } else {
          obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const mat = child.material as THREE.MeshStandardMaterial;
              if (item.shape === 'monitor' || item.shape === 'computer') {
                mat.emissiveIntensity = (isSelectedLocal && item.glowEnabled) ? 2 : 0;
                mat.opacity = (isSelectedLocal && item.glowEnabled) ? 0.5 : 0;
              } else {
                if (isSelectedLocal && item.glowEnabled) {
                  mat.emissiveIntensity = 2;
                  mat.color.setHex(0xffffff);
                } else {
                  mat.emissiveIntensity = 0.1;
                  mat.color.setHex(0x222222);
                }
              }
            }
          });
        }
      });

      const target = targetRef.current;
      const zoom = zoomRef.current;
      const { yaw, pitch } = rotationRef.current;

      const baseRadius = 6;
      const radius = baseRadius * zoom;
      const camX = Math.sin(yaw) * Math.cos(pitch) * radius;
      const camY = Math.sin(pitch) * radius;
      const camZ = Math.cos(yaw) * Math.cos(pitch) * radius;

      const lerpFactor = 0.05;

      if (target) {
        // Find current item using ref to ensure we have latest data
        const currentItem = resumeData.find(i => i.id === selectedRef.current);
        const dist = currentItem?.zoomDistance ?? 4;
        const targetPos = currentItem?.zoomTarget || [target.x, target.y + 1, target.z + dist];
        const desiredPos = new THREE.Vector3(...targetPos);
        camera.position.lerp(desiredPos, lerpFactor);
        cameraTarget.lerp(target, lerpFactor);
      } else {
        // Orbital view
        camera.position.lerp(new THREE.Vector3(camX, 1 * zoom + camY, camZ + 2), lerpFactor);
        cameraTarget.lerp(new THREE.Vector3(0, 0, 2), lerpFactor);
      }

      camera.lookAt(cameraTarget);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('wheel', handleWheel);

      if (mountNode) {
        mountNode.removeChild(renderer.domElement);
      }

      Object.values(geos).forEach(g => g.dispose());
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  const handleRecenter = () => {
    // Sourced from cameraConfig
    rotationRef.current = { ...cameraConfig.recenterRotation };
    zoomRef.current = cameraConfig.recenterZoom;
    targetRef.current = null;
    selectedRef.current = null;
    onSelect(null);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#D0D0CC] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.05)]" />
      <div ref={mountRef} className="w-full h-full border-none outline-none" />
      <button
        onClick={handleRecenter}
        className="absolute bottom-6 right-6 z-20 flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl bg-white/80 backdrop-blur-md hover:bg-white/95 active:scale-95 transition-all border border-white/30 group shadow-[0_8px_32px_rgba(0,0,0,0.1)] cursor-pointer"
        title="Recenter camera"
      >
        <RotateCcw className="w-4 h-4 text-[#1a1a1a] group-hover:rotate-[-20deg] transition-transform" />
        <span className="text-sm font-semibold text-[#1a1a1a]">Recenter</span>
      </button>
    </div>
  );
}
