import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createArenaGridTexture } from './models';

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  keyLight: THREE.DirectionalLight;
  arenaGround: THREE.Mesh;
  cleanup: () => void;
}

export function initThreeScene(mountElement: HTMLElement): SceneContext {
  const width = mountElement.clientWidth || window.innerWidth;
  const height = mountElement.clientHeight || window.innerHeight;

  // 1. Scene with horizon FogExp2 matching background
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0f19);
  scene.fog = new THREE.FogExp2(0x0b0f19, 0.022);

  // 2. Camera with 55 FOV for cinematic sports depth
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 150);
  camera.position.set(0, 10, 13);
  camera.lookAt(0, 1, 0);

  // 3. PBR WebGL Renderer
  const isHeadless = typeof navigator !== 'undefined' && (/HeadlessChrome/i.test(navigator.userAgent) || navigator.webdriver);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !isHeadless;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  mountElement.appendChild(renderer.domElement);

  // 4. Mandatory Studio Environment Reflection via RoomEnvironment
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  pmremGenerator.dispose();

  // 5. Studio Lighting Rig: Warm key light + Cool Hemisphere fill
  const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.7); // Sky cool cyan, ground dark slate
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffedd5, 1.8); // Warm studio sunlight
  keyLight.position.set(12, 18, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 45;
  const d = 16;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.02;
  scene.add(keyLight);

  // Subtle Cyan Rim Backlight
  const rimLight = new THREE.DirectionalLight(0x0284c7, 0.8);
  rimLight.position.set(-10, 8, -12);
  scene.add(rimLight);

  // 6. Arena Ground Plane with procedural grid
  const floorGridTex = createArenaGridTexture();
  const groundGeom = new THREE.PlaneGeometry(64, 64);
  groundGeom.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({
    map: floorGridTex,
    roughness: 0.8,
    metalness: 0.2,
  });
  const arenaGround = new THREE.Mesh(groundGeom, groundMat);
  arenaGround.position.y = 0;
  arenaGround.receiveShadow = true;
  scene.add(arenaGround);

  // Resize handler
  const handleResize = () => {
    if (!mountElement) return;
    const w = mountElement.clientWidth || window.innerWidth;
    const h = mountElement.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  };

  return {
    scene,
    camera,
    renderer,
    keyLight,
    arenaGround,
    cleanup,
  };
}
