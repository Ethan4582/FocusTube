// x/content.js
(async function() {
  'use strict';

  let currentSettings = await XStorage.getSettings();

  async function handleState(stateData) {
    if (stateData.state === CONSTANTS.STATE.LOCKED) {
      if (Utils.isBlockedPage(window.location.href, currentSettings)) {
        XLockScreen.inject();
        
        // Calculate durations
        const blockDurationMs = (currentSettings.xBlockDuration || 60) * 60 * 1000;
        XLockScreen.startCountdown(stateData.lockStartedAt, blockDurationMs);
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

  // Listen for background updates
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sessionUpdate') {
      handleState({ state: request.state });
    } else if (request.action === 'lockTriggered') {
      handleState({ state: CONSTANTS.STATE.LOCKED, lockStartedAt: request.lockStartedAt });
    } else if (request.action === 'lockExpired') {
      handleState({ state: request.state });
    }
  });

  // Observe SPA Navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      checkCurrentPage();
    }
  }).observe(document.documentElement, { subtree: true, childList: true });

  window.addEventListener('popstate', checkCurrentPage);
  
  // Initial check
  checkCurrentPage();
})();
