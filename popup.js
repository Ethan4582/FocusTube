// popup.js - Handles UI interactions and saves settings to chrome.storage

document.addEventListener('DOMContentLoaded', function() {
  // Get all toggle elements
  const toggles = {
    hideHome: document.getElementById('hideHome'),
    hideShorts: document.getElementById('hideShorts'),
    hideRecommendations: document.getElementById('hideRecommendations'),
    hideComments: document.getElementById('hideComments'),
    hideNotifications: document.getElementById('hideNotifications'),
    hideSidebar: document.getElementById('hideSidebar')
  };

  // Timer elements
  const setTimerBtn = document.getElementById('setTimerBtn');
  const timerOverlay = document.getElementById('timerOverlay');
  const closeTimerBtn = document.getElementById('closeTimerBtn');
  const applyTimerBtn = document.getElementById('applyTimerBtn');

  // Defensive: Only proceed if all elements exist
  if (Object.values(toggles).some(el => !el) ||
      !setTimerBtn || !timerOverlay || !closeTimerBtn || !applyTimerBtn) {
    console.error('Popup: One or more elements not found in DOM.');
    return;
  }

  // Load saved settings from chrome.storage
  chrome.storage.sync.get({
    hideHome: false,
    hideShorts: true,
    hideRecommendations: false,
    hideComments: false,
    hideNotifications: false,
    hideSidebar: false
  }, function(items) {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
      return;
    }
    // Set checkbox states from storage
    toggles.hideHome.checked = items.hideHome;
    toggles.hideShorts.checked = items.hideShorts;
    toggles.hideRecommendations.checked = items.hideRecommendations;
    toggles.hideComments.checked = items.hideComments;
    toggles.hideNotifications.checked = items.hideNotifications;
    toggles.hideSidebar.checked = items.hideSidebar;
  });

  // Save settings when toggles change
  Object.keys(toggles).forEach(key => {
    toggles[key].addEventListener('change', function() {
      const settings = {};
      settings[key] = this.checked;

      // Save to chrome.storage
      chrome.storage.sync.set(settings, function() {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
        } else {
          console.log(`${key} set to ${settings[key]}`);
        }
      });

      // Send message to content script to apply changes immediately
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (chrome.runtime.lastError) {
          console.error('Tabs error:', chrome.runtime.lastError);
          return;
        }
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateSettings',
            settings: settings
          });
        }
      });
    });
  });

  // Timer overlay handlers
  setTimerBtn.addEventListener('click', () => {
    timerOverlay.classList.add('active');
  });

  closeTimerBtn.addEventListener('click', () => {
    timerOverlay.classList.remove('active');
  });

  timerOverlay.addEventListener('click', (e) => {
    if (e.target === timerOverlay) {
      timerOverlay.classList.remove('active');
    }
  });

  applyTimerBtn.addEventListener('click', () => {
    const hours = document.getElementById('timerHours').value;
    const minutes = document.getElementById('timerMinutes').value;

    chrome.storage.sync.set({
      timerHours: hours,
      timerMinutes: minutes
    }, function() {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
      } else {
        console.log(`Timer set: ${hours}h ${minutes}m`);
        timerOverlay.classList.remove('active');
      }
    });
  });
});