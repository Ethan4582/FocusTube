// content.js - Injected into YouTube pages to manipulate DOM

(function() {
  'use strict';

  // Cache for current settings
  let settings = {
    hideHome: false,
    hideShorts: true,
    hideRecommendations: false,
    hideComments: false,
    hideNotifications: true,
    hideSidebar: false
  };

  // Create dynamic style element for hiding elements
  const styleId = 'youtube-manager-styles';
  let styleElement = null;

  // Initialize style element
  function initStyles() {
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
  }

  // Update CSS rules based on current settings and URL
  function updateStyles() {
    if (!styleElement) return;

    const currentUrl = window.location.href;
    const isHomePage = /^https:\/\/www\.youtube\.com\/?(\?.*)?$/.test(currentUrl);
    const isWatchPage = /^https:\/\/www\.youtube\.com\/watch/.test(currentUrl);
    const isShortsPage = /^https:\/\/www\.youtube\.com\/shorts\//.test(currentUrl);

    let css = '';

    // 1. Hide Home Videos (only on homepage)
    if (settings.hideHome && isHomePage) {
      css += '#page-manager { display: none !important; }\n';
    }

    // 2. Hide Sidebar (all pages)
    if (settings.hideSidebar) {
      css += 'tp-yt-app-drawer#guide { display: none !important; }\n';
    }

    // 3. Hide Notifications (all pages)
    if (settings.hideNotifications) {
      css += 'yt-icon-button.ytd-notification-topbar-button-renderer#icon { display: none !important; }\n';
      css += 'ytd-notification-topbar-button-renderer { display: none !important; }\n';
    }

    // 4. Hide Shorts Shelf (not on shorts page, not on homepage with hideHome active)
    if (settings.hideShorts && !isShortsPage) {
      css += '#contents.ytd-reel-shelf-renderer { display: none !important; }\n';
      css += 'ytd-reel-shelf-renderer { display: none !important; }\n';
    }

    // 5. Hide Comments (only on watch page)
    if (settings.hideComments && isWatchPage) {
      css += 'ytd-comments#comments.ytd-watch-flexy { display: none !important; }\n';
    }

    // 6. Hide Recommendations (only on watch page)
    if (settings.hideRecommendations && isWatchPage) {
      css += '#secondary.ytd-watch-flexy { display: none !important; }\n';
    }

    styleElement.textContent = css;
  }

  // Handle Shorts page redirect
  function handleShortsRedirect() {
    const currentUrl = window.location.href;
    const isShortsPage = /^https:\/\/www\.youtube\.com\/shorts\//.test(currentUrl);

    if (settings.hideShorts && isShortsPage) {
      console.log('YouTube Manager: Redirecting from Shorts to Home');
      window.location.href = 'https://www.youtube.com/';
    }
  }

  // Debounce function for performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Handle URL changes (YouTube is a SPA)
  const debouncedUpdate = debounce(() => {
    handleShortsRedirect();
    updateStyles();
  }, 100);

  // Listen for navigation changes in YouTube's SPA
  function observeNavigation() {
    let lastUrl = location.href;
    
    // MutationObserver to detect URL changes
    const observer = new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('YouTube Manager: URL changed to', currentUrl);
        debouncedUpdate();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also listen to popstate for back/forward navigation
    window.addEventListener('popstate', debouncedUpdate);
    
    // Listen to YouTube's custom navigation events
    window.addEventListener('yt-navigate-finish', debouncedUpdate);
  }

  // Load settings from chrome.storage
  function loadSettings() {
    chrome.storage.sync.get({
      hideHome: false,
      hideShorts: true,
      hideRecommendations: false,
      hideComments: false,
      hideNotifications: true,
      hideSidebar: false
    }, function(items) {
      settings = items;
      console.log('YouTube Manager: Settings loaded', settings);
      handleShortsRedirect();
      updateStyles();
    });
  }

  // Listen for storage changes
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
      for (let key in changes) {
        if (settings.hasOwnProperty(key)) {
          settings[key] = changes[key].newValue;
          console.log(`YouTube Manager: ${key} changed to ${changes[key].newValue}`);
        }
      }
      handleShortsRedirect();
      updateStyles();
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateSettings') {
      Object.assign(settings, request.settings);
      console.log('YouTube Manager: Settings updated from popup', settings);
      handleShortsRedirect();
      updateStyles();
    }
  });

  // Initialize everything
  function init() {
    console.log('YouTube Manager: Content script initialized');
    initStyles();
    loadSettings();
    observeNavigation();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();