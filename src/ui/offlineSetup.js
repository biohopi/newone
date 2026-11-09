/**
 * Offline Play Setup Tab
 */
import { stateManager, GameStates } from '../state.js';

export function renderOfflineSetup(container, onStartMatch, onBack) {
  let team1Bots = stateManager.matchConfig.team1Bots; // default 0
  let team2Bots = stateManager.matchConfig.team2Bots; // default 0

  const screenEl = document.createElement('div');
  screenEl.className = 'tac-modal-backdrop';
  screenEl.innerHTML = `
    <div class="tac-modal" style="max-width: 720px;">
      <div class="tac-modal-header">
        <div class="tac-modal-title">TACTICAL BOT CUSTOMIZATION & MATCH SETUP</div>
        <button class="tac-modal-close" id="btn-close-offline">&times;</button>
      </div>

      <div class="tac-modal-body">
        <div class="offline-config-grid">
          <!-- Team 1 Configuration -->
          <div class="config-box">
            <h3>
              <span>TEAM 1 (ALLIED SQUAD)</span>
              <span style="font-size: 14px; color: #00ff88;">PLAYER TEAM</span>
            </h3>
            <p style="font-size: 13px; color: var(--color-text-dim); margin-bottom: 14px;">
              Number of AI teammates fighting alongside you.
            </p>
            <div class="bot-stepper">
              <button class="stepper-btn" id="btn-team1-minus">-</button>
              <div class="stepper-val" id="val-team1-bots">${team1Bots}</div>
              <button class="stepper-btn" id="btn-team1-plus">+</button>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: var(--color-text-dim);">
              Squad: Player + <strong id="lbl-team1-count" style="color: #fff;">${team1Bots}</strong> Bots
            </div>
          </div>

          <!-- Team 2 Configuration -->
          <div class="config-box">
            <h3>
              <span>TEAM 2 (HOSTILE SQUAD)</span>
              <span style="font-size: 14px; color: #ff3344;">ENEMY FORCE</span>
            </h3>
            <p style="font-size: 13px; color: var(--color-text-dim); margin-bottom: 14px;">
              Number of tactical enemy AI bots to eliminate.
            </p>
            <div class="bot-stepper">
              <button class="stepper-btn" id="btn-team2-minus">-</button>
              <div class="stepper-val" id="val-team2-bots">${team2Bots}</div>
              <button class="stepper-btn" id="btn-team2-plus">+</button>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: var(--color-text-dim);">
              Total Enemies: <strong id="lbl-team2-count" style="color: #fff;">${team2Bots}</strong> Bots
            </div>
          </div>
        </div>

        <!-- Weather / Match Settings -->
        <div class="config-box" style="margin-bottom: 10px;">
          <h3 style="margin-bottom: 8px;">COMBAT ZONE ENVIRONMENT</h3>
          <div class="tac-toggle-group" id="weather-group">
            <button class="tac-toggle-opt active" data-weather="CLEAR">CLEAR DAYLIGHT</button>
            <button class="tac-toggle-opt" data-weather="SUNSET">GOLDEN SUNSET</button>
            <button class="tac-toggle-opt" data-weather="FOG">TACTICAL FOG</button>
          </div>
        </div>
      </div>

      <div class="tac-modal-footer">
        <button class="tac-btn small" id="btn-back-offline">BACK TO LOBBY</button>
        <button class="tac-btn gold btn-start-match" id="btn-start-offline" style="padding: 10px 32px; font-size: 24px;">
          DEPLOY TO ERANGEL ➔
        </button>
      </div>
    </div>
  `;

  container.appendChild(screenEl);

  const valTeam1 = screenEl.querySelector('#val-team1-bots');
  const lblTeam1 = screenEl.querySelector('#lbl-team1-count');
  const valTeam2 = screenEl.querySelector('#val-team2-bots');
  const lblTeam2 = screenEl.querySelector('#lbl-team2-count');

  screenEl.querySelector('#btn-team1-minus').addEventListener('click', () => {
    if (team1Bots > 0) {
      team1Bots--;
      valTeam1.textContent = team1Bots;
      lblTeam1.textContent = team1Bots;
    }
  });

  screenEl.querySelector('#btn-team1-plus').addEventListener('click', () => {
    if (team1Bots < 7) {
      team1Bots++;
      valTeam1.textContent = team1Bots;
      lblTeam1.textContent = team1Bots;
    }
  });

  screenEl.querySelector('#btn-team2-minus').addEventListener('click', () => {
    if (team2Bots > 0) {
      team2Bots--;
      valTeam2.textContent = team2Bots;
      lblTeam2.textContent = team2Bots;
    }
  });

  screenEl.querySelector('#btn-team2-plus').addEventListener('click', () => {
    if (team2Bots < 15) {
      team2Bots++;
      valTeam2.textContent = team2Bots;
      lblTeam2.textContent = team2Bots;
    }
  });

  let selectedWeather = 'CLEAR';
  const weatherBtns = screenEl.querySelectorAll('#weather-group .tac-toggle-opt');
  weatherBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      weatherBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedWeather = btn.dataset.weather;
    });
  });

  const close = () => {
    screenEl.remove();
    if (onBack) onBack();
  };

  screenEl.querySelector('#btn-close-offline').addEventListener('click', close);
  screenEl.querySelector('#btn-back-offline').addEventListener('click', close);

  screenEl.querySelector('#btn-start-offline').addEventListener('click', () => {
    stateManager.matchConfig.team1Bots = team1Bots;
    stateManager.matchConfig.team2Bots = team2Bots;
    stateManager.matchConfig.weather = selectedWeather;
    screenEl.remove();
    if (onStartMatch) {
      onStartMatch(stateManager.matchConfig);
    }
  });
}
