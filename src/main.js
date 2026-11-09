/**
 * Application Entry Point
 */
import { stateManager, GameStates } from './state.js';
import { renderLobby } from './ui/lobby.js';
import { openLayoutCustomizer } from './ui/layoutCustomizer.js';
import { MatchSession } from './game/match.js';

const uiRoot = document.getElementById('ui-root');
let activeMatch = null;

function startMatchSession(config) {
  if (activeMatch) {
    activeMatch.destroy();
    activeMatch = null;
  }
  const canvas = document.getElementById('webgl-canvas');
  uiRoot.innerHTML = '';
  activeMatch = new MatchSession(canvas, uiRoot, config);
}

function showLobby() {
  if (activeMatch) {
    activeMatch.destroy();
    activeMatch = null;
  }
  renderLobby(uiRoot, {
    onStartMatch: (config) => {
      stateManager.setState(GameStates.MATCH_PLAYING, { config });
    },
    onOpenLayoutCustomizer: () => {
      openLayoutCustomizer(uiRoot, () => {
        showLobby();
      });
    },
  });
}

stateManager.on('stateChange', ({ newState, payload }) => {
  if (newState === GameStates.LOBBY) {
    showLobby();
  } else if (newState === GameStates.MATCH_PLAYING) {
    startMatchSession(payload.config || stateManager.matchConfig);
  }
});

// Initial Lobby Render
showLobby();
