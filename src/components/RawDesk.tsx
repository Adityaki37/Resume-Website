'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RotateCcw } from 'lucide-react';
import { resumeData, ResumeItem, cameraConfig, signpostConfig } from '../data/resume';

interface InteractiveDeskProps {
  selectedId: string | null;
  onSelect: (id: string | null, previewId?: string | null) => void;
  onHover: (id: string | null) => void;
  onBack?: () => void;
  onResume?: () => void;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: () => void;
  showCover?: boolean;
}

// modelMap removed - using centralized resumeData config

export default function InteractiveDesk({
  selectedId, onSelect, onHover, onBack, onResume,
  onLoadProgress, onLoadComplete, showCover
}: InteractiveDeskProps) {
  const ACTIVE_PIXEL_RATIO_CAP = 1.5;
  const COVER_PIXEL_RATIO_CAP = 1.0;
  const mountRef = useRef<HTMLDivElement>(null);
  const showCoverRef = useRef(Boolean(showCover));
  const sceneLoadedRef = useRef(false);
  const needsWarmupRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const backgroundTimerRef = useRef<number | null>(null);
  const renderFrameRef = useRef<(() => void) | null>(null);
  const startAnimationRef = useRef<(() => void) | null>(null);
  const startBackgroundAnimationRef = useRef<(() => void) | null>(null);
  const applyRendererQualityRef = useRef<(() => void) | null>(null);

  // Refs to hold mutable state for the animation loop without triggering scene rebuilds
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const selectedRef = useRef<string | null>(selectedId);
  const mixers = useRef<THREE.AnimationMixer[]>([]);
  const zoomRef = useRef<number>(cameraConfig.recenterZoom);
  const isGrabbingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  // Start from a separate intro angle, then pan into the shared overview/recenter view.
  const rotationRef = useRef({ ...cameraConfig.introRotation });

  useEffect(() => {
    showCoverRef.current = Boolean(showCover);
    applyRendererQualityRef.current?.();
    if (showCover) {
      startBackgroundAnimationRef.current?.();
    } else {
      startAnimationRef.current?.();
      renderFrameRef.current?.();
    }
  }, [showCover]);

  useEffect(() => {
    targetRef.current = null;
    selectedRef.current = selectedId;
  }, [selectedId]);

  // Handle Cinematic Entry Pan
  useEffect(() => {
    if (!showCover) {
      gsap.to(rotationRef.current, {
        yaw: cameraConfig.recenterRotation.yaw,
        pitch: cameraConfig.recenterRotation.pitch,
        duration: 2.5,
        ease: "power2.inOut"
      });
    }
  }, [showCover]);

  useEffect(() => {
    THREE.Cache.enabled = true;
  }, []);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    // 0. State for Cyberpunk interaction
    const meshes: { obj: THREE.Object3D, item: ResumeItem, baseY: number, isModel: boolean }[] = [];
    if (process.env.NODE_ENV !== 'production') {
      (window as any).debugMeshes = meshes;
    }

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

    // Dynamic FOV based on aspect ratio
    const updateFOV = (viewportWidth: number, viewportHeight: number) => {
      if (viewportWidth < viewportHeight) { // Mobile Portrait
        camera.fov = 65;
      } else {
        camera.fov = 45;
      }
      camera.updateProjectionMatrix();
    };
    updateFOV(width, height);

    camera.position.set(0, 4, 7); // Brought camera closer to avoid clipping interior walls
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better cinematic look
    renderer.toneMappingExposure = 1.2; // Restored to previous brightness
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer, cleaner shadows
    const applyRendererQuality = () => {
      const pixelRatioCap = showCoverRef.current ? COVER_PIXEL_RATIO_CAP : ACTIVE_PIXEL_RATIO_CAP;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
    };
    applyRendererQuality();
    applyRendererQualityRef.current = applyRendererQuality;
    renderer.setSize(width, height);
    mountNode.appendChild(renderer.domElement);

    // Expose scene for debugging
    if (process.env.NODE_ENV !== 'production') {
      (window as any).scene = scene;
    }

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

    // 3. Shared Loading Infrastructure
    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);
    let warmupTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let warmupIdleId: number | null = null;

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (onLoadProgress) onLoadProgress(Math.round((itemsLoaded / itemsTotal) * 100));
    };

    const warmupScene = () => {
      if (!sceneLoadedRef.current || !needsWarmupRef.current) return;
      renderer.render(scene, camera);
      renderer.compile(scene, camera);
      needsWarmupRef.current = false;
    };

    manager.onLoad = () => {
      sceneLoadedRef.current = true;
      needsWarmupRef.current = true;

      // Warm the scene in the background when the browser is idle so entering still feels seamless.
      if (showCoverRef.current) {
        if ('requestIdleCallback' in window) {
          warmupIdleId = window.requestIdleCallback(() => {
            warmupScene();
          }, { timeout: 2000 });
        } else {
          warmupTimeoutId = setTimeout(() => {
            warmupScene();
          }, 1000);
        }
      } else {
        warmupScene();
      }

      setTimeout(() => {
        if (onLoadComplete) onLoadComplete();
      }, 300);
    };

    // 4. Parallel Asset Loading
    const envUrl = '/sci-fi_interior_room.glb';
    const deskUrl = '/cyberpunk_desk.glb';

    loader.load(envUrl, (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.receiveShadow = true;
          mesh.castShadow = true;
          if (mesh.material && (mesh.material as any).aoMap) {
            (mesh.material as any).aoMapIntensity = 1.5;
          }
          const lowName = mesh.name.toLowerCase();
          const artifactKeywords = ['decal', 'grid', 'wireframe', 'tv', 'screen', 'part', 'mesh', 'joint', 'wire', 'torus', 'arc', 'torus', 'circle'];
          if (artifactKeywords.some(key => lowName.includes(key))) mesh.visible = false;
        }
      });
      model.scale.set(2.0, 2.0, 2.0);
      model.position.y = -1;
      scene.add(model);
    });

    loader.load(deskUrl, (deskGltf) => {
      const desk = deskGltf.scene;
      const fireboyItem = resumeData.find(d => d.id === 'fireboy-watergirl');
      const sffItem = resumeData.find(d => d.id === 'arbitrage-app');

      const deskPivot = new THREE.Group();
      deskPivot.name = 'deskPivot';
      deskPivot.position.set(0, -1, 3.0);
      deskPivot.rotation.y = Math.PI;
      scene.add(deskPivot);

      // --- 3D SIGNPOST IMPLEMENTATION ---
      const createSignpost = () => {
        const signpostGroup = new THREE.Group();
        signpostGroup.name = 'signpost';

        // 1. The Post (Matte Black) - Positioned behind boards to avoid clipping
        const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.2, 12);
        const postMat = new THREE.MeshStandardMaterial({
          color: '#111111',
          roughness: 0.8,
          metalness: 0.1
        });
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(0, 0.9, -0.1);
        post.castShadow = true;
        post.receiveShadow = true;
        signpostGroup.add(post);

        // 2. Helper to create a board with unified "Sleek Opaque Matte Black" style
        const createBoard = (text: string, id: string, y: number, rotationY: number, font: string = '900 72px Inter, sans-serif') => {
          const boardGroup = new THREE.Group();
          boardGroup.position.y = y;
          boardGroup.rotation.y = rotationY;
          boardGroup.rotation.z = (Math.random() - 0.5) * 0.05;

          // Unified Opaque Matte Black Material - Thicker for premium look
          const boardGeo = new THREE.BoxGeometry(1.6, 0.5, 0.1);
          const boardMat = new THREE.MeshStandardMaterial({
            color: '#111111',
            roughness: 0.8,
            metalness: 0.2
          });
          const board = new THREE.Mesh(boardGeo, boardMat);
          board.position.z = 0; // Board at local origin
          board.castShadow = true;
          board.receiveShadow = true;
          board.userData = { id, type: 'signboard' };
          boardGroup.add(board);

          // Subtle Gray Border
          const edges = new THREE.EdgesGeometry(boardGeo);
          const borderMat = new THREE.LineBasicMaterial({ color: '#666666', transparent: true, opacity: 0.3 });
          const border = new THREE.LineSegments(edges, borderMat);
          boardGroup.add(border);

          // Text Label using CanvasTexture
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
          }
          const texture = new THREE.CanvasTexture(canvas);
          const labelGeo = new THREE.PlaneGeometry(1.4, 0.35);
          const labelMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            // Basic material ensures identical brightness regardless of scene lighting
          });
          const label = new THREE.Mesh(labelGeo, labelMat);
          label.position.z = 0.051; // Just in front of board surface (half-depth 0.05 + 0.001)
          label.userData = { id, type: 'signboard' };
          boardGroup.add(label);

          // Interaction Light
          const light = new THREE.PointLight(new THREE.Color('#ffffff'), 0, 2);
          light.name = 'hoverLight';
          light.position.set(0, 0, 0.5);
          boardGroup.add(light);

          signpostGroup.add(boardGroup);

          meshes.push({
            obj: boardGroup,
            item: { id, color: '#ffffff', hoverScale: 1.35 } as any,
            baseY: y,
            isModel: true
          });
        };

        const contactGroup = new THREE.Group();
        contactGroup.position.set(0, 0.45, 0);
        contactGroup.rotation.y = 0.4;

        const totalWidth = 2.2;
        const hWidth = 1.6;
        const sWidth = 0.3; // Reduced from 0.4 to keep total width 2.4
        const defaultFont = '900 72px Inter, sans-serif';

        const createSegment = (type: 'text' | 'linkedin' | 'email', labelOrId: string, xPos: number, width: number, id: string, font: string = defaultFont) => {
          const segmentGroup = new THREE.Group();
          segmentGroup.position.x = xPos;
          contactGroup.add(segmentGroup);

          const boardGeo = new THREE.BoxGeometry(width, 0.5, 0.1);
          const boardMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.8, metalness: 0.2 });
          const board = new THREE.Mesh(boardGeo, boardMat);
          segmentGroup.add(board);

          // Standard font for text to match other boards
          // Square canvases for icons to prevent stretching
          const canvas = document.createElement('canvas');
          if (type === 'text') {
            canvas.width = 512; // Match the other signboard texture aspect ratio to avoid squashing the text
            canvas.height = 128;
          } else {
            canvas.width = 256;
            canvas.height = 256;
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (type === 'text') {
              const sizeMatch = font.match(/(\d+)px/);
              const baseFontSize = sizeMatch ? parseInt(sizeMatch[1], 10) : 72;
              const maxTextWidth = canvas.width * 0.92;
              let fittedFont = font;
              let fittedSize = baseFontSize;

              ctx.font = fittedFont;
              while (ctx.measureText(labelOrId).width > maxTextWidth && fittedSize > 10) {
                fittedSize -= 1;
                fittedFont = font.replace(/\d+px/, `${fittedSize}px`);
                ctx.font = fittedFont;
              }

              ctx.fillText(labelOrId, canvas.width / 2, canvas.height / 2);
            } else if (type === 'linkedin') {
              ctx.font = 'bold 120px Inter, system-ui, sans-serif';
              ctx.fillText('in', canvas.width / 2, canvas.height / 2);
            } else if (type === 'email') {
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 10;
              const w = 120;
              const h = 80;
              const cx = canvas.width / 2;
              const cy = canvas.height / 2;
              ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
              ctx.beginPath();
              ctx.moveTo(cx - w / 2, cy - h / 2);
              ctx.lineTo(cx, cy);
              ctx.lineTo(cx + w / 2, cy - h / 2);
              ctx.stroke();
            }
          }

          const texture = new THREE.CanvasTexture(canvas);
          const labelWidth = type === 'text' ? 1.44 : width * 0.85;
          const labelHeight = 0.35; // Match createBoard
          const label = new THREE.Mesh(new THREE.PlaneGeometry(labelWidth, labelHeight), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
          label.position.set(0, 0, 0.051);
          segmentGroup.add(label);

          const light = new THREE.PointLight(new THREE.Color('#ffffff'), 0, 2);
          light.name = 'hoverLight';
          light.position.set(0, 0, 0.5);
          segmentGroup.add(light);

          board.userData = { id, type: 'signboard' };
          label.userData = { id, type: 'signboard' };
          meshes.push({ obj: segmentGroup, item: { id, color: '#ffffff', hoverScale: 1.35 } as any, baseY: 0.8, isModel: true });
        };

        const createLine = (xPos: number) => {
          const lineGeo = new THREE.BoxGeometry(0.01, 0.4, 0.02);
          const lineMat = new THREE.MeshBasicMaterial({ color: '#333333' });
          const line = new THREE.Mesh(lineGeo, lineMat);
          line.position.set(xPos, 0, 0.05);
          contactGroup.add(line);
        };

        createSegment('text', 'CONTACT ME', -(totalWidth / 2) + hWidth / 2, hWidth, 'ui-contact-header', '900 76px Inter, sans-serif');
        createLine(-(totalWidth / 2) + hWidth);
        createSegment('linkedin', '', -(totalWidth / 2) + hWidth + sWidth / 2, sWidth, 'ui-linkedin');
        createLine(-(totalWidth / 2) + hWidth + sWidth);
        createSegment('email', '', -(totalWidth / 2) + hWidth + sWidth + sWidth / 2, sWidth, 'ui-email');

        signpostGroup.add(contactGroup);
        contactGroup.rotation.y = 0.25;

        createBoard("ABOUT ME", "ui-about", 2.45, -0.35, "900 72px Inter, sans-serif");
        createBoard("INVOLVEMENTS", "ui-involvements", 1.8, 0.05, "900 54px Inter, sans-serif");
        createBoard("RESUME PDF", "ui-resume", 1.15, 0.25, "900 72px Inter, sans-serif");
        createBoard("GO BACK", "ui-back", -0.15, -0.15, "900 72px Inter, sans-serif");

        signpostGroup.position.set(...signpostConfig.position);
        signpostGroup.rotation.y = THREE.MathUtils.degToRad(signpostConfig.rotationY);
        scene.add(signpostGroup);
      };

      createSignpost();

      desk.scale.set(0.8, 0.8, 0.8);
      const dBox = new THREE.Box3().setFromObject(desk);
      const dCenter = dBox.getCenter(new THREE.Vector3());
      desk.position.set(-dCenter.x, -dBox.min.y, -dCenter.z);
      deskPivot.add(desk);

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

      if (targets.pc && sffItem) {
        const activePC = targets.pc;
        activePC.castShadow = true;
        activePC.receiveShadow = true;
        if (activePC.material) {
          activePC.material = Array.isArray(activePC.material)
            ? activePC.material.map((material) => material.clone())
            : activePC.material.clone();

          const pcMaterials = Array.isArray(activePC.material) ? activePC.material : [activePC.material];
          pcMaterials.forEach((material) => {
            if ('transparent' in material) material.transparent = false;
            if ('opacity' in material) material.opacity = 1;
            if ('alphaTest' in material) material.alphaTest = 0;
            if ('depthWrite' in material) material.depthWrite = true;
            material.needsUpdate = true;
          });
        }

        activePC.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(activePC);
        const worldCenter = box.getCenter(new THREE.Vector3());

        const pcPivot = new THREE.Group();
        pcPivot.name = 'pcPivot';
        const pcHoverGroup = new THREE.Group();
        pcHoverGroup.name = 'pcHoverGroup';

        desk.add(pcPivot);
        const configuredPcPosition = new THREE.Vector3(...sffItem.position);
        pcPivot.position.copy(configuredPcPosition);
        pcPivot.add(pcHoverGroup);

        pcHoverGroup.attach(activePC);
        activePC.updateMatrixWorld(true);

        pcHoverGroup.scale.set(sffItem.scale, sffItem.scale, sffItem.scale);
        pcHoverGroup.userData.hoverLiftPerScale = 0;
        activePC.userData = { id: 'arbitrage-app' };

        meshes.push({ obj: pcHoverGroup, item: sffItem, baseY: pcPivot.position.y, isModel: true });
        const light = new THREE.PointLight(new THREE.Color(sffItem.color), 0, 3);
        light.name = 'hoverLight';
        pcHoverGroup.add(light);
      }

      if (targets.monitor && targets.screen && fireboyItem) {
        const monitor = targets.monitor;
        const screen = targets.screen;
        monitor.castShadow = true;
        monitor.receiveShadow = true;
        screen.castShadow = true;
        screen.receiveShadow = true;

        monitor.updateMatrixWorld(true);
        screen.updateMatrixWorld(true);

        const monitorBox = new THREE.Box3().setFromObject(monitor);
        monitorBox.expandByObject(screen);
        const worldAssemblyCenter = monitorBox.getCenter(new THREE.Vector3());
        const worldAssemblyBottom = new THREE.Vector3(worldAssemblyCenter.x, monitorBox.min.y, worldAssemblyCenter.z);

        const monitorPivot = new THREE.Group();
        monitorPivot.name = 'monitorPivot';

        desk.add(monitorPivot);
        const localAssemblyBottom = desk.worldToLocal(worldAssemblyBottom.clone());
        monitorPivot.position.copy(localAssemblyBottom);

        monitorPivot.attach(monitor);
        monitorPivot.attach(screen);
        monitorPivot.scale.set(fireboyItem.scale, fireboyItem.scale, fireboyItem.scale);

        monitor.userData = { id: 'fireboy-watergirl' };
        screen.userData = { id: 'fireboy-watergirl' };

        meshes.push({ obj: monitorPivot, item: fireboyItem, baseY: monitorPivot.position.y, isModel: true });
        const light = new THREE.PointLight(new THREE.Color(fireboyItem.color), 0, 3);
        light.position.set(0, 0, 1.0);
        light.name = 'hoverLight';
        monitorPivot.add(light);
      }

      desk.traverse((child: any) => {
        if (child.isMesh) {
          const mesh = child as THREE.Mesh;
          if (child === targets.pc || child === targets.monitor || child === targets.screen) return;
          if (mesh.name.toLowerCase().includes('leg')) { mesh.visible = false; return; }
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
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
      if (item.id === 'fireboy-watergirl') return; // Represented by the desk monitors

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

          // The diploma_frame.glb has an inherent tilt baked into its child nodes.
          // Zero out all direct children's rotations so the top-level rotation
          // from resume.ts is the sole source of truth for orientation.
          if (item.id === 'osu') {
            model.children.forEach((child: THREE.Object3D) => {
              child.rotation.set(0, 0, 0);
            });
          }

          const light = new THREE.PointLight(new THREE.Color(item.color), 0, 3);
          light.position.set(0, 1, 0);
          light.name = 'hoverLight';

          if (item.id === 'columbus-capital') {
            model.updateMatrixWorld(true);
            const hoverBox = new THREE.Box3().setFromObject(model);
            const hoverCenter = hoverBox.getCenter(new THREE.Vector3());
            const hoverBottomCenter = new THREE.Vector3(
              hoverCenter.x,
              hoverBox.min.y,
              hoverCenter.z
            );

            const hoverPivot = new THREE.Group();
            hoverPivot.position.copy(hoverBottomCenter);
            scene.add(hoverPivot);
            hoverPivot.attach(model);

            model.updateMatrixWorld(true);
            const localBottomCenter = hoverPivot.worldToLocal(hoverBottomCenter.clone());
            model.position.sub(localBottomCenter);

            model.userData = { ...model.userData, id: item.id, color: item.color };
            hoverPivot.add(light);
            meshes.push({ obj: hoverPivot, item, baseY: hoverPivot.position.y, isModel: true });
          } else {
            model.userData = { ...model.userData, id: item.id, color: item.color };
            model.add(light);
            scene.add(model);
            meshes.push({ obj: model, item, baseY: model.position.y, isModel: true });
          }
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
    const cameraTarget = new THREE.Vector3(...cameraConfig.recenterTarget);
    const desiredCameraPosition = new THREE.Vector3();
    const desiredCameraTarget = new THREE.Vector3(...cameraConfig.recenterTarget);
    let pendingPointerPosition: { clientX: number; clientY: number } | null = null;
    let hoverFrameId: number | null = null;

    const playHoverAnimation = (id: string | null, isHovering: boolean) => {
      const targetMesh = meshes.find(m => m.item.id === id);
      if (!targetMesh) return;

      const obj = targetMesh.obj;
      const initialScale = obj.userData.initialScale || obj.scale.clone();
      if (!obj.userData.initialScale) obj.userData.initialScale = initialScale.clone();
      const initialPosition = obj.userData.initialPosition || obj.position.clone();
      if (!obj.userData.initialPosition) obj.userData.initialPosition = initialPosition.clone();

      gsap.killTweensOf(obj.scale);
      gsap.killTweensOf(obj.position);

      if (isHovering) {
        const hoverScale = targetMesh.item.hoverScale;
        gsap.to(obj.scale, {
          x: initialScale.x * hoverScale,
          y: initialScale.y * hoverScale,
          z: initialScale.z * hoverScale,
          duration: 0.5,
          ease: "back.out(2)"
        });
        gsap.to(obj.position, {
          x: initialPosition.x,
          y: initialPosition.y + ((obj.userData.hoverLiftPerScale || 0) * (hoverScale - 1)),
          z: initialPosition.z,
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
        gsap.to(obj.position, {
          x: initialPosition.x,
          y: initialPosition.y,
          z: initialPosition.z,
          duration: 0.3,
          ease: "back.out(2)"
        });
      }
    };

    const checkIntersections = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

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

    const scheduleIntersectionCheck = (clientX: number, clientY: number) => {
      pendingPointerPosition = { clientX, clientY };
      if (hoverFrameId !== null) return;

      hoverFrameId = requestAnimationFrame(() => {
        hoverFrameId = null;
        if (!pendingPointerPosition) return;
        const { clientX: pendingX, clientY: pendingY } = pendingPointerPosition;
        pendingPointerPosition = null;
        checkIntersections(pendingX, pendingY);
      });
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
      checkIntersections(e.clientX, e.clientY);
      if (!currentHover) {
        isGrabbingRef.current = true;
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (isGrabbingRef.current) {
        const deltaX = e.clientX - prevMouseRef.current.x;
        const deltaY = e.clientY - prevMouseRef.current.y;
        rotationRef.current.yaw -= deltaX * 0.005;
        rotationRef.current.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.pitch + deltaY * 0.005));
        prevMouseRef.current = { x: e.clientX, y: e.clientY };
      } else {
        scheduleIntersectionCheck(e.clientX, e.clientY);
      }
    };

    const handlePointerUp = () => {
      isGrabbingRef.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const fakeMouseEvent = { clientX: touch.clientX, clientY: touch.clientY } as MouseEvent;
        handlePointerDown(fakeMouseEvent);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const fakeMouseEvent = { clientX: touch.clientX, clientY: touch.clientY } as MouseEvent;
        handlePointerMove(fakeMouseEvent);
      }
    };

    const handleTouchEnd = () => {
      handlePointerUp();
    };

    const handleClick = (e: MouseEvent) => {
      checkIntersections(e.clientX, e.clientY);
      if (currentHover) {
        if (currentHover === 'ui-about') {
          onSelect('about-me');
          return;
        }
        if (currentHover === 'ui-involvements') {
          onSelect('involvements');
          return;
        }
        if (currentHover === 'ui-resume') {
          if (onResume) onResume();
          return;
        }
        if (currentHover === 'ui-back') {
          if (onBack) onBack();
          return;
        }
        if (currentHover === 'ui-linkedin' || currentHover === 'ui-contact-header') {
          window.open('https://www.linkedin.com/in/aditya-induri/', '_blank');
          return;
        }
        if (currentHover === 'ui-email') {
          window.location.href = 'mailto:adityainduri37@gmail.com';
          return;
        }

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
    renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    renderer.domElement.addEventListener('touchend', handleTouchEnd);
    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!mountNode) return;
      const w = mountNode.clientWidth;
      const h = mountNode.clientHeight;
      camera.aspect = w / h;
      updateFOV(w, h);
      applyRendererQuality();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const renderFrame = () => {
      if (!sceneLoadedRef.current) return;

      renderer.render(scene, camera);
    };

    renderFrameRef.current = renderFrame;

    const advanceScene = (delta: number) => {
      if (!sceneLoadedRef.current) return;

      if (needsWarmupRef.current && !showCoverRef.current) {
        warmupScene();
      }

      mixers.current.forEach(m => m.update(delta));

      meshes.forEach(({ obj, item, isModel }) => {
        if (isModel) {
          const light = obj.getObjectByName('hoverLight') as THREE.PointLight;
          if (light) light.intensity = 0;
        } else {
          obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const mat = child.material as THREE.MeshStandardMaterial;
              if ('emissiveIntensity' in mat) mat.emissiveIntensity = 0;
              if ('opacity' in mat) mat.opacity = 1;
            }
          });
        }
      });

      const zoom = zoomRef.current;
      const { yaw, pitch } = rotationRef.current;

      const baseRadius = cameraConfig.orbitRadius;
      const radius = baseRadius * zoom;
      const camX = Math.sin(yaw) * Math.cos(pitch) * radius;
      const camY = Math.sin(pitch) * radius;
      const camZ = Math.cos(yaw) * Math.cos(pitch) * radius;

      const lerpFactor = 0.05;

      // Always stay in the orbital overview; selection should not reroute the camera.
      desiredCameraPosition.set(
        cameraConfig.recenterTarget[0] + camX + cameraConfig.recenterOffset[0],
        cameraConfig.recenterTarget[1] + camY + cameraConfig.recenterOffset[1],
        cameraConfig.recenterTarget[2] + camZ + cameraConfig.recenterOffset[2]
      );
      camera.position.lerp(desiredCameraPosition, lerpFactor);
      cameraTarget.lerp(desiredCameraTarget, lerpFactor);

      camera.lookAt(cameraTarget);
      renderFrame();
    };

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      advanceScene(delta);
    };

    const startAnimation = () => {
      if (backgroundTimerRef.current !== null) {
        clearTimeout(backgroundTimerRef.current);
        backgroundTimerRef.current = null;
      }
      if (animationFrameRef.current !== null) return;
      clock.start();
      clock.getDelta();
      animate();
    };

    startAnimationRef.current = startAnimation;

    const startBackgroundAnimation = () => {
      if (!showCoverRef.current || backgroundTimerRef.current !== null || animationFrameRef.current !== null) return;

      const tick = () => {
        backgroundTimerRef.current = window.setTimeout(() => {
          backgroundTimerRef.current = null;
          advanceScene(clock.getDelta());

          if (showCoverRef.current) {
            tick();
          }
        }, 1000 / 12);
      };

      clock.start();
      clock.getDelta();
      tick();
    };

    startBackgroundAnimationRef.current = startBackgroundAnimation;

    if (showCoverRef.current) {
      startBackgroundAnimation();
    } else {
      startAnimation();
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (backgroundTimerRef.current !== null) {
        clearTimeout(backgroundTimerRef.current);
        backgroundTimerRef.current = null;
      }
      if (hoverFrameId !== null) {
        cancelAnimationFrame(hoverFrameId);
        hoverFrameId = null;
      }
      if (warmupIdleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(warmupIdleId);
      }
      if (warmupTimeoutId !== null) {
        clearTimeout(warmupTimeoutId);
      }
      pendingPointerPosition = null;
      renderFrameRef.current = null;
      startAnimationRef.current = null;
      startBackgroundAnimationRef.current = null;
      applyRendererQualityRef.current = null;
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      renderer.domElement.removeEventListener('touchmove', handleTouchMove);
      renderer.domElement.removeEventListener('touchend', handleTouchEnd);
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
    // Smoothly pan back to the shared overview instead of snapping.
    gsap.killTweensOf(rotationRef.current);
    gsap.killTweensOf(zoomRef);
    gsap.to(rotationRef.current, {
      yaw: cameraConfig.recenterRotation.yaw,
      pitch: cameraConfig.recenterRotation.pitch,
      duration: 2.5,
      ease: "power2.inOut"
    });
    gsap.to(zoomRef, {
      current: cameraConfig.recenterZoom,
      duration: 2.5,
      ease: "power2.inOut"
    });
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

      {/*
      Dev helper to capture the current camera view and paste it back into cameraConfig:
      <button
        onClick={copyCurrentView}
        className="absolute bottom-24 right-6 z-20 flex items-center justify-center py-2 px-4 rounded-2xl bg-white/75 backdrop-blur-md hover:bg-white/95 transition-all border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-sm font-semibold text-[#1a1a1a] cursor-pointer"
        title="Copy the current camera view as a recenter config snippet"
      >
        Copy View
      </button>
      */}
    </div>
  );
}
