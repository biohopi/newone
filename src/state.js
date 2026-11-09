/**
 * PUBG Mobile Web 3D - Central State Machine
 */

export const GameStates = {
  LOBBY: 'LOBBY',
  OFFLINE_SETUP: 'OFFLINE_SETUP',
  ONLINE_MODAL: 'ONLINE_MODAL',
  LAYOUT_CUSTOMIZER: 'LAYOUT_CUSTOMIZER',
  SETTINGS: 'SETTINGS',
  MATCH_PLAYING: 'MATCH_PLAYING',
  MATCH_PAUSED: 'MATCH_PAUSED',
  MATCH_END: 'MATCH_END',
};

class StateManager {
  constructor() {
    this.currentState = GameStates.LOBBY;
    this.listeners = new Map();

    // Default Match Configuration
    this.matchConfig = {
      team1Bots: 0, // default 0 per ticket
      team2Bots: 0, // default 0 per ticket
      mode: 'BATTLE_ROYALE',
      weather: 'CLEAR',
    };

    // User Settings (Stored in LocalStorage)
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('pubg_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }

    return {
      masterVolume: 0.8,
      sfxVolume: 0.9,
      musicVolume: 0.6,
      lookSensitivity: 1.0,
      adsSensitivity: 0.6,
      graphicsQuality: 'HIGH', // LOW, MEDIUM, HIGH
      showFps: true,
      shadows: true,
    };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('pubg_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
    this.emit('settingsChanged', this.settings);
  }

  setState(newState, payload = {}) {
    if (this.currentState === newState) return;
    const oldState = this.currentState;
    this.currentState = newState;
    console.log(`[StateManager] Transition: ${oldState} -> ${newState}`);
    this.emit('stateChange', { newState, oldState, payload });
  }

  getState() {
    return this.currentState;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const list = this.listeners.get(event).filter((cb) => cb !== callback);
    this.listeners.set(event, list);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    for (const callback of this.listeners.get(event)) {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in state listener for ${event}:`, err);
      }
    }
  }
}

export const stateManager = new StateManager();
