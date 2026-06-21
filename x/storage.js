// x/storage.js
window.XStorage = {
  getSettings: async function() {
    return new Promise((resolve) => {
      chrome.storage.local.get(CONSTANTS.DEFAULT_SETTINGS, resolve);
    });
  },
  
  getSessionState: async function() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSessionState' }, resolve);
    });
  },
  
  startSession: async function() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'startBrowsingSession' }, resolve);
    });
  }
};
