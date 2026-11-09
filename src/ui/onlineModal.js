/**
 * Online Multiplayer Placeholder Modal
 */
export function renderOnlineModal(container, onClose) {
  const modalEl = document.createElement('div');
  modalEl.className = 'tac-modal-backdrop';
  modalEl.innerHTML = `
    <div class="tac-modal">
      <div class="tac-modal-header">
        <div class="tac-modal-title">GLOBAL MATCHMAKING</div>
        <button class="tac-modal-close" id="btn-close-online">&times;</button>
      </div>
      <div class="tac-modal-body" style="text-align: center; padding: 36px 20px;">
        <div style="font-size: 48px; margin-bottom: 12px; animation: pulse 1.5s infinite;">📡</div>
        <h3 style="font-family: var(--font-military); font-size: 26px; color: var(--color-gold-bright); margin-bottom: 8px;">
          SERVER REGION: ASIA / GLOBAL [READY]
        </h3>
        <p style="color: var(--color-text-dim); max-width: 440px; margin: 0 auto 20px auto; font-size: 15px; line-height: 1.5;">
          Online multiplayer backend interface is active. Ready to connect to dedicated WebSocket / WebRTC authoritative game server.
        </p>
        <div style="background: rgba(0,0,0,0.5); padding: 12px; border: 1px dashed rgba(245,166,35,0.4); font-family: var(--font-mono); font-size: 13px; color: #00ff88;">
          &gt; ws://pubg-matchmaker.internal:8080/v1/queue<br>
          &gt; PING: 24ms | TICKRATE: 60Hz | STATUS: LISTENING
        </div>
      </div>
      <div class="tac-modal-footer">
        <button class="tac-btn small" id="btn-cancel-online">CLOSE</button>
      </div>
    </div>
  `;

  container.appendChild(modalEl);

  const close = () => {
    modalEl.remove();
    if (onClose) onClose();
  };

  modalEl.querySelector('#btn-close-online').addEventListener('click', close);
  modalEl.querySelector('#btn-cancel-online').addEventListener('click', close);
}
