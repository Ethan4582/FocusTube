// popup.js - Handles UI interactions and saves settings to chrome.storage

document.addEventListener('DOMContentLoaded', function() {
  // console.log('Popup loaded');

  // Get all toggle checkboxes
  const hideHomeCheckbox = document.getElementById('hideHome');
  const hideShortsCheckbox = document.getElementById('hideShorts');
  const hideRecommendationsCheckbox = document.getElementById('hideRecommendations');
  const hideCommentsCheckbox = document.getElementById('hideComments');
  const hideNotificationsCheckbox = document.getElementById('hideNotifications');
  const hideSidebarCheckbox = document.getElementById('hideSidebar');

  // Timer elements
  const setTimerBtn = document.getElementById('setTimerBtn');
  const timerOverlay = document.getElementById('timerOverlay');
  const closeTimerBtn = document.getElementById('closeTimerBtn');
  const applyTimerBtn = document.getElementById('applyTimerBtn');
  const timerHoursInput = document.getElementById('timerHours');
  const timerMinutesInput = document.getElementById('timerMinutes');


  const defaultSettingBtn = document.querySelector('.btn-secondary');

  if (!hideHomeCheckbox) console.error('hideHome checkbox not found!');
  if (!hideShortsCheckbox) console.error('hideShorts checkbox not found!');

  // Load saved settings from chrome.storage.sync
  chrome.storage.sync.get({
    hideHome: false,
    hideShorts: true,
    hideRecommendations: false,
    hideComments: false,
    hideNotifications: false,
    hideSidebar: false,
    timerHours: '01',
    timerMinutes: '30'
  }, function(items) {
    // console.log('Loaded settings:', items);
    

    if (hideHomeCheckbox) hideHomeCheckbox.checked = items.hideHome;
    if (hideShortsCheckbox) hideShortsCheckbox.checked = items.hideShorts;
    if (hideRecommendationsCheckbox) hideRecommendationsCheckbox.checked = items.hideRecommendations;
    if (hideCommentsCheckbox) hideCommentsCheckbox.checked = items.hideComments;
    if (hideNotificationsCheckbox) hideNotificationsCheckbox.checked = items.hideNotifications;
    if (hideSidebarCheckbox) hideSidebarCheckbox.checked = items.hideSidebar;
    
    // Set timer values
    if (timerHoursInput) timerHoursInput.value = items.timerHours;
    if (timerMinutesInput) timerMinutesInput.value = items.timerMinutes;
  });

  // Function to save a setting and notify content script
  function saveSetting(key, value) {
    const settings = {};
    settings[key] = value;
    
    // console.log('Saving setting:', key, '=', value);
    
    // Save to chrome.storage
    chrome.storage.sync.set(settings, function() {
      console.log(`${key} saved as ${value}`);
    });

    chrome.tabs.query({url: 'https://www.youtube.com/*'}, function(tabs) {
      // console.log('Found YouTube tabs:', tabs.length);
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: settings
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Could not send message:', chrome.runtime.lastError.message);
          }
        });
      });
    });
  }

  // Add event listeners to all checkboxes
  if (hideHomeCheckbox) {
    hideHomeCheckbox.addEventListener('change', function() {
      saveSetting('hideHome', this.checked);
    });
  }

  if (hideShortsCheckbox) {
    hideShortsCheckbox.addEventListener('change', function() {
      saveSetting('hideShorts', this.checked);
    });
  }

  if (hideRecommendationsCheckbox) {
    hideRecommendationsCheckbox.addEventListener('change', function() {
      saveSetting('hideRecommendations', this.checked);
    });
  }

  if (hideCommentsCheckbox) {
    hideCommentsCheckbox.addEventListener('change', function() {
      saveSetting('hideComments', this.checked);
    });
  }

  if (hideNotificationsCheckbox) {
    hideNotificationsCheckbox.addEventListener('change', function() {
      saveSetting('hideNotifications', this.checked);
    });
  }

  if (hideSidebarCheckbox) {
    hideSidebarCheckbox.addEventListener('change', function() {
      saveSetting('hideSidebar', this.checked);
    });
  }

  // Timer overlay handlers
  if (setTimerBtn) {
    setTimerBtn.addEventListener('click', () => {
      console.log('Set timer clicked');
      if (timerOverlay) {
        timerOverlay.classList.add('active');
      }
    });
  }

  if (closeTimerBtn) {
    closeTimerBtn.addEventListener('click', () => {
      console.log('Close timer clicked');
      if (timerOverlay) {
        timerOverlay.classList.remove('active');
      }
    });
  }

  if (timerOverlay) {
    timerOverlay.addEventListener('click', (e) => {
      if (e.target === timerOverlay) {
        timerOverlay.classList.remove('active');
      }
    });
  }

  if (applyTimerBtn) {
    applyTimerBtn.addEventListener('click', () => {
      const hours = timerHoursInput ? timerHoursInput.value : '00';
      const minutes = timerMinutesInput ? timerMinutesInput.value : '30';
      
     
      
      chrome.storage.sync.set({
        timerHours: hours,
        timerMinutes: minutes
      }, function() {
        console.log(`Timer set: ${hours}h ${minutes}m`);
        if (timerOverlay) {
          timerOverlay.classList.remove('active');
        }
      });
    });
  }

  defaultSettingBtn.addEventListener('click', function() {
    // Set all toggles to false
    if (hideHomeCheckbox) hideHomeCheckbox.checked = false;
    if (hideShortsCheckbox) hideShortsCheckbox.checked = false;
    if (hideRecommendationsCheckbox) hideRecommendationsCheckbox.checked = false;
    if (hideCommentsCheckbox) hideCommentsCheckbox.checked = false;
    if (hideNotificationsCheckbox) hideNotificationsCheckbox.checked = false;
    if (hideSidebarCheckbox) hideSidebarCheckbox.checked = false;

    // Save all settings as false in chrome.storage
    chrome.storage.sync.set({
      hideHome: false,
      hideShorts: false,
      hideRecommendations: false,
      hideComments: false,
      hideNotifications: false,
      hideSidebar: false
    }, function() {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
      } else {
        // Notify content script to update
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateSettings',
              settings: {
                hideHome: false,
                hideShorts: false,
                hideRecommendations: false,
                hideComments: false,
                hideNotifications: false,
                hideSidebar: false
              }
            });
          }
        });
      }
    });
  });

  
});