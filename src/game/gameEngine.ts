import * as THREE from 'three';
import { createHeroAthlete, createHabitRune, createHazardDrone } from './models';
import { soundFX } from './audio';

export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface GameStats {
  score: number;
  habitsCollected: number;
  comboStreak: number;
  health: number;
  maxHealth: number;
  currentWave: number;
  totalWaves: number;
  gspaMultiplier: number;
  dashCooldownRemaining: number;
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  public state: GameState = 'title';
  public onStatsUpdate?: (stats: GameStats) => void;
  public onStateChange?: (state: GameState) => void;

  // Player
  private hero: THREE.Group;
  private heroVelocity = new THREE.Vector3();
  private heroFacingAngle = 0;
  private heroHealth = 100;
  private maxHealth = 100;
  private isDashing = false;
  private dashTimeRemaining = 0;
  private dashCooldown = 0;
  private invulnerableTimer = 0;

  // Runes & Enemies
  private runes: Array<{
    group: THREE.Group;
    type: 'hydration' | 'protein' | 'strength' | 'recovery';
    collected: boolean;
  }> = [];

  private hazards: Array<{
    group: THREE.Group;
    state: 'patrol' | 'telegraph' | 'lunge';
    timer: number;
    targetPos: THREE.Vector3;
    speed: number;
  }> = [];

  // Particles
  private particles: Particle[] = [];
  private particleGeom = new THREE.SphereGeometry(0.08, 6, 6);
  private particleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // Game Progress
  private score = 0;
  private combo = 1;
  private habitsCollected = 0;
  private currentWave = 1;
  private readonly totalWaves = 3;
  private waveHabitsTarget = 5;

  // Camera trauma / shake
  private cameraShake = 0;
  private cameraBaseTarget = new THREE.Vector3(0, 1, 0);

  // Hitstop
  private hitstopTimer = 0;

  // Input
  private keysHeld: Record<string, boolean> = {};
  private dashRequested = false;

  private isRunning = false;
  private lastTime = 0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    // Create hero
    this.hero = createHeroAthlete();
    this.scene.add(this.hero);

    this.setupInputs();
    this.spawnWave(1);
  }

  private setupInputs() {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keysHeld[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.state === 'title') {
          this.startGame();
        } else if (this.state === 'playing') {
          this.dashRequested = true;
        } else if (this.state === 'gameover' || this.state === 'victory') {
          this.restartGame();
        }
      } else if (e.code === 'Enter') {
        if (this.state === 'title') {
          this.startGame();
        } else if (this.state === 'gameover' || this.state === 'victory') {
          this.restartGame();
        }
      } else if (e.code === 'Escape') {
        if (this.state === 'playing') {
          this.pauseGame();
        } else if (this.state === 'paused') {
          this.resumeGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keysHeld[e.code] = false;
    };

    const handleBlur = () => {
      this.keysHeld = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
  }

  public startGame() {
    this.state = 'playing';
    this.score = 0;
    this.combo = 1;
    this.heroHealth = this.maxHealth;
    this.habitsCollected = 0;
    this.currentWave = 1;
    this.spawnWave(1);
    this.onStateChange?.(this.state);
  }

  public pauseGame() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.onStateChange?.(this.state);
    }
  }

  public resumeGame() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.onStateChange?.(this.state);
    }
  }

  public restartGame() {
    this.startGame();
  }

  public startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  public stopLoop() {
    this.isRunning = false;
  }

  private tick = () => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.tick);

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp delta time to avoid physics tunneling
    const dt = Math.min(rawDt, 0.05);

    // Hitstop freeze
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.state === 'title') {
      this.updateTitleScreen(dt);
    } else if (this.state === 'playing') {
      this.updateGameplay(dt);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private updateTitleScreen(dt: number) {
    // Atmospheric slow orbiting camera around the athletic hero centerpiece
    const time = performance.now() * 0.0006;
    const radius = 8.5;
    this.camera.position.x = Math.sin(time) * radius;
    this.camera.position.z = Math.cos(time) * radius;
    this.camera.position.y = 4.5 + Math.sin(time * 0.5) * 0.8;
    this.camera.lookAt(0, 1.3, 0);

    // Hero idle breathing animation
    this.hero.rotation.y = Math.sin(time * 0.5) * 0.2;
    this.hero.scale.y = 1 + Math.sin(time * 3) * 0.02;
  }

  private spawnWave(waveNum: number) {
    this.currentWave = waveNum;
    this.waveHabitsTarget = waveNum === 1 ? 5 : waveNum === 2 ? 7 : 9;

    // Clean old runes
    this.runes.forEach((r) => this.scene.remove(r.group));
    this.runes = [];

    // Clean old hazards
    this.hazards.forEach((h) => this.scene.remove(h.group));
    this.hazards = [];

    // Spawn Runes (Hydration, Protein, Strength, Recovery)
    const runeTypes: Array<'hydration' | 'protein' | 'strength' | 'recovery'> = [
      'hydration',
      'protein',
      'strength',
      'recovery',
    ];

    for (let i = 0; i < this.waveHabitsTarget; i++) {
      const type = runeTypes[i % runeTypes.length];
      const runeGroup = createHabitRune(type);

      // Random position around the arena (within r=14)
      const angle = (i / this.waveHabitsTarget) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 5 + Math.random() * 8;
      runeGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

      this.scene.add(runeGroup);
      this.runes.push({ group: runeGroup, type, collected: false });
    }

    // Spawn Hazard Drones based on wave
    const hazardCount = waveNum === 1 ? 2 : waveNum === 2 ? 3 : 5;
    for (let i = 0; i < hazardCount; i++) {
      const droneGroup = createHazardDrone();
      const angle = (i / hazardCount) * Math.PI * 2 + Math.PI / 4;
      droneGroup.position.set(Math.cos(angle) * 12, 0, Math.sin(angle) * 12);
      this.scene.add(droneGroup);

      this.hazards.push({
        group: droneGroup,
        state: 'patrol',
        timer: Math.random() * 2,
        targetPos: new THREE.Vector3(),
        speed: 2.2 + waveNum * 0.5,
      });
    }

    soundFX.playVictory();
  }

  private updateGameplay(dt: number) {
    // 1. Process Input & Player Movement
    let moveX = 0;
    let moveZ = 0;

    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) moveZ -= 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) moveZ += 1;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) moveX -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) moveX += 1;

    const inputLen = Math.hypot(moveX, moveZ);
    if (inputLen > 0) {
      moveX /= inputLen;
      moveZ /= inputLen;
      this.heroFacingAngle = Math.atan2(moveX, moveZ);
    }

    // Dash / Slam Action
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }

    if (this.dashRequested && this.dashCooldown <= 0) {
      this.dashRequested = false;
      this.isDashing = true;
      this.dashTimeRemaining = 0.22;
      this.dashCooldown = 0.85;

      const dashDirX = inputLen > 0 ? moveX : Math.sin(this.heroFacingAngle);
      const dashDirZ = inputLen > 0 ? moveZ : Math.cos(this.heroFacingAngle);
      this.heroVelocity.set(dashDirX * 22, 0, dashDirZ * 22);

      soundFX.playDash();

      // Squash and stretch
      this.hero.scale.set(0.8, 1.25, 0.8);
      this.spawnParticleBurst(this.hero.position, 0x38bdf8, 8);
    }

    if (this.isDashing) {
      this.dashTimeRemaining -= dt;
      if (this.dashTimeRemaining <= 0) {
        this.isDashing = false;
        soundFX.playSlam();
        this.cameraShake = Math.max(this.cameraShake, 0.4);
        this.spawnParticleBurst(this.hero.position, 0xf59e0b, 12);
      }
    } else {
      // Normal running velocity interpolation
      const targetSpeed = 8.5;
      this.heroVelocity.x = THREE.MathUtils.damp(this.heroVelocity.x, moveX * targetSpeed, 12, dt);
      this.heroVelocity.z = THREE.MathUtils.damp(this.heroVelocity.z, moveZ * targetSpeed, 12, dt);
    }

    // Apply movement
    this.hero.position.x += this.heroVelocity.x * dt;
    this.hero.position.z += this.heroVelocity.z * dt;

    // Arena boundary clamp (-16 to +16)
    const arenaBound = 15.5;
    this.hero.position.x = THREE.MathUtils.clamp(this.hero.position.x, -arenaBound, arenaBound);
    this.hero.position.z = THREE.MathUtils.clamp(this.hero.position.z, -arenaBound, arenaBound);

    // Smooth hero rotation
    if (inputLen > 0 || this.isDashing) {
      this.hero.rotation.y = THREE.MathUtils.damp(
        this.hero.rotation.y,
        this.heroFacingAngle,
        15,
        dt
      );
    }

    // Return squash & stretch to normal
    this.hero.scale.x = THREE.MathUtils.damp(this.hero.scale.x, 1, 8, dt);
    this.hero.scale.y = THREE.MathUtils.damp(this.hero.scale.y, 1, 8, dt);
    this.hero.scale.z = THREE.MathUtils.damp(this.hero.scale.z, 1, 8, dt);

    // Invulnerability timer
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.hero.visible = Math.floor(performance.now() / 80) % 2 === 0;
    } else {
      this.hero.visible = true;
    }

    // 2. Animate Habit Runes & Check Collection
    let remainingRunes = 0;
    this.runes.forEach((rune) => {
      if (rune.collected) return;
      remainingRunes++;

      // Floating & orbital gyro ring spin
      const gyroRing = rune.group.getObjectByName('gyroRing');
      if (gyroRing) {
        gyroRing.rotation.x += 1.8 * dt;
        gyroRing.rotation.y += 2.2 * dt;
      }
      rune.group.position.y = Math.sin(performance.now() * 0.003 + rune.group.position.x) * 0.15;

      // Check collision with player
      const dist = this.hero.position.distanceTo(rune.group.position);
      if (dist < 1.4) {
        rune.collected = true;
        rune.group.visible = false;
        this.habitsCollected++;
        this.score += 150 * this.combo;
        this.combo = Math.min(this.combo + 1, 8);

        soundFX.playCollect(rune.type);
        this.spawnParticleBurst(rune.group.position, 0x10b981, 14);

        // Small health regen for hydration/recovery
        if (rune.type === 'hydration' || rune.type === 'recovery') {
          this.heroHealth = Math.min(this.heroHealth + 10, this.maxHealth);
        }
      }
    });

    // Check wave complete
    if (remainingRunes === 0) {
      if (this.currentWave >= this.totalWaves) {
        // Victory!
        this.state = 'victory';
        soundFX.playVictory();
        this.onStateChange?.(this.state);
      } else {
        // Next wave
        this.spawnWave(this.currentWave + 1);
      }
    }

    // 3. Update Hazard Drones with Visible Windup Telegraph
    this.hazards.forEach((hazard) => {
      hazard.timer -= dt;
      const dronePos = hazard.group.position;
      const telegraphRing = hazard.group.getObjectByName('telegraphRing') as THREE.Mesh;
      const eye = hazard.group.getObjectByName('targetingEye') as THREE.Mesh;

      if (hazard.state === 'patrol') {
        // Hover toward player slowly
        const dir = new THREE.Vector3().subVectors(this.hero.position, dronePos).normalize();
        dronePos.x += dir.x * hazard.speed * dt;
        dronePos.z += dir.z * hazard.speed * dt;
        hazard.group.lookAt(this.hero.position.x, 1.2, this.hero.position.z);

        if (telegraphRing) {
          (telegraphRing.material as THREE.MeshBasicMaterial).opacity = 0;
        }

        // Distance check to initiate telegraph attack
        if (dronePos.distanceTo(this.hero.position) < 6.5 && hazard.timer <= 0) {
          hazard.state = 'telegraph';
          hazard.timer = 0.75; // 750ms visible windup!
          hazard.targetPos.copy(this.hero.position);
          soundFX.playTelegraph();
        }
      } else if (hazard.state === 'telegraph') {
        // Visible telegraph ring expands and eye flares red
        if (telegraphRing) {
          const progress = 1 - Math.max(hazard.timer / 0.75, 0);
          telegraphRing.scale.set(1 + progress * 0.5, 1 + progress * 0.5, 1);
          (telegraphRing.material as THREE.MeshBasicMaterial).opacity = 0.8;
        }
        if (eye) {
          (eye.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.5;
        }

        if (hazard.timer <= 0) {
          hazard.state = 'lunge';
          hazard.timer = 0.35;
          soundFX.playDash();
        }
      } else if (hazard.state === 'lunge') {
        // High speed dash toward targeted point
        const lungeDir = new THREE.Vector3().subVectors(hazard.targetPos, dronePos).normalize();
        dronePos.x += lungeDir.x * (hazard.speed * 3.8) * dt;
        dronePos.z += lungeDir.z * (hazard.speed * 3.8) * dt;

        if (telegraphRing) {
          (telegraphRing.material as THREE.MeshBasicMaterial).opacity = 0.2;
        }

        if (hazard.timer <= 0) {
          hazard.state = 'patrol';
          hazard.timer = 1.2; // Cooldown before next telegraph
          if (eye) {
            (eye.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
          }
        }
      }

      // Check collision with player
      if (this.invulnerableTimer <= 0 && dronePos.distanceTo(this.hero.position) < 1.1) {
        if (this.isDashing) {
          // Player slammed the hazard! Hazard is repelled!
          hazard.group.position.addScaledVector(this.heroVelocity, 0.15);
          this.score += 200 * this.combo;
          this.hitstopTimer = 0.06; // 60ms heavy impact hitstop
          this.cameraShake = 0.5;
          soundFX.playSlam();
          this.spawnParticleBurst(dronePos, 0xef4444, 16);
        } else {
          // Player takes damage
          this.heroHealth -= 20;
          this.combo = 1;
          this.invulnerableTimer = 1.2;
          this.cameraShake = 0.6;
          this.hitstopTimer = 0.05; // 50ms hitstop
          soundFX.playHit();
          this.spawnParticleBurst(this.hero.position, 0xef4444, 12);

          if (this.heroHealth <= 0) {
            this.heroHealth = 0;
            this.state = 'gameover';
            this.onStateChange?.(this.state);
          }
        }
      }
    });

    // 4. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 9.8 * dt; // Gravity
      const scale = Math.max(p.life / p.maxLife, 0);
      p.mesh.scale.set(scale, scale, scale);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }

    // 5. Camera Damping & Trauma Shake
    const targetCamX = this.hero.position.x;
    const targetCamZ = this.hero.position.z + 12;
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 6, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 6, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, 9.5, 6, dt);

    this.cameraBaseTarget.set(this.hero.position.x, 1.2, this.hero.position.z);

    if (this.cameraShake > 0) {
      const shakeAmt = this.cameraShake * 0.4;
      this.camera.position.x += (Math.random() - 0.5) * shakeAmt;
      this.camera.position.y += (Math.random() - 0.5) * shakeAmt;
      this.cameraShake = Math.max(this.cameraShake - dt * 2.5, 0);
    }

    this.camera.lookAt(this.cameraBaseTarget);

    // 6. Broadcast Stats to HUD
    this.onStatsUpdate?.({
      score: this.score,
      habitsCollected: this.habitsCollected,
      comboStreak: this.combo,
      health: this.heroHealth,
      maxHealth: this.maxHealth,
      currentWave: this.currentWave,
      totalWaves: this.totalWaves,
      gspaMultiplier: this.combo * 1.5,
      dashCooldownRemaining: Math.max(this.dashCooldown, 0),
    });
  }

  private spawnParticleBurst(position: THREE.Vector3, colorHex: number, count: number) {
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.particleGeom, mat);
      mesh.position.copy(position);
      mesh.position.y += 0.8;

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 8
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
      });
    }
  }

  public dispose() {
    this.stopLoop();
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.runes.forEach((r) => this.scene.remove(r.group));
    this.hazards.forEach((h) => this.scene.remove(h.group));
    this.scene.remove(this.hero);
  }
}
