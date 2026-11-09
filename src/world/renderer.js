/**
 * WebGL 3D Renderer Setup
 */
import * as THREE from 'three';
import { stateManager } from '../state.js';

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

    const isHigh = stateManager.settings.graphicsQuality === 'HIGH';

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: isHigh,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isHigh ? 2 : 1.25));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = stateManager.settings.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Atmospheric Fog (Erangel morning fog)
    this.scene.fog = new THREE.FogExp2(0x8fa3b0, 0.007);
    this.scene.background = new THREE.Color(0x8fa3b0);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
