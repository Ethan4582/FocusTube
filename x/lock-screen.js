// x/lock-screen.js
window.XLockScreen = {
  element: null,
  timerInterval: null,
  
  remove: function() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      document.body.style.overflow = '';
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  injectBase: function() {
    if (this.element) this.remove();
    this.element = document.createElement('div');
    this.element.id = 'focusx-lock-screen';
    document.documentElement.appendChild(this.element);
    document.body.style.overflow = 'hidden';
  },
  
  injectIdle: function(browseDurationMins, blockDurationMins) {
    this.injectBase();
    
    // Convert mins to hours if exactly a multiple, or keep as mins
    const blockText = blockDurationMins % 60 === 0 ? `${blockDurationMins / 60} hr` : `${blockDurationMins} min`;
    
    this.element.innerHTML = `
      <div class="fx-container">
        <div class="fx-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1DA1F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2h12v4l-6 6 6 6v4H6v-4l6-6-6-6V2z"/>
            <path d="M8 4h8v2.5l-4 4-4-4V4z" fill="#15202b" stroke="none"/>
          </svg>
        </div>
        <div class="fx-title">Timeline is locked</div>
        <div class="fx-subtitle">You can browse selected tabs for ${browseDurationMins} min before they lock for ${blockText}.<br/>Click the button below when you're ready.</div>
        
        <button id="fx-start-session" class="fx-btn-primary">Browse Timeline</button>
        
        <div class="fx-links">
          <a href="/messages" class="fx-link">DMs</a>
          <span class="fx-dot">•</span>
          <a href="/notifications" class="fx-link">Notifications</a>
          <span class="fx-dot">•</span>
          <a href="/compose/post" class="fx-link">Create post</a>
        </div>
      </div>
    `;

    document.getElementById('fx-start-session').addEventListener('click', async () => {
      await XStorage.startSession();
      if (window.focusxRecheck) window.focusxRecheck();
    });
  },

  injectLocked: function(lockStartedAt, blockDurationMs) {
    this.injectBase();
    this.element.innerHTML = `
      <div class="fx-container">
        <div class="fx-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1DA1F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="fx-title">Timeline is locked</div>
        <div class="fx-subtitle">Stay focused. Your block is active.</div>
        
        <div style="font-size: 13px; color: #8899a6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Unlocks in</div>
        <div id="fx-countdown" style="font-size: 48px; font-weight: 700; color: #1DA1F2; margin-bottom: 48px; font-variant-numeric: tabular-nums;">--:--</div>
        
        <div class="fx-links">
          <a href="/messages" class="fx-link">DMs</a>
          <span class="fx-dot">•</span>
          <a href="/notifications" class="fx-link">Notifications</a>
          <span class="fx-dot">•</span>
          <a href="/compose/post" class="fx-link">Create post</a>
        </div>
      </div>
    `;
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - lockStartedAt;
      const remaining = blockDurationMs - elapsed;
      
      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        document.getElementById('fx-countdown').textContent = "0s";
        if (window.focusxRecheck) window.focusxRecheck();
      } else {
        document.getElementById('fx-countdown').textContent = Utils.formatTime(remaining);
      }
    };
    
    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }
};
