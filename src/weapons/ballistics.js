/**
 * Ballistics Engine, Projectiles, Muzzle Flashes & Tracers
 */
import * as THREE from 'three';

export class BallisticsEngine {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
    this.tracerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe680,
    });
    this.sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
    });

    this.sparks = [];
  }

  spawnBullet(origin, direction, weaponDef, shooter = null) {
    const geo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4);
    geo.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, this.tracerMaterial);
    mesh.position.copy(origin);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      velocity: direction.clone().multiplyScalar(weaponDef.bulletVelocity * 0.25), // scaled for game map
      damage: weaponDef.damage,
      shooter,
      life: 2.0,
      gravity: -9.8,
    });
  }

  spawnImpactSpark(position, normal) {
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const mesh = new THREE.Mesh(geo, this.sparkMaterial);
      mesh.position.copy(position);
      this.scene.add(mesh);

      const vel = normal.clone().multiplyScalar(4).add(new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3,
        (Math.random() - 0.5) * 4
      ));

      this.sparks.push({ mesh, velocity: vel, life: 0.35 });
    }
  }

  update(delta, targets = [], onHitCallback = null) {
    // Update bullets
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= delta;

      // Apply bullet drop
      p.velocity.y += p.gravity * delta * 0.5;
      const prevPos = p.mesh.position.clone();
      p.mesh.position.addScaledVector(p.velocity, delta);

      // Check hit against targets (bots or player)
      let hit = false;
      for (const target of targets) {
        if (target.isDead || target === p.shooter) continue;
        const dist = p.mesh.position.distanceTo(target.position);
        if (dist < 1.1) {
          hit = true;
          if (onHitCallback) {
            onHitCallback(p, target);
          }
          break;
        }
      }

      // Check ground collision
      if (p.mesh.position.y <= 0) {
        hit = true;
        this.spawnImpactSpark(p.mesh.position, new THREE.Vector3(0, 1, 0));
      }

      if (hit || p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.projectiles.splice(i, 1);
      }
    }

    // Update sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.life -= delta;
      sp.mesh.position.addScaledVector(sp.velocity, delta);
      sp.velocity.y -= 15 * delta;

      if (sp.life <= 0) {
        this.scene.remove(sp.mesh);
        sp.mesh.geometry.dispose();
        this.sparks.splice(i, 1);
      }
    }
  }
}
