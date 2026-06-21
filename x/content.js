// x/content.js
(async function() {
  'use strict';

  let currentSettings = await XStorage.getSettings();

  async function handleState(stateData) {
    if (Utils.isBlockedPage(window.location.href, currentSettings)) {
      if (stateData.state === CONSTANTS.STATE.LOCKED) {
        const blockDurationMs = (currentSettings.xBlockDuration || 60) * 60 * 1000;
        XLockScreen.injectLocked(stateData.lockStartedAt, blockDurationMs);
      } else if (stateData.state === CONSTANTS.STATE.IDLE) {
        const browseDurationMins = currentSettings.xBrowseDuration || 20;
        XLockScreen.injectIdle(browseDurationMins);
      } else {
        XLockScreen.remove();
      }
    } else {
      XLockScreen.remove();
    }
  }

  async function checkCurrentPage() {
    currentSettings = await XStorage.getSettings();
    const stateData = await XTimer.checkSession();
    handleState(stateData);
  }

  window.focusxRecheck = checkCurrentPage;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sessionUpdate') {
      handleState({ state: request.state });
    } else if (request.action === 'lockTriggered') {
      handleState({ state: CONSTANTS.STATE.LOCKED, lockStartedAt: request.lockStartedAt });
    } else if (request.action === 'lockExpired') {
      handleState({ state: request.state });
    } else if (request.action === 'xSettingsUpdated') {
      checkCurrentPage();
    }
  });

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      checkCurrentPage();
    }
  }).observe(document.documentElement, { subtree: true, childList: true });

  window.addEventListener('popstate', checkCurrentPage);
  
  checkCurrentPage();
})();
