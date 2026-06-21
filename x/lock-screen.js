// x/lock-screen.js
const XLockScreen = {
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
  
  injectIdle: function(browseDurationMins) {
    this.injectBase();
    this.element.innerHTML = `
      <div class="fx-container">
        <div class="fx-title">Timeline Locked</div>
        <div class="fx-subtitle">Ready to browse?</div>
        
        <div class="fx-actions" style="margin-bottom: 30px;">
          <button id="fx-start-session" class="fx-btn fx-btn-primary" style="font-size: 18px; padding: 16px 32px;">Start Surfing (${browseDurationMins}m)</button>
        </div>
        
        <div class="fx-actions">
          <a href="/messages" class="fx-btn">DMs</a>
          <a href="/notifications" class="fx-btn">Notifications</a>
          <a href="/compose/post" class="fx-btn">Post</a>
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
        <div class="fx-title">Timeline Locked</div>
        <div class="fx-subtitle">Stay focused.</div>
        
        <div class="fx-timer-label">Unlocks in</div>
        <div class="fx-timer" id="fx-countdown">--:--</div>
        
        <div class="fx-actions">
          <a href="/messages" class="fx-btn">DMs</a>
          <a href="/notifications" class="fx-btn">Notifications</a>
          <a href="/compose/post" class="fx-btn fx-btn-primary">Post</a>
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
