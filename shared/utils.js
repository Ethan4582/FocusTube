// shared/utils.js
const Utils = {
  isBlockedPage: function(url, settings) {
    if (!settings.xEnabled) return false;
    
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== 'x.com' && parsedUrl.hostname !== 'twitter.com') return false;
      
      const path = parsedUrl.pathname.toLowerCase();
      
      if (settings.xBlockHome && (path === '/home' || path === '/')) return true;
      if (settings.xBlockExplore && path === '/explore') return true;
      if (settings.xBlockSearch && path.startsWith('/search')) return true;
      if (settings.xBlockNotifications && path === '/notifications') return true;
      
      return false;
    } catch (e) {
      return false;
    }
  },
  
  formatTime: function(milliseconds) {
    if (milliseconds <= 0) return "0s";
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  }
};
