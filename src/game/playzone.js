/**
 * Shrinking Playzone (Blue Zone & White Safe Zone)
 */
import * as THREE from 'three';

export class PlayzoneManager {
  constructor(scene) {
    this.scene = scene;

    this.currentRadius = 120;
    this.targetRadius = 40;
    this.shrinkSpeed = 1.2; // meters/sec
    this.center = new THREE.Vector3(0, 0, 0);

    this.createPlayzoneVisuals();
  }

  createPlayzoneVisuals() {
    // Translucent electric blue forcefield cylinder
    const geo = new THREE.CylinderGeometry(this.currentRadius, this.currentRadius, 30, 48, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    this.zoneMesh = new THREE.Mesh(geo, mat);
    this.zoneMesh.position.y = 15;
    this.scene.add(this.zoneMesh);
  }

  update(delta, playerPos, onZoneDamage) {
    if (this.currentRadius > this.targetRadius) {
      this.currentRadius -= this.shrinkSpeed * delta;
      this.zoneMesh.scale.set(this.currentRadius / 120, 1, this.currentRadius / 120);
    }

    // Check if player is outside blue zone
    const dist = Math.hypot(playerPos.x - this.center.x, playerPos.z - this.center.z);
    if (dist > this.currentRadius) {
      const damage = 6 * delta; // 6 DPS
      if (onZoneDamage) {
        onZoneDamage(damage);
      }
    }
  }

  getSafeZoneData() {
    return {
      x: this.center.x,
      z: this.center.z,
      r: this.targetRadius,
    };
  }
}
