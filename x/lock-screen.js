// x/lock-screen.js
const XLockScreen = {
  element: null,
  timerInterval: null,
  
  inject: function() {
    if (this.element) return;
    
    this.element = document.createElement('div');
    this.element.id = 'focusx-lock-screen';
    
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
    
    document.documentElement.appendChild(this.element);
    document.body.style.overflow = 'hidden';
  },
  
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
  
  startCountdown: function(lockStartedAt, blockDurationMs) {
    if (!this.element) this.inject();
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - lockStartedAt;
      const remaining = blockDurationMs - elapsed;
      
      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        document.getElementById('fx-countdown').textContent = "0s";
        // It will be removed by content script state sync
      } else {
        document.getElementById('fx-countdown').textContent = Utils.formatTime(remaining);
      }
    };
    
    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }
};
