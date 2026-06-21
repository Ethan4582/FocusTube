// popup.js - Handles UI interactions and saves settings to chrome.storage

document.addEventListener('DOMContentLoaded', function() {
  // Elements for Mode Switch
  const switchToXCheckbox = document.getElementById('switchToX');
  const switchToYTCheckbox = document.getElementById('switchToYT');
  const youtubeModeContainer = document.getElementById('youtubeMode');
  const xModeContainer = document.getElementById('xMode');

  // Helper to switch modes
  function setMode(mode) {
    if (mode === 'x') {
      youtubeModeContainer.style.display = 'none';
      xModeContainer.style.display = 'block';
      if (switchToXCheckbox) switchToXCheckbox.checked = true;
      if (switchToYTCheckbox) switchToYTCheckbox.checked = true;
    } else {
      youtubeModeContainer.style.display = 'flex';
      xModeContainer.style.display = 'none';
      if (switchToXCheckbox) switchToXCheckbox.checked = false;
      if (switchToYTCheckbox) switchToYTCheckbox.checked = false;
    }
    chrome.storage.local.set({ activeMode: mode });
  }

  // Load active mode
  chrome.storage.local.get({ activeMode: 'youtube' }, (items) => {
    setMode(items.activeMode);
  });

  if (switchToXCheckbox) switchToXCheckbox.addEventListener('change', () => setMode('x'));
  if (switchToYTCheckbox) switchToYTCheckbox.addEventListener('change', () => setMode('youtube'));

  // ==========================================
  // YOUTUBE MODE LOGIC
  // ==========================================
  const hideHomeCheckbox = document.getElementById('hideHome');
  const hideShortsCheckbox = document.getElementById('hideShorts');
  const hideRecommendationsCheckbox = document.getElementById('hideRecommendations');
  const hideCommentsCheckbox = document.getElementById('hideComments');
  const hideNotificationsCheckbox = document.getElementById('hideNotifications');
  const hideSidebarCheckbox = document.getElementById('hideSidebar');

  const setTimerBtn = document.getElementById('setTimerBtn');
  const timerOverlay = document.getElementById('timerOverlay');
  const closeTimerBtn = document.getElementById('closeTimerBtn');
  const applyTimerBtn = document.getElementById('applyTimerBtn');
  const timerHoursInput = document.getElementById('timerHours');
  const timerMinutesInput = document.getElementById('timerMinutes');
  const defaultSettingBtn = document.querySelector('.btn-secondary');

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
    if (hideHomeCheckbox) hideHomeCheckbox.checked = items.hideHome;
    if (hideShortsCheckbox) hideShortsCheckbox.checked = items.hideShorts;
    if (hideRecommendationsCheckbox) hideRecommendationsCheckbox.checked = items.hideRecommendations;
    if (hideCommentsCheckbox) hideCommentsCheckbox.checked = items.hideComments;
    if (hideNotificationsCheckbox) hideNotificationsCheckbox.checked = items.hideNotifications;
    if (hideSidebarCheckbox) hideSidebarCheckbox.checked = items.hideSidebar;
    
    if (timerHoursInput) timerHoursInput.value = items.timerHours;
    if (timerMinutesInput) timerMinutesInput.value = items.timerMinutes;
  });

  function saveYTSetting(key, value) {
    const settings = {};
    settings[key] = value;
    chrome.storage.sync.set(settings, function() {});
    chrome.tabs.query({url: 'https://www.youtube.com/*'}, function(tabs) {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'updateSettings', settings: settings }, function(response) {
          if (chrome.runtime.lastError) {}
        });
      });
    });
  }

  if (hideHomeCheckbox) hideHomeCheckbox.addEventListener('change', function() { saveYTSetting('hideHome', this.checked); });
  if (hideShortsCheckbox) hideShortsCheckbox.addEventListener('change', function() { saveYTSetting('hideShorts', this.checked); });
  if (hideRecommendationsCheckbox) hideRecommendationsCheckbox.addEventListener('change', function() { saveYTSetting('hideRecommendations', this.checked); });
  if (hideCommentsCheckbox) hideCommentsCheckbox.addEventListener('change', function() { saveYTSetting('hideComments', this.checked); });
  if (hideNotificationsCheckbox) hideNotificationsCheckbox.addEventListener('change', function() { saveYTSetting('hideNotifications', this.checked); });
  if (hideSidebarCheckbox) hideSidebarCheckbox.addEventListener('change', function() { saveYTSetting('hideSidebar', this.checked); });

  if (setTimerBtn) setTimerBtn.addEventListener('click', () => { if (timerOverlay) timerOverlay.classList.add('active'); });
  if (closeTimerBtn) closeTimerBtn.addEventListener('click', () => { if (timerOverlay) timerOverlay.classList.remove('active'); });
  if (timerOverlay) timerOverlay.addEventListener('click', (e) => { if (e.target === timerOverlay) timerOverlay.classList.remove('active'); });
  
  if (applyTimerBtn) {
    applyTimerBtn.addEventListener('click', () => {
      const hours = timerHoursInput ? timerHoursInput.value : '00';
      const minutes = timerMinutesInput ? timerMinutesInput.value : '30';
      chrome.storage.sync.set({ timerHours: hours, timerMinutes: minutes }, function() {
        if (timerOverlay) timerOverlay.classList.remove('active');
      });
    });
  }

  if (defaultSettingBtn) {
    defaultSettingBtn.addEventListener('click', function() {
      const defaults = { hideHome: false, hideShorts: false, hideRecommendations: false, hideComments: false, hideNotifications: false, hideSidebar: false };
      if (hideHomeCheckbox) hideHomeCheckbox.checked = false;
      if (hideShortsCheckbox) hideShortsCheckbox.checked = false;
      if (hideRecommendationsCheckbox) hideRecommendationsCheckbox.checked = false;
      if (hideCommentsCheckbox) hideCommentsCheckbox.checked = false;
      if (hideNotificationsCheckbox) hideNotificationsCheckbox.checked = false;
      if (hideSidebarCheckbox) hideSidebarCheckbox.checked = false;

      chrome.storage.sync.set(defaults, function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'updateSettings', settings: defaults });
          }
        });
      });
    });
  }

  // ==========================================
  // FOCUSX MODE LOGIC
  // ==========================================
  const xBrowseTime = document.getElementById('xBrowseTime');
  const displayBrowseTime = document.getElementById('displayBrowseTime');
  const xBlockTime = document.getElementById('xBlockTime');
  const displayBlockTime = document.getElementById('displayBlockTime');
  
  const xBlockHome = document.getElementById('xBlockHome');
  const xBlockExplore = document.getElementById('xBlockExplore');
  const xBlockSearch = document.getElementById('xBlockSearch');
  const xBlockNotifications = document.getElementById('xBlockNotifications');
  
  const xDisableBtn = document.getElementById('xDisableBtn');
  
  const xDefaultSettings = {
    xEnabled: true,
    xBrowseDuration: 20,
    xBlockDuration: 60,
    xBlockHome: true,
    xBlockExplore: true,
    xBlockSearch: true,
    xBlockNotifications: false
  };

  chrome.storage.local.get(xDefaultSettings, function(items) {
    if (xBrowseTime) xBrowseTime.value = items.xBrowseDuration;
    if (displayBrowseTime) displayBrowseTime.textContent = items.xBrowseDuration;
    if (xBlockTime) xBlockTime.value = items.xBlockDuration;
    if (displayBlockTime) displayBlockTime.textContent = items.xBlockDuration;

    if (xBlockHome) xBlockHome.checked = items.xBlockHome;
    if (xBlockExplore) xBlockExplore.checked = items.xBlockExplore;
    if (xBlockSearch) xBlockSearch.checked = items.xBlockSearch;
    if (xBlockNotifications) xBlockNotifications.checked = items.xBlockNotifications;
    
    updateXEnableState(items.xEnabled);
  });

  function saveXSetting(key, value) {
    const settings = {};
    settings[key] = value;
    chrome.storage.local.set(settings);
    // notify background script
    chrome.runtime.sendMessage({ action: 'xSettingsUpdated', settings: settings });
  }

  if (xBrowseTime) {
    xBrowseTime.addEventListener('change', function() {
      let val = parseInt(this.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      this.value = val;
      if (displayBrowseTime) displayBrowseTime.textContent = val;
      saveXSetting('xBrowseDuration', val);
    });
  }

  if (xBlockTime) {
    xBlockTime.addEventListener('change', function() {
      let val = parseInt(this.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      this.value = val;
      if (displayBlockTime) displayBlockTime.textContent = val;
      saveXSetting('xBlockDuration', val);
    });
  }

  if (xBlockHome) xBlockHome.addEventListener('change', function() { saveXSetting('xBlockHome', this.checked); });
  if (xBlockExplore) xBlockExplore.addEventListener('change', function() { saveXSetting('xBlockExplore', this.checked); });
  if (xBlockSearch) xBlockSearch.addEventListener('change', function() { saveXSetting('xBlockSearch', this.checked); });
  if (xBlockNotifications) xBlockNotifications.addEventListener('change', function() { saveXSetting('xBlockNotifications', this.checked); });

  let xIsEnabled = true;
  function updateXEnableState(enabled) {
    xIsEnabled = enabled;
    if (xDisableBtn) {
      const title = xDisableBtn.querySelector('.title');
      if (enabled) {
        title.textContent = 'Disable FocusX';
        title.style.color = '#1DA1F2';
      } else {
        title.textContent = 'Enable FocusX';
        title.style.color = '#8899a6';
      }
    }
  }

  if (xDisableBtn) {
    xDisableBtn.addEventListener('click', function() {
      const newState = !xIsEnabled;
      saveXSetting('xEnabled', newState);
      updateXEnableState(newState);
    });
  }
});