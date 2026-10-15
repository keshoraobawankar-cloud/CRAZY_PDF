import * as THREE from 'three';

// Create procedural soft radial contact shadow texture
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Create procedural arena floor grid texture
export function createArenaGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 2;
  const step = 64;
  for (let x = 0; x <= 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Inner accents
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
  ctx.lineWidth = 1;
  for (let x = step / 2; x <= 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 1. Composite 9-Part Procedural Athlete Hero
export function createHeroAthlete(): THREE.Group {
  const hero = new THREE.Group();
  hero.name = 'HeroAthlete';

  // Materials with varied roughness and metalness
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.6,
    roughness: 0.35,
  });
  const coreArmorMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Vibrant cyan/sky athletic armor
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0x0369a1,
    emissiveIntensity: 0.35,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
  });
  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.85,
    roughness: 0.2,
  });

  // Part 1: Torso / Chest Plate
  const torsoGeom = new THREE.BoxGeometry(0.7, 0.85, 0.45);
  const torso = new THREE.Mesh(torsoGeom, coreArmorMat);
  torso.position.y = 1.35;
  torso.castShadow = true;
  torso.receiveShadow = true;
  hero.add(torso);

  // Part 2: Head & Aerodynamic Visor
  const headGeom = new THREE.BoxGeometry(0.42, 0.45, 0.42);
  const head = new THREE.Mesh(headGeom, bodyMat);
  head.position.y = 2.05;
  head.castShadow = true;
  hero.add(head);

  const visorGeom = new THREE.BoxGeometry(0.44, 0.14, 0.25);
  const visor = new THREE.Mesh(visorGeom, visorMat);
  visor.position.set(0, 2.05, 0.18);
  hero.add(visor);

  // Part 3: Glowing GSPA Core (Centerpiece on chest)
  const coreGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
  coreGeom.rotateX(Math.PI / 2);
  const core = new THREE.Mesh(coreGeom, goldAccentMat);
  core.position.set(0, 1.45, 0.24);
  hero.add(core);

  // Part 4 & 5: Shoulders & Arms (Left & Right)
  const armGeom = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8);
  const leftArm = new THREE.Mesh(armGeom, bodyMat);
  leftArm.position.set(-0.52, 1.25, 0);
  leftArm.castShadow = true;
  hero.add(leftArm);

  const rightArm = new THREE.Mesh(armGeom, bodyMat);
  rightArm.position.set(0.52, 1.25, 0);
  rightArm.castShadow = true;
  hero.add(rightArm);

  // Part 6 & 7: Athletic Runners/Legs
  const legGeom = new THREE.CylinderGeometry(0.14, 0.12, 0.9, 8);
  const leftLeg = new THREE.Mesh(legGeom, bodyMat);
  leftLeg.position.set(-0.24, 0.5, 0);
  leftLeg.castShadow = true;
  hero.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeom, bodyMat);
  rightLeg.position.set(0.24, 0.5, 0);
  rightLeg.castShadow = true;
  hero.add(rightLeg);

  // Part 8: Foot Base / Trainers
  const footGeom = new THREE.BoxGeometry(0.2, 0.14, 0.35);
  const leftFoot = new THREE.Mesh(footGeom, coreArmorMat);
  leftFoot.position.set(-0.24, 0.07, 0.05);
  leftFoot.castShadow = true;
  hero.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeom, coreArmorMat);
  rightFoot.position.set(0.24, 0.07, 0.05);
  rightFoot.castShadow = true;
  hero.add(rightFoot);

  // Part 9: Contact Shadow Plane flush with the ground
  const shadowTex = createContactShadowTexture();
  const shadowGeom = new THREE.PlaneGeometry(1.4, 1.4);
  shadowGeom.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeom, shadowMat);
  shadow.position.y = 0.02;
  hero.add(shadow);

  return hero;
}

// 2. Composite GSPA Habit Rune / Pickup (Glowing Floating Monument)
export function createHabitRune(type: 'hydration' | 'protein' | 'strength' | 'recovery'): THREE.Group {
  const group = new THREE.Group();
  group.name = `Rune_${type}`;

  const colors = {
    hydration: { main: 0x38bdf8, emissive: 0x0284c7 }, // Cyan Water
    protein: { main: 0x10b981, emissive: 0x059669 },   // Emerald Nutrition
    strength: { main: 0xf59e0b, emissive: 0xd97706 },  // Amber Barbells
    recovery: { main: 0x8b5cf6, emissive: 0x7c3aed },  // Violet Sleep
  }[type];

  // Part 1: Floating Octahedron Core
  const coreGeom = new THREE.OctahedronGeometry(0.45, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: colors.main,
    emissive: colors.emissive,
    emissiveIntensity: 0.8,
    metalness: 0.5,
    roughness: 0.2,
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  core.position.y = 1.0;
  core.castShadow = true;
  group.add(core);

  // Part 2: Orbital Gyro Ring
  const ringGeom = new THREE.TorusGeometry(0.65, 0.04, 8, 24);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.1,
    emissive: colors.emissive,
    emissiveIntensity: 0.4,
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.position.y = 1.0;
  ring.name = 'gyroRing';
  group.add(ring);

  // Part 3: Energy Base Pedestal Beacon
  const baseGeom = new THREE.CylinderGeometry(0.4, 0.55, 0.2, 8);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.3,
  });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.1;
  base.receiveShadow = true;
  group.add(base);

  // Part 4: Soft Ground Contact Shadow
  const shadowTex = createContactShadowTexture();
  const shadowGeom = new THREE.PlaneGeometry(1.2, 1.2);
  shadowGeom.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeom, shadowMat);
  shadow.position.y = 0.02;
  group.add(shadow);

  return group;
}

// 3. Composite Hazard Drone (Distraction Drone with visible windup telegraph)
export function createHazardDrone(): THREE.Group {
  const drone = new THREE.Group();
  drone.name = 'HazardDrone';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.8,
    roughness: 0.25,
  });
  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red hazard
    emissive: 0xdc2626,
    emissiveIntensity: 0.6,
    metalness: 0.7,
    roughness: 0.3,
  });

  // Part 1: Central Spiked Hull
  const hullGeom = new THREE.ConeGeometry(0.5, 0.9, 4);
  hullGeom.rotateX(Math.PI);
  const hull = new THREE.Mesh(hullGeom, bodyMat);
  hull.position.y = 1.2;
  hull.castShadow = true;
  drone.add(hull);

  // Part 2: Glowing Targeting Eye / Core
  const eyeGeom = new THREE.SphereGeometry(0.18, 12, 12);
  const eye = new THREE.Mesh(eyeGeom, hazardMat);
  eye.position.set(0, 1.1, 0.25);
  eye.name = 'targetingEye';
  drone.add(eye);

  // Part 3: Dual Thruster Pods
  const thrusterGeom = new THREE.CylinderGeometry(0.08, 0.12, 0.4, 8);
  const leftThruster = new THREE.Mesh(thrusterGeom, bodyMat);
  leftThruster.position.set(-0.45, 1.3, -0.2);
  drone.add(leftThruster);

  const rightThruster = new THREE.Mesh(thrusterGeom, bodyMat);
  rightThruster.position.set(0.45, 1.3, -0.2);
  drone.add(rightThruster);

  // Part 4: Telegraph Windup Warning Ring on Floor (Initially Hidden/Scaled)
  const warnGeom = new THREE.RingGeometry(0.8, 0.95, 24);
  warnGeom.rotateX(-Math.PI / 2);
  const warnMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const warningRing = new THREE.Mesh(warnGeom, warnMat);
  warningRing.name = 'telegraphRing';
  warningRing.position.y = 0.03;
  drone.add(warningRing);

  // Part 5: Contact Shadow
  const shadowTex = createContactShadowTexture();
  const shadowGeom = new THREE.PlaneGeometry(1.2, 1.2);
  shadowGeom.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeom, shadowMat);
  shadow.position.y = 0.02;
  drone.add(shadow);

  return drone;
}
