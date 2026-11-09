/**
 * Procedural PBR Terrain, Roads & Cover Environment
 */
import * as THREE from 'three';

export class TerrainManager {
  constructor(scene) {
    this.scene = scene;
    this.terrainMesh = null;
    this.colliders = [];

    this.createProceduralTextures();
    this.buildTerrain();
    this.buildRoads();
    this.buildCoverObjects();
  }

  createProceduralTextures() {
    // Generate Grass Canvas Texture
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 256;
    grassCanvas.height = 256;
    const gCtx = grassCanvas.getContext('2d');
    gCtx.fillStyle = '#4c643b';
    gCtx.fillRect(0, 0, 256, 256);
    // Add noise
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const shade = Math.random() > 0.5 ? '#3b4e2d' : '#5b7646';
      gCtx.fillStyle = shade;
      gCtx.fillRect(x, y, 2, 2);
    }
    this.grassTexture = new THREE.CanvasTexture(grassCanvas);
    this.grassTexture.wrapS = THREE.RepeatWrapping;
    this.grassTexture.wrapT = THREE.RepeatWrapping;
    this.grassTexture.repeat.set(40, 40);

    // Generate Asphalt Canvas Texture
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 128;
    roadCanvas.height = 128;
    const rCtx = roadCanvas.getContext('2d');
    rCtx.fillStyle = '#22262b';
    rCtx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 1500; i++) {
      rCtx.fillStyle = Math.random() > 0.5 ? '#1a1d21' : '#2d333a';
      rCtx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }
    // Road center dashes
    rCtx.fillStyle = '#d4aa33';
    rCtx.fillRect(60, 20, 8, 88);
    this.roadTexture = new THREE.CanvasTexture(roadCanvas);
    this.roadTexture.wrapS = THREE.RepeatWrapping;
    this.roadTexture.wrapT = THREE.RepeatWrapping;
    this.roadTexture.repeat.set(1, 20);
  }

  buildTerrain() {
    // 300m x 300m Erangel combat zone
    const size = 320;
    const segments = 64;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Rolling natural hills, flat near compound center (x: -50..50, z: -50..50)
      const distFromCenter = Math.hypot(x, z);
      if (distFromCenter > 45) {
        const hillHeight = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 4.5 +
                           Math.sin(x * 0.08) * 1.5;
        pos.setY(i, hillHeight);
      } else {
        // Keep smooth compound area
        pos.setY(i, 0);
      }
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      map: this.grassTexture,
      roughness: 0.85,
      metalness: 0.1,
    });

    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  buildRoads() {
    // Main asphalt road passing through the compound
    const roadGeo = new THREE.PlaneGeometry(8, 280);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.roadTexture,
      roughness: 0.7,
      metalness: 0.2,
    });

    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.set(0, 0.04, 0);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);
  }

  buildCoverObjects() {
    // Concrete road barriers, sandbags, and boulders
    const rockGeo = new THREE.DodecahedronGeometry(2.2, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x6e737a,
      roughness: 0.9,
    });

    const rockPositions = [
      [-22, 1.2, -18],
      [28, 1.2, -35],
      [-35, 1.2, 45],
      [42, 1.2, 22],
      [-15, 1.2, 65],
    ];

    rockPositions.forEach(([x, y, z]) => {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, y, z);
      rock.scale.set(1 + Math.random() * 0.5, 0.8 + Math.random() * 0.4, 1 + Math.random() * 0.5);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);

      this.colliders.push({
        type: 'CYLINDER',
        x: x,
        z: z,
        radius: 2.2,
        height: 3,
      });
    });

    // Concrete barrier blocks
    const barrierGeo = new THREE.BoxGeometry(4, 1.2, 0.8);
    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x8a8e94,
      roughness: 0.7,
    });

    const barrierPositions = [
      [-6, 0.6, -10, 0],
      [6, 0.6, -10, 0],
      [-12, 0.6, 25, 0.3],
      [14, 0.6, 30, -0.2],
    ];

    barrierPositions.forEach(([x, y, z, rot]) => {
      const barrier = new THREE.Mesh(barrierGeo, barrierMat);
      barrier.position.set(x, y, z);
      barrier.rotation.y = rot;
      barrier.castShadow = true;
      barrier.receiveShadow = true;
      this.scene.add(barrier);

      this.colliders.push({
        type: 'AABB',
        minX: x - 2,
        maxX: x + 2,
        minZ: z - 0.4,
        maxZ: z + 0.4,
        minY: 0,
        maxY: 1.2,
      });
    });
  }
}
