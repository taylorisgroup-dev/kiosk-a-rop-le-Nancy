/* =========================================================
   AÉROPÔLE GRAND NANCY TOMBLAINE — ULTRA PRO KIOSK ENGINE
   ========================================================= */
(function () {
    'use strict';

    // ─── CONFIG ───────────────────────────────────────────
    const IDLE_TIMEOUT = 120_000; // 2 minutes
    let idleTimer = null;
    let currentScreen = 'screen-attract';

    // ─── TRACKING ─────────────────────────────────────────
    const clickLog = [];
    window.trackClick = function (id, label) {
        const entry = { id, label, time: new Date().toISOString() };
        clickLog.push(entry);
        console.log(`[TRACK] ${label} (${id}) — Total clics: ${clickLog.length}`);
    };

    // ─── NAVIGATION ───────────────────────────────────────
    function navigateTo(targetId) {
        const prev = document.getElementById(currentScreen);
        const next = document.getElementById(targetId);
        if (!next || targetId === currentScreen) return;

        if (prev) prev.classList.remove('active');
        next.classList.add('active');
        currentScreen = targetId;
        resetIdleTimer();

        // Hide lang switch on screensaver
        const langSwitch = document.getElementById('lang-switch');
        if (langSwitch) {
            langSwitch.style.display = targetId === 'screen-attract' ? 'none' : 'flex';
        }
    }

    // ─── IDLE TIMER ───────────────────────────────────────
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        if (currentScreen !== 'screen-attract') {
            idleTimer = setTimeout(() => navigateTo('screen-attract'), IDLE_TIMEOUT);
        }
    }

    // Wake from screensaver on touch
    document.addEventListener('pointerdown', () => {
        if (currentScreen === 'screen-attract') {
            navigateTo('screen-home');
        } else {
            resetIdleTimer();
        }
    });

    // ─── BUTTON WIRING ────────────────────────────────────
    // Bento cards + Back buttons
    document.querySelectorAll('[data-target]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateTo(el.dataset.target);
        });
    });

    // Tabs
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            const parent = btn.closest('.screen');

            // Deactivate siblings
            parent.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

            // Activate
            btn.classList.add('active');
            const panel = document.getElementById(tabId);
            if (panel) panel.classList.add('active');

            trackClick(`tab-${tabId}`, `Tab: ${btn.textContent}`);
        });
    });

    // ─── CLOCK & DATE ─────────────────────────────────────
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        const clockEl = document.getElementById('main-clock');
        const dateEl = document.getElementById('main-date');
        if (clockEl) clockEl.textContent = time;
        if (dateEl) dateEl.textContent = date;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ─── LAZY LOAD BENTO CARD IMAGES ──────────────────────
    // Fade in card backgrounds after load
    document.querySelectorAll('.bento-card__bg').forEach(bg => {
        const img = new Image();
        img.onload = () => bg.classList.add('loaded');
        img.src = bg.style.backgroundImage.replace(/url\(["']?|["']?\)/g, '');
    });

    // ─── SIMULATED WEATHER UPDATES ────────────────────────
    function simulateWeather() {
        const temps = [16, 17, 18, 19, 20, 18, 17];
        const winds = [8, 10, 12, 14, 11, 9, 13];
        const conditions = ['Ciel dégagé', 'Quelques nuages', 'Partiellement nuageux', 'Ciel dégagé'];
        const qnhs = [1013, 1014, 1015, 1016, 1015];

        const i = Math.floor(Math.random() * temps.length);
        const temp = temps[i];
        const wind = winds[i % winds.length];
        const cond = conditions[i % conditions.length];
        const qnh = qnhs[i % qnhs.length];

        // Update header
        const headerTemp = document.getElementById('header-temp');
        if (headerTemp) headerTemp.textContent = `${temp}°C`;

        // Update home cards
        const homeTemp = document.getElementById('home-temp');
        const homeWind = document.getElementById('home-wind');
        if (homeTemp) homeTemp.textContent = `${temp}°C`;
        if (homeWind) homeWind.textContent = `${wind} kt`;

        // Update weather page
        const wxTemp = document.getElementById('wx-temp');
        const wxCond = document.getElementById('wx-condition');
        const wxWind = document.getElementById('wx-wind');
        const wxQnh = document.getElementById('wx-qnh');
        const wxHum = document.getElementById('wx-hum');
        if (wxTemp) wxTemp.textContent = `${temp}°`;
        if (wxCond) wxCond.textContent = cond;
        if (wxWind) wxWind.textContent = `${wind} kt NE`;
        if (wxQnh) wxQnh.textContent = qnh;
        if (wxHum) wxHum.textContent = `${55 + Math.floor(Math.random() * 15)}%`;
    }
    simulateWeather();
    setInterval(simulateWeather, 60_000); // Refresh every minute

    // ─── SET FLIGHT DATE ──────────────────────────────────
    const flightsDate = document.getElementById('flights-date');
    if (flightsDate) {
        flightsDate.textContent = new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long'
        });
    }

    // ─── INIT ─────────────────────────────────────────────
    // Hide lang switch initially (screensaver is active)
    const langSwitch = document.getElementById('lang-switch');
    if (langSwitch) langSwitch.style.display = 'none';

    resetIdleTimer();
    console.log('[AÉROPÔLE] Kiosk Engine v4.0 — Ultra Pro — Initialized');

})();
