/**
 * Layout Customizer Drag-and-Drop System
 */

export const DEFAULT_LAYOUT = {
  'hud-joystick': { bottom: 40, left: 60, scale: 1 },
  'btn-fire-left': { top: 120, left: 40, scale: 1.1 },
  'btn-fire-right': { bottom: 120, right: 140, scale: 1.2 },
  'btn-scope': { bottom: 200, right: 50, scale: 1.15 },
  'btn-jump': { bottom: 110, right: 40, scale: 1 },
  'btn-crouch': { bottom: 40, right: 120, scale: 1 },
  'btn-prone': { bottom: 40, right: 40, scale: 0.9 },
  'btn-reload': { bottom: 190, right: 130, scale: 0.95 },
  'btn-heal': { bottom: 40, left: 240, scale: 1 },
};

export class LayoutManager {
  static STORAGE_KEY = 'pubg_hud_layout';

  static getLayout() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading layout:', e);
    }
    return { ...DEFAULT_LAYOUT };
  }

  static saveLayout(layout) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layout));
    } catch (e) {
      console.warn('Error saving layout:', e);
    }
  }

  static resetLayout() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
    return { ...DEFAULT_LAYOUT };
  }

  static applyLayoutToElements(container) {
    const layout = this.getLayout();
    for (const [id, pos] of Object.entries(layout)) {
      const el = container.querySelector(`#${id}`);
      if (el) {
        this.applyPosition(el, pos);
      }
    }
  }

  static applyPosition(element, pos) {
    element.style.left = pos.left !== undefined ? `${pos.left}px` : 'auto';
    element.style.right = pos.right !== undefined ? `${pos.right}px` : 'auto';
    element.style.top = pos.top !== undefined ? `${pos.top}px` : 'auto';
    element.style.bottom = pos.bottom !== undefined ? `${pos.bottom}px` : 'auto';
    if (pos.scale) {
      element.style.transform = `scale(${pos.scale})`;
    }
  }
}

export function openLayoutCustomizer(container, onSaveAndExit) {
  let layout = LayoutManager.getLayout();

  const customizerEl = document.createElement('div');
  customizerEl.className = 'layout-customizer-overlay';
  customizerEl.innerHTML = `
    <div class="customizer-grid-bg"></div>
    <header class="customizer-header">
      <div>
        <div class="customizer-title">CUSTOMIZE CONTROL LAYOUT</div>
        <div class="customizer-hints">Drag buttons to reposition. Tap reset to restore defaults.</div>
      </div>
      <div class="customizer-actions">
        <button class="tac-btn small danger" id="btn-reset-layout">RESET DEFAULTS</button>
        <button class="tac-btn small gold" id="btn-save-layout">SAVE & EXIT</button>
      </div>
    </header>
    <div id="customizer-sandbox" style="flex:1; position:relative; width:100%; height:100%;"></div>
  `;

  container.appendChild(customizerEl);

  const sandbox = customizerEl.querySelector('#customizer-sandbox');

  // Spawn dummy representation of buttons
  const buttonConfigs = [
    { id: 'hud-joystick', label: 'JOYSTICK', icon: '🕹️', width: 140, height: 140, circular: true },
    { id: 'btn-fire-left', label: 'FIRE L', icon: '🎯', width: 68, height: 68, circular: true },
    { id: 'btn-fire-right', label: 'FIRE R', icon: '🔥', width: 78, height: 78, circular: true },
    { id: 'btn-scope', label: 'ADS', icon: '🔭', width: 74, height: 74, circular: true },
    { id: 'btn-jump', label: 'JUMP', icon: '⏫', width: 64, height: 64, circular: true },
    { id: 'btn-crouch', label: 'CROUCH', icon: '🧎', width: 64, height: 64, circular: true },
    { id: 'btn-prone', label: 'PRONE', icon: '🛌', width: 58, height: 58, circular: true },
    { id: 'btn-reload', label: 'RELOAD', icon: '🔄', width: 60, height: 60, circular: true },
    { id: 'btn-heal', label: 'HEAL', icon: '➕', width: 64, height: 64, circular: true },
  ];

  const spawnedElements = [];

  buttonConfigs.forEach((cfg) => {
    const pos = layout[cfg.id] || DEFAULT_LAYOUT[cfg.id] || { bottom: 50, right: 50 };
    const btn = document.createElement('div');
    btn.className = 'hud-btn';
    btn.id = cfg.id;
    btn.style.width = `${cfg.width}px`;
    btn.style.height = `${cfg.height}px`;
    btn.innerHTML = `<span class="btn-icon">${cfg.icon}</span><span class="btn-label">${cfg.label}</span>`;
    sandbox.appendChild(btn);
    LayoutManager.applyPosition(btn, pos);
    makeDraggable(btn, (newPos) => {
      layout[cfg.id] = newPos;
    });
    spawnedElements.push(btn);
  });

  function makeDraggable(el, onUpdated) {
    let startX = 0;
    let startY = 0;
    let elStartLeft = 0;
    let elStartTop = 0;

    const onPointerDown = (e) => {
      e.stopPropagation();
      el.setPointerCapture(e.pointerId);
      el.classList.add('customizer-dragging');
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      elStartLeft = rect.left;
      elStartTop = rect.top;
    };

    const onPointerMove = (e) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, elStartLeft + dx));
      let newTop = Math.max(60, Math.min(window.innerHeight - el.offsetHeight - 10, elStartTop + dy));

      el.style.left = `${newLeft}px`;
      el.style.top = `${newTop}px`;
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    };

    const onPointerUp = (e) => {
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
        el.classList.remove('customizer-dragging');

        const rect = el.getBoundingClientRect();
        const posRecord = {
          left: Math.round(rect.left),
          top: Math.round(rect.top),
        };
        onUpdated(posRecord);
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
  }

  // Reset defaults handler
  customizerEl.querySelector('#btn-reset-layout').addEventListener('click', () => {
    layout = LayoutManager.resetLayout();
    buttonConfigs.forEach((cfg) => {
      const el = sandbox.querySelector(`#${cfg.id}`);
      if (el) {
        LayoutManager.applyPosition(el, layout[cfg.id]);
      }
    });
  });

  // Save & Exit handler
  customizerEl.querySelector('#btn-save-layout').addEventListener('click', () => {
    LayoutManager.saveLayout(layout);
    customizerEl.remove();
    if (onSaveAndExit) onSaveAndExit();
  });
}
