/**
 * Ground Loot Spawner & Airdrop Crate System
 */
import * as THREE from 'three';

export const LOOT_TYPES = {
  COMMON: { color: 0x9e9e9e, name: 'Common Loot' },
  RARE: { color: 0x2196f3, name: 'Rare Weapon' },
  EPIC: { color: 0x9c27b0, name: 'Epic Gear' },
  LEGENDARY: { color: 0xffd700, name: 'Legendary Airdrop' },
};

export class LootSpawner {
  constructor(scene) {
    this.scene = scene;
    this.groundLoot = [];
    this.airdropCrate = null;
    this.airdropSmoke = null;

    this.lootGroup = new THREE.Group();
    this.scene.add(this.lootGroup);
  }

  spawnLootAt(position, type = 'RARE', itemName = 'M416') {
    const config = LOOT_TYPES[type] || LOOT_TYPES.RARE;

    // Glowing loot pedestal box
    const boxGeo = new THREE.BoxGeometry(0.8, 0.25, 0.4);
    const boxMat = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.3,
      metalness: 0.8,
      emissive: config.color,
      emissiveIntensity: 0.4,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.copy(position);
    this.lootGroup.add(box);

    // Vertical light beam indicator
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 4, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.5,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.copy(position);
    beam.position.y += 2;
    this.lootGroup.add(beam);

    this.groundLoot.push({
      box,
      beam,
      position: position.clone(),
      itemName,
      type,
    });
  }

  spawnAirdrop(position) {
    // Red Tactical Airdrop Supply Crate with Blue Tarp Top
    const crateGroup = new THREE.Group();
    crateGroup.position.copy(position);

    // Crate Body
    const crateGeo = new THREE.BoxGeometry(2.0, 1.8, 2.0);
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0xcc2229,
      roughness: 0.6,
      metalness: 0.3,
    });
    const crateMesh = new THREE.Mesh(crateGeo, crateMat);
    crateMesh.position.y = 0.9;
    crateMesh.castShadow = true;
    crateMesh.receiveShadow = true;
    crateGroup.add(crateMesh);

    // Blue Tarp on Top
    const tarpGeo = new THREE.BoxGeometry(2.1, 0.3, 2.1);
    const tarpMat = new THREE.MeshStandardMaterial({
      color: 0x1976d2,
      roughness: 0.9,
    });
    const tarpMesh = new THREE.Mesh(tarpGeo, tarpMat);
    tarpMesh.position.y = 1.9;
    crateGroup.add(tarpMesh);

    // Red Flare Smoke Plume
    const smokeGeo = new THREE.CylinderGeometry(0.3, 1.2, 12, 8);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.6,
    });
    const smoke = new THREE.Mesh(smokeGeo, smokeMat);
    smoke.position.set(0, 7, 0);
    crateGroup.add(smoke);

    this.scene.add(crateGroup);
    this.airdropCrate = crateGroup;
  }

  update(delta, playerPos, onPickup) {
    // Gentle bobbing / rotation of loot beams
    for (let i = this.groundLoot.length - 1; i >= 0; i--) {
      const loot = this.groundLoot[i];
      loot.box.rotation.y += delta * 1.5;

      // Check pickup radius
      const dist = playerPos.distanceTo(loot.position);
      if (dist < 1.8) {
        if (onPickup) {
          onPickup(loot);
        }
        // Remove from world
        this.lootGroup.remove(loot.box);
        this.lootGroup.remove(loot.beam);
        this.groundLoot.splice(i, 1);
      }
    }
  }
}
