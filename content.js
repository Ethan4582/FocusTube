

(function() {
  'use strict';


  let settings = {
    hideHome: false,
    hideShorts: true,
    hideRecommendations: false,
    hideComments: false,
    hideNotifications: false,
    hideSidebar: false
  };


  const styleId = 'youtube-manager-styles';
  let styleElement = null;

  function initStyles() {
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
  }

 
  function updateStyles() {
    if (!styleElement) return;

    const currentUrl = window.location.href;
    const isHomePage = /^https:\/\/www\.youtube\.com\/?(\?.*)?$/.test(currentUrl);
    const isWatchPage = /^https:\/\/www\.youtube\.com\/watch/.test(currentUrl);
    const isShortsPage = /^https:\/\/www\.youtube\.com\/shorts\//.test(currentUrl);

    let css = '';


    if (settings.hideHome && isHomePage) {
      css += '#page-manager { display: none !important; }\n';
    }


    if (settings.hideSidebar) {
      css += 'tp-yt-app-drawer#guide { display: none !important; }\n';
    }

  
    if (settings.hideNotifications) {
      css += 'yt-icon-button.ytd-notification-topbar-button-renderer#icon { display: none !important; }\n';
      css += 'ytd-notification-topbar-button-renderer { display: none !important; }\n';
    }

 
    if (settings.hideShorts && !isShortsPage) {
      css += '#contents.ytd-reel-shelf-renderer { display: none !important; }\n';
      css += 'ytd-reel-shelf-renderer { display: none !important; }\n';
    }

  
    if (settings.hideComments && isWatchPage) {
      css += 'ytd-comments#comments.ytd-watch-flexy { display: none !important; }\n';
    }

  
    if (settings.hideRecommendations && isWatchPage) {
      css += '#secondary.ytd-watch-flexy { display: none !important; }\n';
    }

    styleElement.textContent = css;
  }


  function handleShortsRedirect() {
    const currentUrl = window.location.href;
    const isShortsPage = /^https:\/\/www\.youtube\.com\/shorts\//.test(currentUrl);

    if (settings.hideShorts && isShortsPage) {
      // console.log('YouTube Manager: Redirecting from Shorts to Home');
      window.location.href = 'https://www.youtube.com/';
    }
  }


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


  function observeNavigation() {
    let lastUrl = location.href;
    
    // MutationObserver to detect URL changes
    const observer = new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        // console.log('YouTube Manager: URL changed to', currentUrl);
        debouncedUpdate();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

 
    window.addEventListener('popstate', debouncedUpdate);
    

    window.addEventListener('yt-navigate-finish', debouncedUpdate);
  }

  
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
      // console.log('YouTube Manager: Settings loaded', settings);
      handleShortsRedirect();
      updateStyles();
    });
  }


  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
      for (let key in changes) {
        if (settings.hasOwnProperty(key)) {
          settings[key] = changes[key].newValue;
          // console.log(`YouTube Manager: ${key} changed to ${changes[key].newValue}`);
        }
      }
      handleShortsRedirect();
      updateStyles();
    }
  });


  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateSettings') {
      Object.assign(settings, request.settings);
      // console.log('YouTube Manager: Settings updated from popup', settings);
      handleShortsRedirect();
      updateStyles();
    }
  });

  function init() {
    console.log('YouTube Manager: Content script initialized');
    initStyles();
    loadSettings();
    observeNavigation();
  }

 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();