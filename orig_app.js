/* =========================================================
   AÉROPÔLE GRAND NANCY TOMBLAINE — SPA Controller
   ========================================================= */
(function () {
    'use strict';

    const IDLE_TIMEOUT = 120000;
    let idleTimer = null;
    let currentScreen = 'screen-attract';
    let appData = null;

    // --- NAVIGATION ---
    function navigateTo(targetId) {
        if (targetId === currentScreen) return;
        
        const prev = document.getElementById(currentScreen);
        const next = document.getElementById(targetId);
        if (!next) return;

        if (prev) prev.classList.remove('active');
        next.classList.add('active');
        currentScreen = targetId;

        // Show/hide Back button based on screen
        const backBtn = document.getElementById('btn-back');
        if (backBtn) {
            backBtn.style.display = (targetId === 'screen-home' || targetId === 'screen-attract') ? 'none' : 'flex';
        }

        resetIdleTimer();
    }

    document.getElementById('btn-back')?.addEventListener('click', () => {
        navigateTo('screen-home');
    });

    document.querySelectorAll('.nav-btn, [data-target]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            if (target) navigateTo(target);
        });
    });

    function resetIdleTimer() {
45
<truncated 9097 bytes>
r:1px solid #cbd5e1;">METAR LFSA ${new Date().getUTCHours().toString().padStart(2,'0')}00Z AUTO 240${w}KT 9999 BKN040 ${t}/08 Q1012=</p>`;
        }
    }
    
    function updateFlights() {
        const details = document.getElementById('flights-details');
        if(details) {
            details.innerHTML = `
                <table style="width:100%; text-align:left; border-collapse:collapse;">
                    <tr style="border-bottom:2px solid #ccc; background:#f8fafc;"><th style="padding:15px;">Vol</th><th style="padding:15px;">Destination</th><th style="padding:15px;">Heure</th><th style="padding:15px;">Statut</th></tr>
                    <tr style="border-bottom:1px solid #eee;"><td style="padding:15px; font-weight:bold;">AF1234</td><td style="padding:15px;">Paris CDG</td><td style="padding:15px;">10:00</td><td style="padding:15px; color:green; font-weight:bold;">A l'heure</td></tr>
                    <tr style="border-bottom:1px solid #eee;"><td style="padding:15px; font-weight:bold;">U2 456</td><td style="padding:15px;">Lyon</td><td style="padding:15px;">11:30</td><td style="padding:15px; color:green; font-weight:bold;">A l'heure</td></tr>
                </table>
            `;
        }
    }

    // --- CLOCK ---
    function updateClock() {
        const now = new Date();
        document.getElementById('main-clock').innerText = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('main-date').innerText = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
    }

    // --- INIT ---
    loadData();
    setInterval(updateClock, 1000);
    setInterval(updateWeather, 600000); // 10 mins
    updateClock();
    updateWeather();
    updateFlights();

})();