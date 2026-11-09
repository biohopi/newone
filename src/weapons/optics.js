/**
 * ADS Camera Optics & Reticle Controller
 */

export class OpticsController {
  constructor(camera, hud) {
    this.camera = camera;
    this.hud = hud;
    this.isScoped = false;
    this.baseFov = 65;
    this.targetFov = 65;
  }

  toggleScope(weaponDef) {
    this.isScoped = !this.isScoped;
    if (this.isScoped) {
      this.targetFov = weaponDef ? weaponDef.zoomFov : 45;
      this.hud.setScopeVisible(true);
    } else {
      this.targetFov = this.baseFov;
      this.hud.setScopeVisible(false);
    }
  }

  reset() {
    this.isScoped = false;
    this.targetFov = this.baseFov;
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
    this.hud.setScopeVisible(false);
  }

  update(delta) {
    if (Math.abs(this.camera.fov - this.targetFov) > 0.1) {
      this.camera.fov += (this.targetFov - this.camera.fov) * (delta * 18);
      this.camera.updateProjectionMatrix();
    }
  }
}
