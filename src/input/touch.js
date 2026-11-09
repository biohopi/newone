/**
 * Multi-touch Input Controller
 */

export class TouchManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.touches = new Map(); // identifier -> touchData

    this.onAimMove = null;
    this.activeAimTouchId = null;
    this.lastAimPos = { x: 0, y: 0 };

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('pointerdown', this.onPointerDown.bind(this), { passive: false });
    window.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: false });
    window.addEventListener('pointerup', this.onPointerUp.bind(this), { passive: false });
    window.addEventListener('pointercancel', this.onPointerUp.bind(this), { passive: false });
  }

  onPointerDown(e) {
    // Check if target is part of UI with specific interaction
    const target = e.target;
    const isHudButton = target.closest('.hud-btn') || target.closest('.joystick-zone') || target.closest('.tac-modal') || target.closest('button');

    if (!isHudButton && e.clientX > window.innerWidth * 0.35) {
      // Right-side aim touch
      this.activeAimTouchId = e.pointerId;
      this.lastAimPos = { x: e.clientX, y: e.clientY };
    }

    this.touches.set(e.pointerId, {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      target: e.target,
    });
  }

  onPointerMove(e) {
    if (this.touches.has(e.pointerId)) {
      const t = this.touches.get(e.pointerId);
      t.currentX = e.clientX;
      t.currentY = e.clientY;
    }

    if (e.pointerId === this.activeAimTouchId && this.onAimMove) {
      const dx = e.clientX - this.lastAimPos.x;
      const dy = e.clientY - this.lastAimPos.y;
      this.lastAimPos = { x: e.clientX, y: e.clientY };
      this.onAimMove(dx, dy);
    }
  }

  onPointerUp(e) {
    this.touches.delete(e.pointerId);
    if (e.pointerId === this.activeAimTouchId) {
      this.activeAimTouchId = null;
    }
  }

  destroy() {
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  }
}
