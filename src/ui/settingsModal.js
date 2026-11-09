/**
 * Settings Modal Component
 */
import { stateManager } from '../state.js';

export function renderSettingsModal(container, onClose) {
  const settings = stateManager.settings;

  const modalEl = document.createElement('div');
  modalEl.className = 'tac-modal-backdrop';
  modalEl.innerHTML = `
    <div class="tac-modal">
      <div class="tac-modal-header">
        <div class="tac-modal-title">SYSTEM SETTINGS</div>
        <button class="tac-modal-close" id="btn-close-settings">&times;</button>
      </div>
      <div class="tac-modal-body">
        <div class="settings-group">
          <div class="settings-label">
            <span>MASTER VOLUME</span>
            <span><strong id="val-master">${Math.round(settings.masterVolume * 100)}%</strong></span>
          </div>
          <input type="range" class="tac-range" id="range-master" min="0" max="1" step="0.05" value="${settings.masterVolume}">
        </div>

        <div class="settings-group">
          <div class="settings-label">
            <span>SFX / GUNSHOT VOLUME</span>
            <span><strong id="val-sfx">${Math.round(settings.sfxVolume * 100)}%</strong></span>
          </div>
          <input type="range" class="tac-range" id="range-sfx" min="0" max="1" step="0.05" value="${settings.sfxVolume}">
        </div>

        <div class="settings-group">
          <div class="settings-label">
            <span>CAMERA LOOK SENSITIVITY</span>
            <span><strong id="val-sens">${settings.lookSensitivity.toFixed(1)}x</strong></span>
          </div>
          <input type="range" class="tac-range" id="range-sens" min="0.2" max="3.0" step="0.1" value="${settings.lookSensitivity}">
        </div>

        <div class="settings-group">
          <div class="settings-label">
            <span>ADS SCOPE SENSITIVITY</span>
            <span><strong id="val-ads">${settings.adsSensitivity.toFixed(1)}x</strong></span>
          </div>
          <input type="range" class="tac-range" id="range-ads" min="0.1" max="2.0" step="0.1" value="${settings.adsSensitivity}">
        </div>

        <div class="settings-group">
          <div class="settings-label">
            <span>GRAPHICS PRESET</span>
          </div>
          <div class="tac-toggle-group" id="group-graphics">
            <button class="tac-toggle-opt ${settings.graphicsQuality === 'LOW' ? 'active' : ''}" data-val="LOW">SMOOTH (60FPS)</button>
            <button class="tac-toggle-opt ${settings.graphicsQuality === 'HIGH' ? 'active' : ''}" data-val="HIGH">ULTRA HD</button>
          </div>
        </div>
      </div>
      <div class="tac-modal-footer">
        <button class="tac-btn gold small" id="btn-save-settings">APPLY & CLOSE</button>
      </div>
    </div>
  `;

  container.appendChild(modalEl);

  const rangeMaster = modalEl.querySelector('#range-master');
  const rangeSfx = modalEl.querySelector('#range-sfx');
  const rangeSens = modalEl.querySelector('#range-sens');
  const rangeAds = modalEl.querySelector('#range-ads');
  const graphicsBtns = modalEl.querySelectorAll('#group-graphics .tac-toggle-opt');

  let currentGraphics = settings.graphicsQuality;

  rangeMaster.addEventListener('input', (e) => {
    modalEl.querySelector('#val-master').textContent = `${Math.round(e.target.value * 100)}%`;
  });
  rangeSfx.addEventListener('input', (e) => {
    modalEl.querySelector('#val-sfx').textContent = `${Math.round(e.target.value * 100)}%`;
  });
  rangeSens.addEventListener('input', (e) => {
    modalEl.querySelector('#val-sens').textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
  });
  rangeAds.addEventListener('input', (e) => {
    modalEl.querySelector('#val-ads').textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
  });

  graphicsBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      graphicsBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentGraphics = btn.dataset.val;
    });
  });

  const close = () => {
    modalEl.remove();
    if (onClose) onClose();
  };

  modalEl.querySelector('#btn-close-settings').addEventListener('click', close);
  modalEl.querySelector('#btn-save-settings').addEventListener('click', () => {
    stateManager.saveSettings({
      masterVolume: parseFloat(rangeMaster.value),
      sfxVolume: parseFloat(rangeSfx.value),
      lookSensitivity: parseFloat(rangeSens.value),
      adsSensitivity: parseFloat(rangeAds.value),
      graphicsQuality: currentGraphics,
    });
    close();
  });
}
