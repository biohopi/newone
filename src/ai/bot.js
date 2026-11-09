/**
 * Advanced Tactical Bot AI
 */
import * as THREE from 'three';
import { soundManager } from '../audio/synth.js';

export class BotAI {
  constructor(scene, name, team = 2, startPos = new THREE.Vector3()) {
    this.scene = scene;
    this.name = name;
    this.team = team; // 1 = Friendly / Ally, 2 = Hostile
    this.position = startPos.clone();
    this.health = 100;
    this.isDead = false;

    this.state = 'PATROL'; // PATROL, ENGAGE, COVER, HEAL
    this.target = null;
    this.shootTimer = 0;
    this.patrolTimer = 0;
    this.patrolDir = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();

    this.buildBotModel();
  }

  buildBotModel() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    const isHostile = this.team === 2;
    const uniformColor = isHostile ? 0x3d352e : 0x2e3d38;
    const vestColor = isHostile ? 0x221e1a : 0x1d2623;

    // Tactical Soldier Body (Torso)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: uniformColor,
      roughness: 0.8,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    this.group.add(torso);

    // Tactical Level 3 Helmet
    const headGeo = new THREE.SphereGeometry(0.24, 16, 12);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.7,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.7;
    head.castShadow = true;
    this.group.add(head);

    // Dark Visor Slit
    const visorGeo = new THREE.BoxGeometry(0.2, 0.08, 0.1);
    const visorMat = new THREE.MeshBasicMaterial({ color: isHostile ? 0xff3344 : 0x00e5ff });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.7, 0.2);
    this.group.add(visor);

    // Weapon in hand
    const gunGeo = new THREE.BoxGeometry(0.12, 0.18, 0.8);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.position.set(0.35, 1.1, 0.4);
    this.group.add(gun);

    this.scene.add(this.group);
  }

  takeDamage(amount, ballistics, onKilled) {
    if (this.isDead) return;
    this.health -= amount;

    // Blood / hit spark effect
    ballistics.spawnImpactSpark(this.position.clone().add(new THREE.Vector3(0, 1.2, 0)), new THREE.Vector3(0, 1, 0));

    if (this.health <= 0) {
      this.isDead = true;
      this.group.rotation.x = Math.PI / 2; // Knock down / ragdoll fall
      this.group.position.y = 0.2;
      if (onKilled) {
        onKilled(this);
      }
    }
  }

  update(delta, player, ballistics, collisionSystem) {
    if (this.isDead) return;

    this.group.position.copy(this.position);

    // Check distance to player
    const distToPlayer = this.position.distanceTo(player.position);

    // Team 2 engages player if within 50m
    if (this.team === 2 && distToPlayer < 50 && !player.isDead) {
      this.state = 'ENGAGE';
      this.target = player;
    } else if (this.team === 1) {
      // Friendly bot follows player
      this.state = 'FOLLOW';
      this.target = player;
    } else {
      this.state = 'PATROL';
    }

    if (this.state === 'ENGAGE') {
      // Turn towards player
      const dir = new THREE.Vector3().subVectors(player.position, this.position);
      dir.y = 0;
      dir.normalize();

      this.group.rotation.y = Math.atan2(dir.x, dir.z);

      // Strafe and burst fire
      this.shootTimer += delta;
      if (this.shootTimer > 0.6) {
        this.shootTimer = 0;

        // Apply recoil inaccuracy
        const aimSpread = new THREE.Vector3(
          dir.x + (Math.random() - 0.5) * 0.1,
          0.02,
          dir.z + (Math.random() - 0.5) * 0.1
        ).normalize();

        const muzzlePos = this.position.clone().add(new THREE.Vector3(0.3, 1.1, 0.4));
        ballistics.spawnBullet(muzzlePos, aimSpread, { bulletVelocity: 600, damage: 14 }, this);
        soundManager.playGunshot('AKM');
      }

      // Approach player if too far, or take cover
      if (distToPlayer > 18) {
        const moveStep = dir.clone().multiplyScalar(delta * 2.8);
        const nextPos = this.position.clone().add(moveStep);
        const resolved = collisionSystem.resolveMovement(this.position, nextPos, 0.6);
        this.position.x = resolved.x;
        this.position.z = resolved.z;
      }
    } else if (this.state === 'FOLLOW') {
      // Follow player at comfortable distance
      if (distToPlayer > 8) {
        const dir = new THREE.Vector3().subVectors(player.position, this.position).normalize();
        this.group.rotation.y = Math.atan2(dir.x, dir.z);
        const moveStep = dir.multiplyScalar(delta * 3.5);
        this.position.add(moveStep);
      }
    } else {
      // PATROL
      this.patrolTimer += delta;
      if (this.patrolTimer > 4.0) {
        this.patrolTimer = 0;
        this.patrolDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
      }
      this.group.rotation.y = Math.atan2(this.patrolDir.x, this.patrolDir.z);
      const moveStep = this.patrolDir.clone().multiplyScalar(delta * 1.5);
      const nextPos = this.position.clone().add(moveStep);
      const resolved = collisionSystem.resolveMovement(this.position, nextPos, 0.6);
      this.position.x = resolved.x;
      this.position.z = resolved.z;
    }
  }
}
