/**
 * Realistic Tactical Atmospheric Lighting & Sky
 */
import * as THREE from 'three';

export class SkyManager {
  constructor(scene, weather = 'CLEAR') {
    this.scene = scene;
    this.weather = weather;
    this.dirLight = null;
    this.hemiLight = null;

    this.setupLighting();
  }

  setupLighting() {
    let skyColor, groundColor, sunColor, sunIntensity;

    if (this.weather === 'SUNSET') {
      skyColor = 0xff7e47;
      groundColor = 0x241810;
      sunColor = 0xffaa44;
      sunIntensity = 1.6;
      this.scene.fog.color.setHex(0xb86b43);
      this.scene.background.setHex(0xb86b43);
    } else if (this.weather === 'FOG') {
      skyColor = 0x9099a2;
      groundColor = 0x2b3035;
      sunColor = 0xcad2d8;
      sunIntensity = 1.0;
      this.scene.fog.density = 0.015;
      this.scene.fog.color.setHex(0x9099a2);
      this.scene.background.setHex(0x9099a2);
    } else {
      // CLEAR DAYLIGHT
      skyColor = 0x87ceeb;
      groundColor = 0x3d4a36;
      sunColor = 0xfff4e0;
      sunIntensity = 1.8;
      this.scene.fog.density = 0.006;
      this.scene.fog.color.setHex(0x98b5cb);
      this.scene.background.setHex(0x98b5cb);
    }

    // Hemisphere Light (Realistic ambient sky/ground bounce)
    this.hemiLight = new THREE.HemisphereLight(skyColor, groundColor, 0.7);
    this.scene.add(this.hemiLight);

    // Directional Sun Light
    this.dirLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    this.dirLight.position.set(70, 110, 50);
    this.dirLight.castShadow = true;

    // Optimized mobile shadow frustum
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 250;
    const d = 80;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;

    this.scene.add(this.dirLight);

    // Sky Dome
    const skyGeo = new THREE.SphereGeometry(450, 32, 15);
    const skyMat = new THREE.MeshBasicMaterial({
      color: skyColor,
      side: THREE.BackSide,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyMesh);
  }
}
