/**
 * Lobby UI - Launch Tab
 */
import { stateManager, GameStates } from '../state.js';
import { renderSettingsModal } from './settingsModal.js';
import { renderOnlineModal } from './onlineModal.js';
import { renderOfflineSetup } from './offlineSetup.js';

export function renderLobby(container, callbacks = {}) {
  container.innerHTML = '';

  const lobbyEl = document.createElement('div');
  lobbyEl.className = 'lobby-screen';
  lobbyEl.id = 'screen-lobby';
  lobbyEl.innerHTML = `
    <!-- Top Bar -->
    <header class="lobby-top-bar">
      <div class="lobby-brand">
        <span class="brand-badge">AAA WEB3D</span>
        <h1 class="brand-title">PUBG MOBILE</h1>
      </div>
      <div class="lobby-top-actions">
        <button class="icon-btn" id="btn-fullscreen" title="Toggle Fullscreen">⛶</button>
        <button class="icon-btn" id="btn-settings" title="Settings">⚙️</button>
      </div>
    </header>

    <!-- Center Player Card & 3D Character Area -->
    <div class="lobby-center">
      <div class="lobby-player-card">
        <div class="player-rank">CONQUEROR TIER • SQUAD I</div>
        <div class="player-name">PLAYER_01</div>
        <div class="player-stats">
          <span>K/D: <strong>4.82</strong></span>
          <span>WIN RATE: <strong>68%</strong></span>
          <span>MATCHES: <strong>342</strong></span>
        </div>
      </div>
    </div>

    <!-- Bottom Launch Area -->
    <footer class="lobby-bottom-bar">
      <div class="lobby-mode-selector">
        <div class="mode-card active" id="tab-launch">
          <div class="mode-title">CLASSIC ERANGEL</div>
          <div class="mode-subtitle">BATTLE ROYALE • TPP</div>
        </div>
        <div class="mode-card" id="btn-layout-customizer">
          <div class="mode-title">CUSTOMIZE HUD</div>
          <div class="mode-subtitle">DRAG & DROP BUTTONS</div>
        </div>
      </div>

      <div class="lobby-main-cta">
        <button class="tac-btn" id="btn-online-play">ONLINE PLAY</button>
        <button class="tac-btn gold btn-start-match" id="btn-offline-play">OFFLINE PLAY</button>
      </div>
    </footer>
  `;

  container.appendChild(lobbyEl);

  // Fullscreen Handler
  const fsBtn = lobbyEl.querySelector('#btn-fullscreen');
  fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Settings Handler
  lobbyEl.querySelector('#btn-settings').addEventListener('click', () => {
    renderSettingsModal(container);
  });

  // Online Modal Handler
  lobbyEl.querySelector('#btn-online-play').addEventListener('click', () => {
    renderOnlineModal(container);
  });

  // Offline Setup Handler
  lobbyEl.querySelector('#btn-offline-play').addEventListener('click', () => {
    renderOfflineSetup(container, (config) => {
      if (callbacks.onStartMatch) {
        callbacks.onStartMatch(config);
      }
    });
  });

  // Layout Customizer Handler
  lobbyEl.querySelector('#btn-layout-customizer').addEventListener('click', () => {
    if (callbacks.onOpenLayoutCustomizer) {
      callbacks.onOpenLayoutCustomizer();
    }
  });

  return lobbyEl;
}
