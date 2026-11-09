/**
 * Dynamic Minimap Radar with Player Direction Arrow & FOV Cone
 */

export class Minimap {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.size = 140;

    this.init();
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.className = 'minimap-container';
    wrapper.innerHTML = `
      <canvas id="minimap-canvas" width="${this.size}" height="${this.size}"></canvas>
    `;

    const info = document.createElement('div');
    info.className = 'minimap-zone-info';
    info.id = 'minimap-zone-timer';
    info.textContent = 'PLAYZONE CLOSING: 02:45';

    this.container.appendChild(wrapper);
    this.container.appendChild(info);

    this.canvas = wrapper.querySelector('#minimap-canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  update({ playerPos, playerYaw, bots = [], safeZone = { x: 0, z: 0, r: 80 } }) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const center = this.size / 2;
    const mapScale = 0.55; // meters to radar pixels

    ctx.clearRect(0, 0, this.size, this.size);

    // Background tactical grid
    ctx.fillStyle = '#0f1722';
    ctx.fillRect(0, 0, this.size, this.size);

    ctx.save();
    // Translate origin to center
    ctx.translate(center, center);

    // Rotate map with player or keep north up? Standard PUBG keeps north up or rotates.
    // Standard PUBG rotates map relative to player facing:
    ctx.rotate(-playerYaw);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = -200; x <= 200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x - playerPos.x * mapScale, -200 - playerPos.z * mapScale);
      ctx.lineTo(x - playerPos.x * mapScale, 200 - playerPos.z * mapScale);
      ctx.stroke();
    }

    // Draw Safe Zone (White circle)
    const szDx = (safeZone.x - playerPos.x) * mapScale;
    const szDz = (safeZone.z - playerPos.z) * mapScale;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(szDx, szDz, safeZone.r * mapScale, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Blue Zone (Pulsing blue circle)
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(szDx, szDz, (safeZone.r + 25) * mapScale, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Bots (Hostile = Red dot, Teammate = Green dot)
    for (const bot of bots) {
      if (bot.isDead) continue;
      const bDx = (bot.position.x - playerPos.x) * mapScale;
      const bDz = (bot.position.z - playerPos.z) * mapScale;

      ctx.fillStyle = bot.team === 1 ? '#00ff88' : '#ff3344';
      ctx.beginPath();
      ctx.arc(bDx, bDz, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Player indicator in the exact center (Always pointing up)
    // Draw FOV Cone
    ctx.save();
    ctx.translate(center, center);

    const coneGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
    coneGrad.addColorStop(0, 'rgba(245, 166, 35, 0.4)');
    coneGrad.addColorStop(1, 'rgba(245, 166, 35, 0.0)');
    ctx.fillStyle = coneGrad;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 45, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
    ctx.closePath();
    ctx.fill();

    // Directional Player Arrow
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
