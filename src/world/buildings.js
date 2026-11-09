/**
 * Procedural Multi-Stage Buildings (1, 2, and 3-stage architecture)
 */
import * as THREE from 'three';

export class BuildingGenerator {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.spawnPoints = [];

    this.createMaterials();
    this.buildWorldStructures();
  }

  createMaterials() {
    this.concreteMat = new THREE.MeshStandardMaterial({
      color: 0x9ba2ab,
      roughness: 0.8,
      metalness: 0.1,
    });

    this.brickMat = new THREE.MeshStandardMaterial({
      color: 0x8a5344,
      roughness: 0.9,
    });

    this.woodMat = new THREE.MeshStandardMaterial({
      color: 0x5a3d28,
      roughness: 0.7,
    });

    this.metalMat = new THREE.MeshStandardMaterial({
      color: 0x47515b,
      roughness: 0.4,
      metalness: 0.8,
    });

    this.stairMat = new THREE.MeshStandardMaterial({
      color: 0x6e7882,
      roughness: 0.6,
    });
  }

  buildWorldStructures() {
    // 1-Stage Military Guardhouse Bunker
    this.buildStage1Guardhouse(-24, 0, -22);

    // 2-Stage Residential Combat House
    this.buildStage2House(20, 0, -18);

    // 3-Stage Sniper Tower / Apartment Complex
    this.buildStage3Apartment(-18, 0, 32);
  }

  /**
   * 1-Stage Military Guardhouse Bunker (Ground floor with slit windows, blast doors)
   */
  buildStage1Guardhouse(baseX, baseY, baseZ) {
    const group = new THREE.Group();
    group.position.set(baseX, baseY, baseZ);

    const width = 8;
    const depth = 8;
    const height = 3.6;

    // Floor
    const floorGeo = new THREE.BoxGeometry(width, 0.4, depth);
    const floor = new THREE.Mesh(floorGeo, this.concreteMat);
    floor.position.set(0, 0.2, 0);
    floor.receiveShadow = true;
    group.add(floor);

    // Roof Slab
    const roofGeo = new THREE.BoxGeometry(width + 0.8, 0.4, depth + 0.8);
    const roof = new THREE.Mesh(roofGeo, this.concreteMat);
    roof.position.set(0, height + 0.2, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    // Back Wall (Solid)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.4), this.concreteMat);
    backWall.position.set(0, height / 2 + 0.2, -depth / 2);
    backWall.castShadow = true;
    group.add(backWall);

    // Left Wall with Gun Slit Window
    const leftWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, depth), this.concreteMat);
    leftWall1.position.set(-width / 2, 0.8, 0);
    group.add(leftWall1);

    const leftWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, depth), this.concreteMat);
    leftWall2.position.set(-width / 2, height - 0.4, 0);
    group.add(leftWall2);

    // Right Wall (Solid)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, height, depth), this.concreteMat);
    rightWall.position.set(width / 2, height / 2 + 0.2, 0);
    rightWall.castShadow = true;
    group.add(rightWall);

    // Front Wall with Doorway
    const frontL = new THREE.Mesh(new THREE.BoxGeometry(2.5, height, 0.4), this.concreteMat);
    frontL.position.set(-2.75, height / 2 + 0.2, depth / 2);
    group.add(frontL);

    const frontR = new THREE.Mesh(new THREE.BoxGeometry(2.5, height, 0.4), this.concreteMat);
    frontR.position.set(2.75, height / 2 + 0.2, depth / 2);
    group.add(frontR);

    const frontTop = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 0.4), this.concreteMat);
    frontTop.position.set(0, height - 0.4, depth / 2);
    group.add(frontTop);

    this.scene.add(group);

    // Register colliders
    this.colliders.push(
      // Back wall collider
      { type: 'AABB', minX: baseX - width / 2, maxX: baseX + width / 2, minZ: baseZ - depth / 2 - 0.2, maxZ: baseZ - depth / 2 + 0.2, minY: 0, maxY: height },
      // Right wall collider
      { type: 'AABB', minX: baseX + width / 2 - 0.2, maxX: baseX + width / 2 + 0.2, minZ: baseZ - depth / 2, maxZ: baseZ + depth / 2, minY: 0, maxY: height },
      // Left wall collider
      { type: 'AABB', minX: baseX - width / 2 - 0.2, maxX: baseX - width / 2 + 0.2, minZ: baseZ - depth / 2, maxZ: baseZ + depth / 2, minY: 0, maxY: height },
      // Front left
      { type: 'AABB', minX: baseX - 4, maxX: baseX - 1.5, minZ: baseZ + depth / 2 - 0.2, maxZ: baseZ + depth / 2 + 0.2, minY: 0, maxY: height },
      // Front right
      { type: 'AABB', minX: baseX + 1.5, maxX: baseX + 4, minZ: baseZ + depth / 2 - 0.2, maxZ: baseZ + depth / 2 + 0.2, minY: 0, maxY: height }
    );

    // Interior loot spawn point
    this.spawnPoints.push(new THREE.Vector3(baseX, 0.5, baseZ));
  }

  /**
   * 2-Stage Residential House (Ground + 1st floor, functional stairs, balcony)
   */
  buildStage2House(baseX, baseY, baseZ) {
    const group = new THREE.Group();
    group.position.set(baseX, baseY, baseZ);

    const width = 12;
    const depth = 10;
    const floorHeight = 3.6;

    // Ground Floor Slab
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.4, depth), this.concreteMat);
    groundFloor.position.set(0, 0.2, 0);
    groundFloor.receiveShadow = true;
    group.add(groundFloor);

    // 1st Floor Slab (with stair opening cut)
    const midFloor1 = new THREE.Mesh(new THREE.BoxGeometry(width - 3, 0.3, depth), this.woodMat);
    midFloor1.position.set(-1.5, floorHeight + 0.15, 0);
    midFloor1.receiveShadow = true;
    group.add(midFloor1);

    // Balcony Slab
    const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 3), this.woodMat);
    balconyFloor.position.set(0, floorHeight + 0.15, depth / 2 + 1.5);
    balconyFloor.receiveShadow = true;
    group.add(balconyFloor);

    // Balcony Railing
    const railMat = this.metalMat;
    const railFront = new THREE.Mesh(new THREE.BoxGeometry(4, 1.0, 0.1), railMat);
    railFront.position.set(0, floorHeight + 0.65, depth / 2 + 3);
    group.add(railFront);

    // Roof Slab
    const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.4, depth + 0.6), this.brickMat);
    roof.position.set(0, floorHeight * 2 + 0.2, 0);
    roof.castShadow = true;
    group.add(roof);

    // Exterior Perimeter Walls
    const wallThick = 0.4;
    // Ground Back Wall
    const gBack = new THREE.Mesh(new THREE.BoxGeometry(width, floorHeight * 2, wallThick), this.brickMat);
    gBack.position.set(0, floorHeight, -depth / 2);
    gBack.castShadow = true;
    group.add(gBack);

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, floorHeight * 2, depth), this.brickMat);
    leftWall.position.set(-width / 2, floorHeight, 0);
    leftWall.castShadow = true;
    group.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, floorHeight * 2, depth), this.brickMat);
    rightWall.position.set(width / 2, floorHeight, 0);
    rightWall.castShadow = true;
    group.add(rightWall);

    // Functional Stairs to 2nd Floor
    const numSteps = 12;
    const stepDepth = (depth * 0.6) / numSteps;
    const stepHeight = floorHeight / numSteps;

    for (let i = 0; i < numSteps; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.4, stepHeight, stepDepth), this.stairMat);
      step.position.set(width / 2 - 1.5, (i + 0.5) * stepHeight, -depth / 4 + i * stepDepth);
      step.castShadow = true;
      step.receiveShadow = true;
      group.add(step);

      // Add stair ramp collider
      this.colliders.push({
        type: 'STAIR_STEP',
        x: baseX + width / 2 - 1.5,
        y: baseY + (i + 1) * stepHeight,
        z: baseZ - depth / 4 + i * stepDepth,
        width: 2.4,
        depth: stepDepth,
      });
    }

    this.scene.add(group);

    // Register main walls
    this.colliders.push(
      // Back
      { type: 'AABB', minX: baseX - width / 2, maxX: baseX + width / 2, minZ: baseZ - depth / 2 - 0.2, maxZ: baseZ - depth / 2 + 0.2, minY: 0, maxY: floorHeight * 2 },
      // Left
      { type: 'AABB', minX: baseX - width / 2 - 0.2, maxX: baseX - width / 2 + 0.2, minZ: baseZ - depth / 2, maxZ: baseZ + depth / 2, minY: 0, maxY: floorHeight * 2 },
      // Right
      { type: 'AABB', minX: baseX + width / 2 - 0.2, maxX: baseX + width / 2 + 0.2, minZ: baseZ - depth / 2, maxZ: baseZ + depth / 2, minY: 0, maxY: floorHeight * 2 },
      // 2nd Floor Platform
      { type: 'FLOOR_PLANE', minX: baseX - width / 2, maxX: baseX + 1.5, minZ: baseZ - depth / 2, maxZ: baseZ + depth / 2, y: floorHeight + 0.3 }
    );

    // Ground and 2nd Floor Loot Spawns
    this.spawnPoints.push(new THREE.Vector3(baseX - 2, 0.5, baseZ));
    this.spawnPoints.push(new THREE.Vector3(baseX - 2, floorHeight + 0.5, baseZ));
    this.spawnPoints.push(new THREE.Vector3(baseX, floorHeight + 0.5, baseZ + depth / 2 + 1));
  }

  /**
   * 3-Stage Tactical Sniper Apartment / Tower (3 full floors + open rooftop parapet)
   */
  buildStage3Apartment(baseX, baseY, baseZ) {
    const group = new THREE.Group();
    group.position.set(baseX, baseY, baseZ);

    const size = 12;
    const floorHeight = 3.6;
    const numFloors = 3;

    for (let f = 0; f < numFloors; f++) {
      const y = f * floorHeight;

      // Floor slab
      const slab = new THREE.Mesh(new THREE.BoxGeometry(size, 0.4, size), this.concreteMat);
      slab.position.set(0, y + 0.2, 0);
      slab.receiveShadow = true;
      group.add(slab);

      // Floor Plane Colliders
      if (f > 0) {
        this.colliders.push({
          type: 'FLOOR_PLANE',
          minX: baseX - size / 2,
          maxX: baseX + size / 2 - 2,
          minZ: baseZ - size / 2,
          maxZ: baseZ + size / 2,
          y: y + 0.4,
        });
      }

      // Stairs between floors
      const numSteps = 10;
      const stepH = floorHeight / numSteps;
      const stepD = (size * 0.45) / numSteps;
      for (let s = 0; s < numSteps; s++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(2.0, stepH, stepD), this.stairMat);
        const stZ = f % 2 === 0 ? -size / 4 + s * stepD : size / 4 - s * stepD;
        step.position.set(size / 2 - 1.2, y + (s + 0.5) * stepH, stZ);
        step.castShadow = true;
        group.add(step);

        this.colliders.push({
          type: 'STAIR_STEP',
          x: baseX + size / 2 - 1.2,
          y: baseY + y + (s + 1) * stepH,
          z: baseZ + stZ,
          width: 2.0,
          depth: stepD,
        });
      }

      // Loot spawn per floor
      this.spawnPoints.push(new THREE.Vector3(baseX - 2, y + 0.5, baseZ - 2));
    }

    // Rooftop Parapet
    const roofY = numFloors * floorHeight;
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(size, 0.4, size), this.concreteMat);
    roofSlab.position.set(0, roofY + 0.2, 0);
    roofSlab.receiveShadow = true;
    group.add(roofSlab);

    // Parapet low barrier for sniper peeking
    const parapetMat = this.concreteMat;
    const parapetHeight = 1.1;
    // Front parapet
    const pFront = new THREE.Mesh(new THREE.BoxGeometry(size, parapetHeight, 0.3), parapetMat);
    pFront.position.set(0, roofY + parapetHeight / 2 + 0.4, size / 2);
    pFront.castShadow = true;
    group.add(pFront);

    // Back parapet
    const pBack = new THREE.Mesh(new THREE.BoxGeometry(size, parapetHeight, 0.3), parapetMat);
    pBack.position.set(0, roofY + parapetHeight / 2 + 0.4, -size / 2);
    pBack.castShadow = true;
    group.add(pBack);

    // Left parapet
    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, parapetHeight, size), parapetMat);
    pLeft.position.set(-size / 2, roofY + parapetHeight / 2 + 0.4, 0);
    pLeft.castShadow = true;
    group.add(pLeft);

    this.scene.add(group);

    // Rooftop collision
    this.colliders.push({
      type: 'FLOOR_PLANE',
      minX: baseX - size / 2,
      maxX: baseX + size / 2,
      minZ: baseZ - size / 2,
      maxZ: baseZ + size / 2,
      y: roofY + 0.4,
    });

    // Rooftop Sniper Loot Spawn
    this.spawnPoints.push(new THREE.Vector3(baseX, roofY + 0.5, baseZ));
  }
}
