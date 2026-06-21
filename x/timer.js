// x/timer.js
window.XTimer = {
  checkSession: async function() {
    const settings = await XStorage.getSettings();
    if (!settings.xEnabled) return { state: CONSTANTS.STATE.IDLE };
    
    if (Utils.isBlockedPage(window.location.href, settings)) {
      return await XStorage.getSessionState();
    }
    return { state: CONSTANTS.STATE.IDLE };
  }
};
