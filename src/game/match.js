/**
 * Match Lifecycle & Game Session Manager
 */
import * as THREE from 'three';
import { GameRenderer } from '../world/renderer.js';
import { SkyManager } from '../world/sky.js';
import { TerrainManager } from '../world/terrain.js';
import { BuildingGenerator } from '../world/buildings.js';
import { CollisionSystem } from '../physics/collision.js';
import { BallisticsEngine } from '../weapons/ballistics.js';
import { OpticsController } from '../weapons/optics.js';
import { WEAPON_REGISTRY } from '../weapons/arsenal.js';
import { soundManager } from '../audio/synth.js';
import { InGameHUD } from '../ui/hud.js';
import { TouchManager } from '../input/touch.js';
import { VirtualJoystick } from '../input/joystick.js';
import { InventoryManager } from '../loot/inventory.js';
import { LootSpawner } from '../loot/spawner.js';
import { PlayzoneManager } from './playzone.js';
import { BotAI } from '../ai/bot.js';
import { stateManager, GameStates } from '../state.js';

export class MatchSession {
  constructor(canvas, uiContainer, config = {}) {
    this.canvas = canvas;
    this.uiContainer = uiContainer;
    this.config = config;

    this.isRunning = true;
    this.isPaused = false;
    this.kills = 0;
    this.aliveSurvivors = 1 + (config.team1Bots || 0) + (config.team2Bots || 0);

    this.player = {
      position: new THREE.Vector3(0, 0, -2),
      yaw: 0,
      pitch: 0,
      health: 100,
      isDead: false,
      isCrouching: false,
      isProning: false,
      isGrounded: true,
      verticalVelocity: 0,
    };

    this.moveVector = { x: 0, y: 0, sprint: false };
    this.lastTime = performance.now();

    this.initSystems();
  }

  initSystems() {
    // 3D Scene & Renderer
    this.renderer = new GameRenderer(this.canvas);
    this.sky = new SkyManager(this.renderer.scene, this.config.weather || 'CLEAR');
    this.terrain = new TerrainManager(this.renderer.scene);
    this.buildings = new BuildingGenerator(this.renderer.scene);

    // Physics & Ballistics
    this.collision = new CollisionSystem([...this.terrain.colliders, ...this.buildings.colliders]);
    this.ballistics = new BallisticsEngine(this.renderer.scene);

    // Tactical HUD & Controls
    this.hud = new InGameHUD(this.uiContainer, {
      onFire: this.handlePlayerFire.bind(this),
      onToggleScope: this.handleToggleScope.bind(this),
      onJump: this.handleJump.bind(this),
      onCrouch: this.handleCrouch.bind(this),
      onProne: this.handleProne.bind(this),
      onReload: this.handleReload.bind(this),
      onHeal: this.handleHeal.bind(this),
      onSwapWeapon: this.handleSwapWeapon.bind(this),
      onPause: this.togglePause.bind(this),
    });

    this.optics = new OpticsController(this.renderer.camera, this.hud);
    this.inventory = new InventoryManager(this.hud);
    this.loot = new LootSpawner(this.renderer.scene);
    this.playzone = new PlayzoneManager(this.renderer.scene);

    // Populate initial loot in buildings
    this.buildings.spawnPoints.forEach((pos, idx) => {
      const type = idx % 3 === 0 ? 'EPIC' : idx % 2 === 0 ? 'RARE' : 'COMMON';
      this.loot.spawnLootAt(pos, type, idx % 2 === 0 ? 'M416' : 'AKM');
    });

    // Spawn tactical airdrop in compound
    this.loot.spawnAirdrop(new THREE.Vector3(12, 0, 10));

    // Spawn Bots
    this.bots = [];
    const team1Count = this.config.team1Bots || 0;
    const team2Count = this.config.team2Bots || 0;

    for (let i = 0; i < team1Count; i++) {
      const pos = new THREE.Vector3(-4 - i * 2, 0, -4);
      const bot = new BotAI(this.renderer.scene, `Ally_${i + 1}`, 1, pos);
      this.bots.push(bot);
    }

    for (let i = 0; i < team2Count; i++) {
      const angle = (i / Math.max(1, team2Count)) * Math.PI * 2;
      const dist = 30 + Math.random() * 20;
      const pos = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      const bot = new BotAI(this.renderer.scene, `Enemy_${i + 1}`, 2, pos);
      this.bots.push(bot);
    }

    this.hud.updateSurvivors(this.aliveSurvivors);

    // Multi-touch & Aim Controls
    this.touch = new TouchManager(this.canvas);
    this.touch.onAimMove = (dx, dy) => {
      if (this.isPaused || this.player.isDead) return;
      const sens = (this.optics.isScoped ? stateManager.settings.adsSensitivity : stateManager.settings.lookSensitivity) * 0.003;
      this.player.yaw -= dx * sens;
      this.player.pitch = Math.max(-1.4, Math.min(1.4, this.player.pitch - dy * sens));
    };

    // Virtual Joystick
    this.joystick = new VirtualJoystick(this.uiContainer, (v) => {
      this.moveVector = v;
    });

    // Start main game loop
    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
  }

  handlePlayerFire(isPressing) {
    if (!isPressing || this.player.isDead || this.isPaused) return;
    const activeWpn = this.inventory.getActiveWeapon();
    const wpnDef = WEAPON_REGISTRY[activeWpn.id] || WEAPON_REGISTRY.M416;

    if (activeWpn.currentMag <= 0) {
      this.handleReload();
      return;
    }

    activeWpn.currentMag--;
    const magEl = document.getElementById(`w${this.inventory.activeSlot + 1}-mag`);
    if (magEl) magEl.textContent = activeWpn.currentMag;

    // Procedural gunshot sound
    soundManager.playGunshot(activeWpn.id);

    // Compute forward shooting ray
    const forward = new THREE.Vector3(
      -Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
      Math.sin(this.player.pitch),
      -Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
    ).normalize();

    const origin = this.renderer.camera.position.clone().add(forward.clone().multiplyScalar(0.5));
    this.ballistics.spawnBullet(origin, forward, wpnDef, this.player);

    // Camera Recoil Kick
    this.player.pitch += wpnDef.recoilKickVertical;
    this.player.yaw += (Math.random() - 0.5) * wpnDef.recoilKickHorizontal;
  }

  handleToggleScope() {
    if (this.player.isDead || this.isPaused) return;
    const activeWpn = this.inventory.getActiveWeapon();
    const wpnDef = WEAPON_REGISTRY[activeWpn.id];
    this.optics.toggleScope(wpnDef);
  }

  handleJump() {
    if (this.player.isGrounded && !this.player.isDead) {
      this.player.verticalVelocity = 6.2;
      this.player.isGrounded = false;
      soundManager.playFootstep();
    }
  }

  handleCrouch() {
    this.player.isCrouching = !this.player.isCrouching;
    if (this.player.isCrouching) this.player.isProning = false;
  }

  handleProne() {
    this.player.isProning = !this.player.isProning;
    if (this.player.isProning) this.player.isCrouching = false;
  }

  handleReload() {
    const activeWpn = this.inventory.getActiveWeapon();
    const wpnDef = WEAPON_REGISTRY[activeWpn.id];
    if (activeWpn.reserveAmmo <= 0 || activeWpn.currentMag === wpnDef.magCapacity) return;

    soundManager.playReload();
    setTimeout(() => {
      const needed = wpnDef.magCapacity - activeWpn.currentMag;
      const take = Math.min(needed, activeWpn.reserveAmmo);
      activeWpn.currentMag += take;
      activeWpn.reserveAmmo -= take;

      const magEl = document.getElementById(`w${this.inventory.activeSlot + 1}-mag`);
      const resEl = document.getElementById(`w${this.inventory.activeSlot + 1}-reserve`);
      if (magEl) magEl.textContent = activeWpn.currentMag;
      if (resEl) resEl.textContent = activeWpn.reserveAmmo;
    }, wpnDef.reloadDuration * 1000);
  }

  handleHeal() {
    const used = this.inventory.useFirstAid(this.player);
    if (used) {
      this.hud.setHealth(this.player.health);
    }
  }

  handleSwapWeapon(slotIndex) {
    this.inventory.setActiveSlot(slotIndex);
    this.optics.reset();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  tick(time) {
    if (!this.isRunning) return;
    const delta = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    if (!this.isPaused) {
      this.updatePlayer(delta);
      this.updateBots(delta);
      this.updateBallistics(delta);
      this.loot.update(delta, this.player.position, (loot) => {
        this.inventory.addLoot({ name: loot.itemName, count: 30 });
      });
      this.playzone.update(delta, this.player.position, (dmg) => {
        this.player.health = Math.max(0, this.player.health - dmg);
        this.hud.setHealth(this.player.health);
        this.hud.triggerDamageFlash();
      });
      this.optics.update(delta);
      this.updateHUD();
    }

    this.renderer.render();
    requestAnimationFrame(this.tick);
  }

  updatePlayer(delta) {
    if (this.player.isDead) return;

    // Movement calculation
    let speed = this.moveVector.sprint ? 8.2 : 4.8;
    if (this.player.isCrouching) speed = 2.8;
    if (this.player.isProning) speed = 1.2;

    const forward = new THREE.Vector3(-Math.sin(this.player.yaw), 0, -Math.cos(this.player.yaw));
    const right = new THREE.Vector3(Math.cos(this.player.yaw), 0, -Math.sin(this.player.yaw));

    const moveDir = new THREE.Vector3()
      .addScaledVector(forward, -this.moveVector.y)
      .addScaledVector(right, this.moveVector.x);

    if (moveDir.lengthSq() > 0.001) {
      moveDir.normalize();
      const targetPos = this.player.position.clone().addScaledVector(moveDir, speed * delta);
      const resolved = this.collision.resolveMovement(this.player.position, targetPos, 0.5);
      this.player.position.x = resolved.x;
      this.player.position.z = resolved.z;
    }

    // Vertical Gravity & Stair Climbing
    this.player.verticalVelocity -= 18.0 * delta;
    this.player.position.y += this.player.verticalVelocity * delta;

    const groundY = this.collision.resolveFloorHeight(this.player.position, this.player.position.y);
    if (this.player.position.y <= groundY) {
      this.player.position.y = groundY;
      this.player.verticalVelocity = 0;
      this.player.isGrounded = true;
    }

    // Camera height adjustment based on posture
    let eyeHeight = 1.7;
    if (this.player.isCrouching) eyeHeight = 1.1;
    if (this.player.isProning) eyeHeight = 0.35;

    // Camera follow
    this.renderer.camera.position.set(
      this.player.position.x,
      this.player.position.y + eyeHeight,
      this.player.position.z
    );

    const lookTarget = this.renderer.camera.position.clone().add(
      new THREE.Vector3(
        -Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
        Math.sin(this.player.pitch),
        -Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
      )
    );
    this.renderer.camera.lookAt(lookTarget);
  }

  updateBots(delta) {
    for (const bot of this.bots) {
      bot.update(delta, this.player, this.ballistics, this.collision);
    }
  }

  updateBallistics(delta) {
    const targets = [this.player, ...this.bots];
    this.ballistics.update(delta, targets, (bullet, hitTarget) => {
      soundManager.playHitmarker();
      if (hitTarget === this.player) {
        this.player.health = Math.max(0, this.player.health - bullet.damage);
        this.hud.setHealth(this.player.health);
        this.hud.triggerDamageFlash();
      } else {
        hitTarget.takeDamage(bullet.damage, this.ballistics, (killedBot) => {
          this.kills++;
          this.aliveSurvivors = Math.max(1, this.aliveSurvivors - 1);
          this.hud.updateKills(this.kills);
          this.hud.updateSurvivors(this.aliveSurvivors);
          this.hud.addKillfeed('PLAYER_01', killedBot.name, 'M416', true);
        });
      }
    });
  }

  updateHUD() {
    // Bearing degrees for compass
    let deg = Math.round((-this.player.yaw * 180) / Math.PI) % 360;
    if (deg < 0) deg += 360;
    this.hud.compass.update(deg);

    // Radar Minimap
    this.hud.minimap.update({
      playerPos: this.player.position,
      playerYaw: this.player.yaw,
      bots: this.bots,
      safeZone: this.playzone.getSafeZoneData(),
    });
  }

  destroy() {
    this.isRunning = false;
    if (this.touch) this.touch.destroy();
    if (this.joystick) this.joystick.destroy();
    if (this.hud) this.hud.destroy();
    if (this.renderer) this.renderer.destroy();
  }
}
