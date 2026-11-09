/**
 * In-Game Tactical HUD Manager
 */
import { Compass } from './compass.js';
import { Minimap } from './minimap.js';
import { LayoutManager } from './layoutCustomizer.js';

export class InGameHUD {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.hudEl = null;
    this.compass = null;
    this.minimap = null;

    this.init();
  }

  init() {
    this.hudEl = document.createElement('div');
    this.hudEl.className = 'match-hud';
    this.hudEl.innerHTML = `
      <!-- Red Damage Vignette -->
      <div class="damage-vignette" id="damage-vignette"></div>

      <!-- Scope Reticle Overlay (Hidden by default) -->
      <div class="scope-overlay" id="scope-overlay">
        <div class="scope-vignette"></div>
        <svg class="scope-crosshair" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="140" stroke="#00ff88" stroke-width="1.5" fill="none" opacity="0.6"/>
          <line x1="200" y1="20" x2="200" y2="180" stroke="#00ff88" stroke-width="1.5"/>
          <line x1="200" y1="220" x2="200" y2="380" stroke="#00ff88" stroke-width="1.5"/>
          <line x1="20" y1="200" x2="180" y2="200" stroke="#00ff88" stroke-width="1.5"/>
          <line x1="220" y1="200" x2="380" y2="200" stroke="#00ff88" stroke-width="1.5"/>
          <circle cx="200" cy="200" r="2.5" fill="#ff1744"/>
          <!-- Sub-mil markings -->
          <line x1="190" y1="240" x2="210" y2="240" stroke="#00ff88" stroke-width="1"/>
          <line x1="194" y1="260" x2="206" y2="260" stroke="#00ff88" stroke-width="1"/>
          <line x1="190" y1="280" x2="210" y2="280" stroke="#00ff88" stroke-width="1"/>
        </svg>
      </div>

      <!-- Top Match Status Bar -->
      <div class="match-status-bar">
        <button class="icon-btn btn-pause-match interactive" id="btn-pause" title="Pause Match">⏸️</button>
        <div class="survivor-badge">
          <span class="survivor-count" id="lbl-alive-count">100</span>
          <span class="survivor-label">ALIVE</span>
        </div>
        <div class="kill-counter">
          <span>💀</span>
          <span id="lbl-kill-count">0</span>
        </div>
      </div>

      <!-- Killfeed Container -->
      <div class="killfeed-container" id="killfeed-box"></div>

      <!-- Left Fire Button -->
      <div class="hud-btn interactive" id="btn-fire-left" style="width: 68px; height: 68px;">
        <span class="btn-icon">🎯</span>
        <span class="btn-label">FIRE</span>
      </div>

      <!-- Right Action Cluster -->
      <div class="hud-btn interactive" id="btn-fire-right" style="width: 80px; height: 80px;">
        <span class="btn-icon">🔥</span>
        <span class="btn-label">FIRE</span>
      </div>

      <div class="hud-btn interactive" id="btn-scope" style="width: 72px; height: 72px;">
        <span class="btn-icon">🔭</span>
        <span class="btn-label">SCOPE</span>
      </div>

      <div class="hud-btn interactive" id="btn-jump" style="width: 64px; height: 64px;">
        <span class="btn-icon">⏫</span>
        <span class="btn-label">JUMP</span>
      </div>

      <div class="hud-btn interactive" id="btn-crouch" style="width: 64px; height: 64px;">
        <span class="btn-icon">🧎</span>
        <span class="btn-label">CROUCH</span>
      </div>

      <div class="hud-btn interactive" id="btn-prone" style="width: 58px; height: 58px;">
        <span class="btn-icon">🛌</span>
        <span class="btn-label">PRONE</span>
      </div>

      <div class="hud-btn interactive" id="btn-reload" style="width: 60px; height: 60px;">
        <span class="btn-icon">🔄</span>
        <span class="btn-label">RELOAD</span>
      </div>

      <div class="hud-btn interactive" id="btn-heal" style="width: 64px; height: 64px;">
        <span class="btn-icon">💊</span>
        <span class="btn-label">HEAL</span>
      </div>

      <div class="hud-btn interactive" id="btn-backpack" style="width: 60px; height: 60px; bottom: 190px; left: 40px; z-index: 60;">
        <span class="btn-icon">🎒</span>
        <span class="btn-label">BAG</span>
      </div>

      <!-- Weapon Quick-Swap Slots -->
      <div class="weapon-slots-bar interactive" id="weapon-slots">
        <div class="weapon-slot-card active" id="slot-wpn-1">
          <div class="weapon-slot-name"><span>M416</span><span style="font-size: 11px;">5.56</span></div>
          <div class="weapon-slot-ammo"><span id="w1-mag">30</span>/<span id="w1-reserve">180</span></div>
        </div>
        <div class="weapon-slot-card" id="slot-wpn-2">
          <div class="weapon-slot-name"><span>AWM</span><span style="font-size: 11px;">.300</span></div>
          <div class="weapon-slot-ammo"><span id="w2-mag">5</span>/<span id="w2-reserve">20</span></div>
        </div>
      </div>

      <!-- Health Bar -->
      <div class="player-vital-panel">
        <div class="vital-labels">
          <span>HEALTH</span>
          <span id="lbl-hp-num">100 / 100</span>
        </div>
        <div class="hp-bar-bg">
          <div class="hp-bar-fill" id="player-hp-bar" style="width: 100%;"></div>
        </div>
      </div>

      <!-- Backpack Drawer Modal -->
      <div class="backpack-drawer" id="backpack-drawer">
        <div class="backpack-header">
          <span>TACTICAL BACKPACK (UNLIMITED)</span>
          <button class="tac-modal-close" id="btn-close-bag" style="font-size: 20px;">&times;</button>
        </div>
        <div class="backpack-list" id="backpack-list">
          <div class="backpack-item"><span>5.56mm Ammo</span><strong>180 Rounds</strong></div>
          <div class="backpack-item"><span>.300 Magnum Ammo</span><strong>20 Rounds</strong></div>
          <div class="backpack-item"><span>First Aid Kit</span><strong>3</strong></div>
          <div class="backpack-item"><span>Energy Drink</span><strong>4</strong></div>
          <div class="backpack-item"><span>Frag Grenade</span><strong>2</strong></div>
        </div>
      </div>
    `;

    this.container.appendChild(this.hudEl);

    // Initialize Compass & Minimap
    this.compass = new Compass(this.hudEl);
    this.minimap = new Minimap(this.hudEl);

    // Apply saved user layout
    LayoutManager.applyLayoutToElements(this.hudEl);

    this.bindHUDButtons();
  }

  bindHUDButtons() {
    const bindPress = (id, action) => {
      const el = this.hudEl.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        el.classList.add('pressed');
        if (this.callbacks[action]) this.callbacks[action](true);
      });
      const unpress = (e) => {
        e.stopPropagation();
        el.classList.remove('pressed');
        if (this.callbacks[action]) this.callbacks[action](false);
      };
      el.addEventListener('pointerup', unpress);
      el.addEventListener('pointercancel', unpress);
    };

    bindPress('btn-fire-left', 'onFire');
    bindPress('btn-fire-right', 'onFire');
    bindPress('btn-scope', 'onToggleScope');
    bindPress('btn-jump', 'onJump');
    bindPress('btn-crouch', 'onCrouch');
    bindPress('btn-prone', 'onProne');
    bindPress('btn-reload', 'onReload');
    bindPress('btn-heal', 'onHeal');

    // Weapon slot swap
    const slot1 = this.hudEl.querySelector('#slot-wpn-1');
    const slot2 = this.hudEl.querySelector('#slot-wpn-2');

    slot1.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      slot1.classList.add('active');
      slot2.classList.remove('active');
      if (this.callbacks.onSwapWeapon) this.callbacks.onSwapWeapon(0);
    });

    slot2.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      slot2.classList.add('active');
      slot1.classList.remove('active');
      if (this.callbacks.onSwapWeapon) this.callbacks.onSwapWeapon(1);
    });

    // Backpack Toggle
    const bagDrawer = this.hudEl.querySelector('#backpack-drawer');
    this.hudEl.querySelector('#btn-backpack').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      bagDrawer.classList.toggle('open');
    });

    this.hudEl.querySelector('#btn-close-bag').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      bagDrawer.classList.remove('open');
    });

    // Pause match
    this.hudEl.querySelector('#btn-pause').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (this.callbacks.onPause) this.callbacks.onPause();
    });
  }

  setHealth(hp, maxHp = 100) {
    const fill = this.hudEl.querySelector('#player-hp-bar');
    const lbl = this.hudEl.querySelector('#lbl-hp-num');
    const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));

    fill.style.width = `${pct}%`;
    lbl.textContent = `${Math.ceil(hp)} / ${maxHp}`;
    if (pct < 30) {
      fill.classList.add('low');
    } else {
      fill.classList.remove('low');
    }
  }

  triggerDamageFlash() {
    const flash = this.hudEl.querySelector('#damage-vignette');
    flash.classList.add('hit');
    setTimeout(() => flash.classList.remove('hit'), 150);
  }

  setScopeVisible(visible) {
    const scope = this.hudEl.querySelector('#scope-overlay');
    if (visible) {
      scope.classList.add('active');
    } else {
      scope.classList.remove('active');
    }
  }

  addKillfeed(killer, victim, weapon = 'M416', isPlayer = false) {
    const feed = this.hudEl.querySelector('#killfeed-box');
    const item = document.createElement('div');
    item.className = `killfeed-item ${isPlayer ? '' : 'enemy-kill'}`;
    item.innerHTML = `<strong>${killer}</strong> <span>[${weapon}]</span> <strong>${victim}</strong>`;
    feed.prepend(item);
    setTimeout(() => item.remove(), 4000);
  }

  updateSurvivors(count) {
    this.hudEl.querySelector('#lbl-alive-count').textContent = count;
  }

  updateKills(kills) {
    this.hudEl.querySelector('#lbl-kill-count').textContent = kills;
  }

  destroy() {
    if (this.hudEl) {
      this.hudEl.remove();
    }
  }
}
