/**
 * Fixed Virtual Joystick with Max Push Sprint Lock
 */

export class VirtualJoystick {
  constructor(containerElement, onMoveCallback) {
    this.container = containerElement;
    this.onMove = onMoveCallback;

    this.zoneEl = null;
    this.thumbEl = null;
    this.sprintEl = null;

    this.activeTouchId = null;
    this.baseRect = null;
    this.center = { x: 0, y: 0 };
    this.radius = 60; // Max thumb travel distance

    this.vector = { x: 0, y: 0, sprint: false };

    this.createElements();
    this.bindEvents();
  }

  createElements() {
    this.zoneEl = document.createElement('div');
    this.zoneEl.className = 'joystick-zone';
    this.zoneEl.id = 'hud-joystick';
    this.zoneEl.innerHTML = `
      <div class="sprint-lock-indicator" id="joystick-sprint-badge">⚡ SPRINT</div>
      <div class="joystick-base">
        <div class="joystick-thumb"></div>
      </div>
    `;

    this.container.appendChild(this.zoneEl);
    this.thumbEl = this.zoneEl.querySelector('.joystick-thumb');
    this.sprintEl = this.zoneEl.querySelector('#joystick-sprint-badge');
  }

  bindEvents() {
    this.zoneEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.activeTouchId = e.pointerId;
      this.zoneEl.setPointerCapture(e.pointerId);
      this.baseRect = this.zoneEl.getBoundingClientRect();
      this.center = {
        x: this.baseRect.left + this.baseRect.width / 2,
        y: this.baseRect.top + this.baseRect.height / 2,
      };
      this.updatePosition(e.clientX, e.clientY);
    });

    this.zoneEl.addEventListener('pointermove', (e) => {
      if (this.activeTouchId === e.pointerId) {
        e.stopPropagation();
        this.updatePosition(e.clientX, e.clientY);
      }
    });

    const release = (e) => {
      if (this.activeTouchId === e.pointerId) {
        e.stopPropagation();
        this.resetPosition();
      }
    };

    this.zoneEl.addEventListener('pointerup', release);
    this.zoneEl.addEventListener('pointercancel', release);
  }

  updatePosition(clientX, clientY) {
    let dx = clientX - this.center.x;
    let dy = clientY - this.center.y;
    const distance = Math.hypot(dx, dy);

    // Sprint threshold (push beyond 85% radius forward)
    let sprint = false;
    if (dy < -this.radius * 0.8 && Math.abs(dx) < this.radius * 0.6) {
      sprint = true;
    }

    if (distance > this.radius) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * this.radius;
      dy = Math.sin(angle) * this.radius;
    }

    // Apply thumb translation
    this.thumbEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    if (sprint) {
      this.sprintEl.classList.add('active');
    } else {
      this.sprintEl.classList.remove('active');
    }

    // Normalized move vector (-1 to 1)
    this.vector = {
      x: dx / this.radius,
      y: dy / this.radius,
      sprint: sprint,
    };

    if (this.onMove) {
      this.onMove(this.vector);
    }
  }

  resetPosition() {
    this.activeTouchId = null;
    this.thumbEl.style.transform = 'translate(-50%, -50%)';
    this.sprintEl.classList.remove('active');
    this.vector = { x: 0, y: 0, sprint: false };
    if (this.onMove) {
      this.onMove(this.vector);
    }
  }

  destroy() {
    if (this.zoneEl) {
      this.zoneEl.remove();
    }
  }
}
