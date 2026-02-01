document.addEventListener('DOMContentLoaded', function() {
  const setTimerBtn = document.getElementById('setTimerBtn');
  const timerOverlay = document.getElementById('timerOverlay');
  const closeTimerBtn = document.getElementById('closeTimerBtn');
  const applyTimerBtn = document.getElementById('applyTimerBtn');

  // Open timer overlay
  setTimerBtn.addEventListener('click', () => {
    timerOverlay.classList.add('active');
  });

  // Close timer overlay
  closeTimerBtn.addEventListener('click', () => {
    timerOverlay.classList.remove('active');
  });

  // Close on background click
  timerOverlay.addEventListener('click', (e) => {
    if (e.target === timerOverlay) {
      timerOverlay.classList.remove('active');
    }
  });

  // Apply timer (placeholder)
  applyTimerBtn.addEventListener('click', () => {
    const hours = document.getElementById('timerHours').value;
    const minutes = document.getElementById('timerMinutes').value;
    console.log(`Timer set: ${hours}h ${minutes}m`);
    timerOverlay.classList.remove('active');
  });
});