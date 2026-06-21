// x/timer.js
const XTimer = {
  checkSession: async function() {
    const settings = await XStorage.getSettings();
    if (!settings.xEnabled) return { state: CONSTANTS.STATE.IDLE };
    
    if (Utils.isBlockedPage(window.location.href, settings)) {
      const state = await XStorage.getSessionState();
      
      if (state.state === CONSTANTS.STATE.IDLE) {
        // Start a new session
        return await XStorage.startSession();
      }
      return state;
    }
    return { state: CONSTANTS.STATE.IDLE };
  }
};
