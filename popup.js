document.addEventListener('DOMContentLoaded', function () {
    const setTimerBtn = document.getElementById('setTimerBtn');
    const timerOverlay = document.getElementById('timerOverlay');
    const closeTimerBtn = document.getElementById('closeTimerBtn');

    if (setTimerBtn && timerOverlay) {
        setTimerBtn.addEventListener('click', () => {
            timerOverlay.classList.remove('translate-y-full', 'opacity-0');
        });
    }
    if (closeTimerBtn && timerOverlay) {
        closeTimerBtn.addEventListener('click', () => {
            timerOverlay.classList.add('translate-y-full', 'opacity-0');
        });
    }
    if (timerOverlay) {
        timerOverlay.addEventListener('click', (e) => {
            if (e.target === timerOverlay) {
                timerOverlay.classList.add('translate-y-full', 'opacity-0');
            }
        });
    }
});