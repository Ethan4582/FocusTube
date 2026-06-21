// background/service-worker.js

let sessionStartedAt = null;
let lockStartedAt = null;
let currentState = 'idle';

// Timer check interval (in ms)
const CHECK_INTERVAL = 1000;
let checkIntervalId = null;

chrome.runtime.onStartup.addListener(() => {
  restoreState();
});

chrome.runtime.onInstalled.addListener(() => {
  restoreState();
});

async function restoreState() {
  const data = await chrome.storage.local.get(['sessionStartedAt', 'lockStartedAt', 'state']);
  if (data.state) {
    currentState = data.state;
    sessionStartedAt = data.sessionStartedAt;
    lockStartedAt = data.lockStartedAt;
    startTimerChecks();
  }
}

async function saveState() {
  await chrome.storage.local.set({
    sessionStartedAt,
    lockStartedAt,
    state: currentState
  });
}

function startTimerChecks() {
  if (checkIntervalId) clearInterval(checkIntervalId);
  checkIntervalId = setInterval(checkTimers, CHECK_INTERVAL);
}

async function checkTimers() {
  if (currentState === 'idle') return;

  const data = await chrome.storage.local.get(['xBrowseDuration', 'xBlockDuration', 'xEnabled']);
  const browseDurationMs = (data.xBrowseDuration || 20) * 60 * 1000;
  const blockDurationMs = (data.xBlockDuration || 60) * 60 * 1000;
  const isEnabled = data.xEnabled !== false;

  if (!isEnabled) {
    currentState = 'idle';
    sessionStartedAt = null;
    lockStartedAt = null;
    await saveState();
    notifyTabs('sessionUpdate', { state: currentState });
    return;
  }

  const now = Date.now();

  if (currentState === 'browsing') {
    if (now - sessionStartedAt >= browseDurationMs) {
      // Session expired -> Transition to Locked
      currentState = 'locked';
      lockStartedAt = now;
      await saveState();
      notifyTabs('lockTriggered', { lockStartedAt, blockDurationMs });
    }
  } else if (currentState === 'locked') {
    if (now - lockStartedAt >= blockDurationMs) {
      // Lock expired -> Transition to Idle
      currentState = 'idle';
      sessionStartedAt = null;
      lockStartedAt = null;
      await saveState();
      notifyTabs('lockExpired', { state: currentState });
    }
  }
}

function notifyTabs(action, data) {
  chrome.tabs.query({ url: ["*://*.x.com/*", "*://*.twitter.com/*"] }, (tabs) => {
    for (let tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { action, ...data }).catch(() => {});
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startBrowsingSession') {
    if (currentState === 'idle') {
      currentState = 'browsing';
      sessionStartedAt = Date.now();
      saveState();
      startTimerChecks();
    }
    sendResponse({ state: currentState, sessionStartedAt, lockStartedAt });
  } else if (request.action === 'getSessionState') {
    sendResponse({ state: currentState, sessionStartedAt, lockStartedAt });
  } else if (request.action === 'xSettingsUpdated') {
    if (request.settings.xEnabled === false) {
      currentState = 'idle';
      sessionStartedAt = null;
      lockStartedAt = null;
      saveState();
      notifyTabs('sessionUpdate', { state: currentState });
    } else {
      notifyTabs('xSettingsUpdated', request.settings);
    }
    sendResponse({ success: true });
  }
  return true;
});
