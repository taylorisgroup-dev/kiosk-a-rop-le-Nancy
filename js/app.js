/* ============================================
   KIOSQUE AEROPOLE — app.js
   Version finale - Optimisée Portrait 43 pouces
   ============================================ */

let attractTimer;
let cmsData = null;
let selectedDestCity = null;

let currentScreenId = 'screen-home';
let currentActiveContext = null;

// ==========================================
// STATS TRACKING
// ==========================================
function trackEvent(type, id) {
    const eid = id || type;
    if (typeof supabaseClient !== 'undefined') {
        supabaseClient.from('kiosque_clicks').insert([{ element_id: eid }]).then(({error}) => {
            if (error) console.error("Tracking error:", error);
        });
    }
}

// ==========================================
// PMR MODE & LANGUAGES
// ==========================================
let pmrActive = false;
function togglePMR() {
    pmrActive = !pmrActive;
    if(pmrActive) {
        document.body.classList.add('pmr-mode');
    } else {
        document.body.classList.remove('pmr-mode');
    }
    trackEvent('click', 'pmr_toggle');
}

document.addEventListener('languageChanged', (e) => {
    trackEvent('click', 'lang_' + e.detail);
    if(cmsData) {
        // Re-render everything with new language
        renderUI();
        
        // Deep refresh for currently open stuff
        if (currentScreenId === 'screen-list' && currentActiveContext) openCategory(currentActiveContext);
        if (currentScreenId === 'screen-entreprises') renderEntreprises();
        if (currentScreenId === 'screen-infos') openInfosPratiques();
        if (currentScreenId === 'screen-aerops') openAerops();
        
        if (document.getElementById('company-modal').style.display === 'flex' && currentActiveContext) {
            openProviderModal(currentActiveContext);
        }
        if (document.getElementById('ent-map-modal').style.display === 'flex' && currentActiveContext) {
            openEntMap(currentActiveContext);
        }
        
        if (currentScreenId === 'screen-meteo') {
            document.querySelector('#meteo-destination').previousElementSibling.innerText = ti('destination');
            document.querySelector('.btn-search').innerText = ti('search');
            if (typeof nancyWxData !== 'undefined' && nancyWxData) {
                document.getElementById('meteo-results-nancy').innerHTML = renderWeatherHtml([nancyWxData]);
            }
            if (selectedDestCity && typeof destWxData !== 'undefined' && destWxData) {
                document.getElementById('meteo-results-dest').innerHTML = renderWeatherHtml([{city: selectedDestCity, data: destWxData}]);
            }
        }
    }
});

// ==========================================
// CLOCK
// ==========================================
function updateClock() {
    const d = new Date();
    const el1 = document.getElementById('main-clock');
    const el2 = document.getElementById('main-date');
    if (el1) el1.innerText = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (el2) el2.innerText = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}
updateClock();
setInterval(updateClock, 1000);

// ==========================================
// SCREENSAVER
// ==========================================
function resetAttractTimer() {
    clearTimeout(attractTimer);
    attractTimer = setTimeout(() => {
        showScreen('screen-attract');
        closeModal();
        closeEntMap();
    }, 120000);
}

['pointerdown', 'mousedown', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetAttractTimer, { passive: true });
});

function closeScreensaver() {
    trackEvent('session');
    showScreen('screen-home');
    resetAttractTimer();
}

// ==========================================
// SCREEN NAVIGATION
// ==========================================
function showScreen(screenId) {
    if (screenId === 'screen-attract') {
        document.getElementById('screen-attract').classList.add('active');
    } else {
        document.getElementById('screen-attract').classList.remove('active');
        document.querySelectorAll('.screens-wrap .screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        currentScreenId = screenId;
    }
}

function goHome() {
    currentActiveContext = null;
    showScreen('screen-home');
    closeModal();
    closeEntMap();
    resetAttractTimer();
}

// ==========================================
// HOME GRID
// ==========================================
function renderCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;
    grid.innerHTML = '';
    cmsData.categories.forEach(cat => {
        if (cat.id === 'locations') return; // Remove car rental tile
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => openCategory(cat);
        let imgSrc = cat.image;
        if (cat.id === 'meteo') imgSrc = 'assets/tile_meteo_realistic_1781179203220.png';
        if (cat.id === 'plan') imgSrc = 'assets/tile_plan_realistic_1781179215979.png';
        if (cat.id === 'infos') imgSrc = 'assets/tile_infos_realistic_1781179228389.png';
        if (cat.id === 'entreprises') imgSrc = 'assets/tile_entreprises_realistic_1781179239076.png';
        if (cat.id === 'hotel') imgSrc = 'assets/tile_hotel_realistic_1781179250952.png';
        if (cat.id === 'restaurant') imgSrc = 'assets/tile_restaurant_realistic_1781179263055.png';
        if (cat.id === 'taxi') imgSrc = 'assets/tile_taxi_realistic_1781179273457.png';
        div.innerHTML = `
            <div class="card-bg" style="background-image:url('${imgSrc}');"></div>
            <div class="card-gradient"></div>
            <div class="card-title">${t(cat.name)}</div>
        `;
        grid.appendChild(div);
    });
}

function openCategory(cat) {
    trackEvent('click', 'cat_' + cat.id);

    if (cat.special === 'meteo') { showScreen('screen-meteo'); resetAttractTimer(); return; }
    if (cat.special === 'aerops') { openAerops(); return; }
    if (cat.special === 'plan') { openFullPlan(); return; }
    if (cat.id === 'infos') { openInfosPratiques(); return; }

    if (cat.id === 'entreprises') {
        renderEntreprises();
        showScreen('screen-entreprises');
        resetAttractTimer();
        return;
    }

    currentActiveContext = cat;
    showScreen('screen-list');
    document.getElementById('list-title').innerText = t(cat.name);
    const grid = document.getElementById('providers-grid');
    grid.innerHTML = '';

    const providers = cmsData.providers.filter(p => p.categoryId === cat.id);
    if (providers.length === 0) {
        grid.innerHTML = `<p style="color:#94a3b8;text-align:center;grid-column:1/-1;font-size:1.6rem;padding:60px;">${ti('no_provider')}</p>`;
        return;
    }

    providers.forEach(prov => {
        const div = document.createElement('div');
        div.className = 'card';
        div.onclick = () => openProviderModal(prov);
        div.innerHTML = `
            <div class="card-bg" style="background-image:url('${prov.image}');"></div>
            <div class="card-gradient"></div>
            <div class="card-title">${prov.name}</div>
        `;
        grid.appendChild(div);
    });
    resetAttractTimer();
}

// ==========================================
// ENTERPRISES LIST
// ==========================================
function renderEntreprises() {
    const list = document.getElementById('ent-list');
    list.innerHTML = '';
    const providers = cmsData.providers.filter(p => p.categoryId === 'entreprises');
    
    // Sort numerically by pin, then alphabetical
    providers.sort((a,b) => {
        const na = parseInt(a.mapData?.pinNum) || 999;
        const nb = parseInt(b.mapData?.pinNum) || 999;
        if (na !== nb) return na - nb;
        return a.name.localeCompare(b.name);
    });

    providers.forEach(prov => {
        const card = document.createElement('div');
        card.className = 'ent-card';
        card.onclick = () => openEntMap(prov);
        
        let badgeHtml = '';
        if (prov.mapData && prov.mapData.color) {
            const ROAD_INFO = cmsData.mapConfig?.paths || {};
            const roadName = ROAD_INFO[prov.mapData.color]?.name || '';
            badgeHtml = `<span class="ent-card-badge ${prov.mapData.color}">${prov.mapData.pinNum} — ${roadName}</span>`;
        }
        
        card.innerHTML = `
            <img src="${prov.image || 'assets/logo_aeropole.jpg'}" class="ent-card-logo" alt="${prov.name}" onerror="this.src='assets/logo_aeropole.jpg'">
            <div class="ent-card-info">
                <div class="ent-card-name">${prov.name}</div>
                <div class="ent-card-desc">${t(prov.description) || ''}</div>
            </div>
            ${badgeHtml}
        `;
        list.appendChild(card);
    });
}

// ==========================================
// MARQUEE BANNER
// ==========================================
function renderMarquee() {
    const track = document.getElementById('marquee-track');
    if (!track) return;
    track.innerHTML = '';
    
    // Include ALL providers (hotels, restaurants, taxis, entreprises)
    const partners = cmsData.providers.filter(p => 
        p.categoryId === 'entreprises' || 
        p.categoryId === 'hotel' || 
        p.categoryId === 'restaurant' || 
        p.categoryId === 'taxi'
    );
    
    if (partners.length === 0) {
        document.getElementById('marquee-banner').style.display = 'none';
        return;
    }
    
    let html = '';
    partners.forEach(p => {
        const img = p.image || 'assets/logo_aeropole.jpg';
        html += `<div class="marquee-item"><img src="${img}" onerror="this.src='assets/logo_aeropole.jpg'"> <span>${p.name.fr || p.name}</span></div>`;
    });
    
    track.innerHTML = html + html + html;
}

// ==========================================
// MAP & COORDINATES (Base 1000x1000 relative to image size)
// ==========================================
const MAP_SCALE = 10; // Convert 0-1000 mapping to % (1000 / 10 = 100%)

function getVeiHtml() {
    if(!cmsData || !cmsData.mapConfig) return '';
    const kPos = cmsData.mapConfig.kioskPos || {x:500,y:500};
    return `<div class="vous-etes-ici" style="left:${kPos.x/MAP_SCALE}%; top:${kPos.y/MAP_SCALE}%">
        <div class="vei-label">${ti('you_are_here')}</div>
        <svg viewBox="0 0 24 24" fill="#dc2626" stroke="white" stroke-width="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    </div>`;
}

function openFullPlan() {
    trackEvent('click', 'full_plan');
    
    const tbody = document.getElementById('plan-table-body');
    if(tbody) {
        tbody.innerHTML = '';
        const partners = cmsData.providers.filter(p => p.categoryId === 'entreprises' && p.mapData);
        
        // Sort numerically by pin, then alphabetical
        partners.sort((a,b) => {
            const na = parseInt(a.mapData?.pinNum) || 999;
            const nb = parseInt(b.mapData?.pinNum) || 999;
            if (na !== nb) return na - nb;
            return a.name.localeCompare(b.name);
        });
        
        const ROAD_INFO = cmsData.mapConfig?.paths || {};
        
        partners.forEach(p => {
            const tr = document.createElement('tr');
            const color = p.mapData?.color;
            const roadHex = ROAD_INFO[color]?.hex || '#64748b';
            tr.innerHTML = `
                <td><span class="num-badge" style="background-color: ${roadHex}">${p.mapData.pinNum}</span></td>
                <td style="font-weight: 700; font-size: 1.4rem;">${p.name}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    showScreen('screen-plan');
    resetAttractTimer();
}

function openEntMap(prov) {
    currentActiveContext = prov;
    trackEvent('click', 'ent_map_' + prov.id);
    
    document.getElementById('ent-modal-name').innerText = prov.name;
    document.getElementById('ent-modal-desc').innerText = t(prov.description) || '';
    
    const logoEl = document.getElementById('ent-modal-logo');
    logoEl.style.backgroundImage = `url('${prov.image || 'assets/logo_aeropole.jpg'}')`;
    
    const mapImg = document.querySelector('#ent-map-modal .map-img');
    if (mapImg && cmsData.mapConfig?.imageUrl) {
        mapImg.src = cmsData.mapConfig.imageUrl;
    }
    
    const badge = document.getElementById('ent-modal-badge');
    const pathEl = document.getElementById('ent-dynamic-path');
    const pinsContainer = document.getElementById('ent-map-pins');

    // Make sure SVG scales exactly 0-1000 mapping to 100% width/height
    const svg = document.getElementById('ent-map-svg');
    svg.setAttribute('viewBox', '0 0 1000 1000');
    svg.setAttribute('preserveAspectRatio', 'none');

    pinsContainer.innerHTML = getVeiHtml();
    const ROAD_INFO = cmsData.mapConfig?.paths || {};

    if (prov.mapData) {
        const road = ROAD_INFO[prov.mapData.color];
        if (road) {
            badge.innerText = `${prov.mapData.pinNum} — ${road.name}`;
            badge.className = 'map-company-badge ' + prov.mapData.color;
            badge.style.display = 'block';
            
            pathEl.style.animation = 'none';
            pathEl.offsetHeight;
            pathEl.setAttribute('stroke', road.hex);
            pathEl.setAttribute('d', road.d || '');
            pathEl.style.animation = 'drawPath 2s ease-out forwards, pulsePath 2s infinite 2s';

            let px = parseInt(prov.mapData.x);
            let py = parseInt(prov.mapData.y);

            if(!isNaN(px) && !isNaN(py)) {
                const pin = document.createElement('div');
                pin.className = 'map-pin';
                pin.style.left = (px / MAP_SCALE) + '%';
                pin.style.top = (py / MAP_SCALE) + '%';
                pin.innerHTML = `<div class="pin-number" style="border-color:${road.hex};color:${road.hex};">${prov.mapData.pinNum}</div><svg width="45" height="45" viewBox="0 0 24 24" fill="${road.hex}" stroke="white" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
                pinsContainer.appendChild(pin);
            }
        }
    } else {
        badge.style.display = 'none';
        pathEl.setAttribute('d', '');
    }
    
    document.getElementById('ent-map-modal').style.display = 'flex';
    resetAttractTimer();
}

function closeEntMap() {
    document.getElementById('ent-map-modal').style.display = 'none';
}

// ==========================================
// PROVIDER MODAL
// ==========================================
function openProviderModal(prov) {
    currentActiveContext = prov;
    trackEvent('click', 'prov_' + prov.id);

    document.getElementById('modal-image').src = prov.image;
    document.getElementById('modal-title').innerText = prov.name;
    document.getElementById('modal-desc').innerText = t(prov.description) || '';
    document.getElementById('modal-contact').innerText = t(prov.contact) || '';

    const qrContainer = document.getElementById('modal-qrcode');
    const qrSection = document.getElementById('qr-section');
    qrContainer.innerHTML = '';

    if (prov.qrUrl) {
        qrSection.style.display = 'flex';
        new QRCode(qrContainer, { text: prov.qrUrl, width: 220, height: 220, colorDark: "#0f172a", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
    } else {
        qrSection.style.display = 'none';
    }

    document.getElementById('company-modal').style.display = 'flex';
    resetAttractTimer();
}

function closeModal() {
    document.getElementById('company-modal').style.display = 'none';
}

// ==========================================
// AEROPS
// ==========================================
function openAerops() {
    if (cmsData.aerops) {
        const a = cmsData.aerops;
        const titleEl = document.getElementById('aerops-page-title');
        if (titleEl) titleEl.innerText = t(a.title) || 'Aerops';
        const h = document.getElementById('aerops-headline');
        if (h) h.innerText = t(a.headline) || '';
        const d = document.getElementById('aerops-desc');
        if (d) d.innerText = t(a.description) || '';
        
        // Ensure the big logo uses the image defined in admin panel if present
        const logo = document.querySelector('.aerops-logo-big');
        if (logo && a.image) {
            logo.src = a.image;
        }
    }
    showScreen('screen-aerops');
    resetAttractTimer();
}

// ==========================================
// MÉTÉO — Open-Meteo API
// ==========================================
const WMO_CODES = {
    0: { icon: "\u2600\ufe0f", desc: "Ciel clair" },
    1: { icon: "\ud83c\udf24\ufe0f", desc: "Peu nuageux" },
    2: { icon: "\u26c5", desc: "Partiellement nuageux" },
    3: { icon: "\u2601\ufe0f", desc: "Couvert" },
    45: { icon: "\ud83c\udf2b\ufe0f", desc: "Brouillard" },
    48: { icon: "\ud83c\udf2b\ufe0f", desc: "Brouillard givrant" },
    51: { icon: "\ud83c\udf26\ufe0f", desc: "Bruine légère" },
    53: { icon: "\ud83c\udf26\ufe0f", desc: "Bruine" },
    55: { icon: "\ud83c\udf26\ufe0f", desc: "Bruine forte" },
    61: { icon: "\ud83c\udf27\ufe0f", desc: "Pluie légère" },
    63: { icon: "\ud83c\udf27\ufe0f", desc: "Pluie" },
    65: { icon: "\ud83c\udf27\ufe0f", desc: "Forte pluie" },
    71: { icon: "\u2744\ufe0f", desc: "Neige légère" },
    73: { icon: "\u2744\ufe0f", desc: "Neige" },
    75: { icon: "\u2744\ufe0f", desc: "Forte neige" },
    77: { icon: "\u2744\ufe0f", desc: "Grains de neige" },
    80: { icon: "\ud83c\udf26\ufe0f", desc: "Averses légères" },
    81: { icon: "\ud83c\udf27\ufe0f", desc: "Averses" },
    82: { icon: "\ud83c\udf27\ufe0f", desc: "Fortes averses" },
    85: { icon: "\ud83c\udf28\ufe0f", desc: "Averses de neige" },
    86: { icon: "\ud83c\udf28\ufe0f", desc: "Fortes averses neige" },
    95: { icon: "\u26c8\ufe0f", desc: "Orage" },
    96: { icon: "\u26c8\ufe0f", desc: "Orage grêle" },
    99: { icon: "\u26c8\ufe0f", desc: "Orage violent" }
};

function getWMO(c) { return WMO_CODES[c] || { icon: "\u2601\ufe0f", desc: "Inconnu" }; }
function windDir(deg) { const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO']; return dirs[Math.round(deg/22.5)%16]; }
function dewPoint(t, rh) { return (t - ((100 - rh) / 5)).toFixed(1); }

function flightRules(vis, cloud) {
    if (vis < 1600 || cloud > 95) return { cat: 'LIFR', cls: 'wx-lifr', label: 'LIFR — Low IFR' };
    if (vis < 5000 || cloud > 87) return { cat: 'IFR', cls: 'wx-ifr', label: 'IFR — Instruments' };
    if (vis < 8000 || cloud > 75) return { cat: 'MVFR', cls: 'wx-mvfr', label: 'MVFR — Marginal' };
    return { cat: 'VFR', cls: 'wx-vfr', label: 'VFR — Vue' };
}

let searchDebounce = null;
let nancyWxData = null;
let destWxData = null;

function fetchNancyWeather() {
    const aeropoleCity = { name: "Aéropôle (Nancy)", lat: 48.692054, lon: 6.184417 };
    fetchWeather(aeropoleCity).then(res => {
        if(res) {
            nancyWxData = res;
            const c = res.data.current;
            const wmo = getWMO(c.weather_code);
            const hw = document.getElementById('header-weather');
            if(hw) hw.innerHTML = `<span class="wx-icon">${wmo.icon}</span> <span>${Math.round(c.temperature_2m)}\u00b0C</span>`;
            
            const nancyContainer = document.getElementById('meteo-results-nancy');
            if(nancyContainer) nancyContainer.innerHTML = renderWeatherHtml([nancyWxData]);
        }
    });
}

// Expose click function for the header widget to open Meteo directly
window.openMeteo = () => {
    showScreen('screen-meteo');
    resetAttractTimer();
};

function setupMeteoInputs() {
    const dest = document.getElementById('meteo-destination');
    if (!dest) return;

    dest.addEventListener('input', () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => geocodeCity(dest.value), 300);
    });
    dest.addEventListener('focus', () => { 
        if (dest.value.length >= 2) geocodeCity(dest.value); 
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.meteo-field')) document.querySelectorAll('.meteo-suggestions').forEach(s => s.classList.remove('show'));
    });
}

function geocodeCity(query) {
    const sugContainerId = 'suggestions-dest';
    if (query.length < 2) { document.getElementById(sugContainerId).classList.remove('show'); return; }
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=fr&format=json`)
        .then(r => r.json())
        .then(data => {
            const container = document.getElementById(sugContainerId);
            container.innerHTML = '';
            if (!data.results || data.results.length === 0) { container.classList.remove('show'); return; }
            data.results.forEach(r => {
                const div = document.createElement('div');
                div.className = 'meteo-suggestion';
                div.innerText = `${r.name}${r.admin1 ? ', ' + r.admin1 : ''} (${r.country || ''})`;
                div.onclick = () => {
                    selectedDestCity = { name: r.name, lat: r.latitude, lon: r.longitude, country: r.country, admin: r.admin1 };
                    document.getElementById('meteo-destination').value = r.name;
                    container.classList.remove('show');
                };
                container.appendChild(div);
            });
            container.classList.add('show');
        }).catch(()=>{});
}

function searchDestWeather() {
    trackEvent('click', 'meteo_search');
    const destVal = document.getElementById('meteo-destination').value.trim();

    if (!destVal) return;

    const results = document.getElementById('meteo-results-dest');
    results.innerHTML = '<div class="empty-state"><p>Chargement en cours...</p></div>';

    let promise = Promise.resolve();
    if (!selectedDestCity || selectedDestCity.name !== destVal) {
        promise = fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destVal)}&count=1&language=fr`)
            .then(r=>r.json()).then(d=>{if(d.results&&d.results[0]) selectedDestCity={name:d.results[0].name,lat:d.results[0].latitude,lon:d.results[0].longitude};});
    }

    promise.then(() => {
        if (!selectedDestCity) {
            results.innerHTML = '<div class="empty-state"><p>Ville introuvable.</p></div>';
            return;
        }

        fetchWeather(selectedDestCity).then(wx => {
            if(wx) {
                destWxData = wx.data;
                results.innerHTML = renderWeatherHtml([{city: selectedDestCity, data: destWxData}]);
            } else {
                results.innerHTML = '<div class="empty-state"><p>Erreur météo.</p></div>';
            }
        });
    });
}

function fetchWeather(city) {
    const params = `latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&hourly=temperature_2m,visibility,wind_speed_10m,weather_code&daily=sunrise,sunset&timezone=Europe/Paris&forecast_days=2`;
    return fetch(`https://api.open-meteo.com/v1/forecast?${params}`).then(r=>r.json()).then(data=>({city,data})).catch(()=>null);
}

function renderWeatherHtml(wxResults) {
    if(!wxResults || wxResults.length === 0) return '';
    let html = `<div class="meteo-columns">`; // Always stacked in portrait

    wxResults.forEach(({ city, data }) => {
        const c = data.current;
        const wmo = getWMO(c.weather_code);
        const dp = dewPoint(c.temperature_2m, c.relative_humidity_2m);
        const qnh = c.pressure_msl.toFixed(0);

        const nowISO = new Date().toISOString().slice(0, 13);
        let hIdx = 0;
        if(data.hourly?.time) { for(let i=0; i<data.hourly.time.length; i++) { if(data.hourly.time[i].slice(0,13) >= nowISO) { hIdx=i; break; } } }

        const vis = data.hourly?.visibility ? data.hourly.visibility[hIdx] : 10000;
        const fr = flightRules(vis, c.cloud_cover);

        html += `<div class="wx-card">
            <h3>${city.name}</h3>
            <div class="wx-location">Lat ${city.lat.toFixed(2)} / Lon ${city.lon.toFixed(2)}</div>
            <span class="wx-flight-rules ${fr.cls}">${fr.label}</span>
            <div class="wx-main">
                <div class="wx-temp">${Math.round(c.temperature_2m)}\u00b0</div>
                <div><div class="wx-icon">${wmo.icon}</div><div class="wx-desc">${wmo.desc}</div></div>
            </div>
            <div class="wx-grid">
                <div class="wx-metric"><div class="label">${ti('wind')}</div><div class="value">${Math.round(c.wind_speed_10m)}</div><div class="unit">km/h ${windDir(c.wind_direction_10m)}</div></div>
                <div class="wx-metric"><div class="label">${ti('gusts')}</div><div class="value">${Math.round(c.wind_gusts_10m)}</div><div class="unit">km/h</div></div>
                <div class="wx-metric"><div class="label">QNH</div><div class="value">${qnh}</div><div class="unit">hPa</div></div>
                <div class="wx-metric"><div class="label">${ti('dew_point')}</div><div class="value">${dp}\u00b0</div><div class="unit">Spread ${(c.temperature_2m - dp).toFixed(1)}\u00b0</div></div>
                <div class="wx-metric"><div class="label">${ti('visibility')}</div><div class="value">${(vis/1000).toFixed(0)}</div><div class="unit">km</div></div>
                <div class="wx-metric"><div class="label">${ti('cloudiness')}</div><div class="value">${c.cloud_cover}</div><div class="unit">%</div></div>
            </div>`;
            
        if(data.hourly) {
            html += `<div class="wx-forecast"><h3>${ti('forecast')}</h3><div class="forecast-timeline">`;
            for(let i=hIdx; i<Math.min(hIdx+12, data.hourly.time.length); i++) {
                const hw = getWMO(data.hourly.weather_code[i]);
                html += `<div class="forecast-hour">
                    <div class="fh-time">${data.hourly.time[i].slice(11,16)}</div>
                    <div class="fh-icon">${hw.icon}</div>
                    <div class="fh-temp">${Math.round(data.hourly.temperature_2m[i])}\u00b0</div>
                    <div class="fh-wind">${Math.round(data.hourly.wind_speed_10m[i])} km/h</div>
                </div>`;
            }
            html += `</div></div>`;
        }
        html += `</div>`;
    });
    return html + `</div>`;
}

// ==========================================
// INFOS PRATIQUES
// ==========================================
function openInfosPratiques() {
    if (cmsData.infosPratiques) {
        const a = cmsData.infosPratiques;
        const t_el = document.getElementById('infos-page-title');
        if (t_el) t_el.innerText = t(a.title) || 'Infos Pratiques';
        const h = document.getElementById('infos-headline');
        if (h) h.innerText = t(a.headline) || '';
        const d = document.getElementById('infos-desc');
        if (d) d.innerText = t(a.description) || '';
        const img = document.getElementById('infos-hero-img');
        if (img && a.image) img.src = a.image;
    }
    showScreen('screen-infos');
    resetAttractTimer();
}

// ==========================================
// RENDER UI (For full redraws on lang change)
// ==========================================
function renderUI() {
    const data = cmsData;
    if(!data) return;
    
    // Fallbacks for empty database
    if(!data.general) data.general = {};
    if(!data.screensaver) data.screensaver = {};
    if(!data.categories) data.categories = [];
    if(!data.providers) data.providers = [];
    if(!data.aerops) data.aerops = {};
    if(!data.infosPratiques) data.infosPratiques = {};
    if(!data.mapConfig) data.mapConfig = { kioskPos: {}, paths: {} };

    const t1 = document.getElementById('ui-title');
    const t2 = document.getElementById('ui-subtitle');
    if(t1) t1.innerText = t(data.general.title);
    if(t2) t2.innerText = t(data.general.subtitle);

    if(data.screensaver) {
        const at = document.getElementById('attract-title');
        const as = document.getElementById('attract-subtitle');
        if(at) at.innerText = t(data.screensaver.title);
        if(as) as.innerText = t(data.screensaver.subtitle);
    }

    renderCategories();
    renderMarquee();
    
    const destLabel = document.querySelector('#meteo-destination');
    if (destLabel && destLabel.previousElementSibling) {
        destLabel.previousElementSibling.innerText = ti('destination');
    }
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) {
        searchBtn.innerText = ti('search');
    }
}

// ==========================================
// INIT
// ==========================================
function initApp() {
    const DEFAULT_DATA = {"general": {"title": {"fr": "A\u00e9rop\u00f4le Grand Nancy", "en": "Grand Nancy Aeropole"}, "subtitle": {"fr": "Bienvenue sur l'espace d'informations", "en": "Welcome to the information space"}}, "screensaver": {"title": {"fr": "Touchez l'\u00e9cran pour commencer", "en": "Touch the screen to start"}, "subtitle": {"fr": "A\u00e9rop\u00f4le du Grand Nancy", "en": "Grand Nancy Aeropole"}}, "media": {"topVideoUrl": "https://www.youtube.com/watch?v=z8XqQ-fC4g8"}, "categories": [{"id": "meteo", "name": {"fr": "M\u00e9t\u00e9o", "en": "Weather"}, "image": "meteo_tile_1781130694875.png", "special": "meteo"}, {"id": "aerops", "name": {"fr": "AeroPS", "en": "AeroPS"}, "image": "assets/logo_aerops.png", "special": "aerops"}, {"id": "plan", "name": {"fr": "Plan interactif", "en": "Interactive Map"}, "image": "tile_map_1781167893062.png", "special": "plan"}, {"id": "infos", "name": {"fr": "Infos Pratiques", "en": "Practical Info"}, "image": "tile_infos_1781167902885.png", "special": "infos"}, {"id": "entreprises", "name": {"fr": "Entreprises", "en": "Companies"}, "image": "tile_entreprises_1781167911260.png"}, {"id": "hotel", "name": {"fr": "H\u00f4tels", "en": "Hotels"}, "image": "hotel_novotel_1781129239371.png"}, {"id": "restaurant", "name": {"fr": "Restaurants", "en": "Restaurants"}, "image": "tile_restaurant_1781167920958.png"}, {"id": "taxi", "name": {"fr": "Taxis", "en": "Taxis"}, "image": "tile_taxi_1781167930898.png"}], "providers": [{"id": "h1", "categoryId": "hotel", "name": {"fr": "Novotel", "en": "Novotel"}, "description": {"fr": "Profitez d'un confort optimal avec nos chambres spacieuses, notre piscine ext\u00e9rieure et notre centre de fitness.", "en": "Enjoy optimal comfort with spacious rooms, outdoor pool, and fitness center."}, "image": "assets/hotel_novotel.png", "phone": "03 83 XX XX 01", "address": "Route de l'A\u00e9roport", "qrUrl": "https://all.accor.com/hotel/novotel"}, {"id": "h2", "categoryId": "hotel", "name": {"fr": "Ibis Styles", "en": "Ibis Styles"}, "description": {"fr": "Design contemporain et ambiance conviviale. Le petit-d\u00e9jeuner et le Wi-Fi sont inclus.", "en": "Contemporary design and friendly atmosphere. Breakfast and Wi-Fi included."}, "image": "assets/hotel_ibis_styles.png", "phone": "03 83 XX XX 02", "address": "Route de l'A\u00e9roport", "qrUrl": "https://all.accor.com/hotel/ibis"}, {"id": "h3", "categoryId": "hotel", "name": {"fr": "Mercure", "en": "Mercure"}, "description": {"fr": "Un \u00e9tablissement haut de gamme id\u00e9al pour vos s\u00e9jours d'affaires avec salles de r\u00e9union.", "en": "A premium hotel ideal for business stays with meeting rooms."}, "image": "assets/hotel_mercure.png", "phone": "03 83 XX XX 03", "address": "Route de l'A\u00e9roport", "qrUrl": "https://all.accor.com/hotel/mercure"}, {"id": "h4", "categoryId": "hotel", "name": {"fr": "Kyriad", "en": "Kyriad"}, "description": {"fr": "Chambres confortables et \u00e9quip\u00e9es avec un restaurant traditionnel sur place.", "en": "Comfortable, well-equipped rooms with an on-site traditional restaurant."}, "image": "assets/hotel_kyriad.png", "phone": "03 83 XX XX 04", "address": "Avenue des Pilotes", "qrUrl": "https://kyriad.com"}, {"id": "h5", "categoryId": "hotel", "name": {"fr": "Best Western", "en": "Best Western"}, "description": {"fr": "Charme et \u00e9l\u00e9gance au c\u0153ur de l'a\u00e9rop\u00f4le. Service en chambre 24/7.", "en": "Charm and elegance in the heart of the aeropole. 24/7 room service."}, "image": "assets/hotel_best_western.png", "phone": "03 83 XX XX 05", "address": "Avenue des Pilotes", "qrUrl": "https://bestwestern.com"}, {"id": "r1", "categoryId": "restaurant", "name": {"fr": "La Brasserie de l'Aviation", "en": "Aviation Brasserie"}, "description": {"fr": "D\u00e9guste nos sp\u00e9cialit\u00e9s r\u00e9gionales tout en profitant d'une vue imprenable sur les pistes de d\u00e9collage.", "en": "Taste regional specialties while enjoying a breathtaking view of the runways."}, "image": "assets/restaurant_nancy.png", "phone": "03 83 XX XX 11", "address": "Terminal", "qrUrl": "https://google.com/maps"}, {"id": "r2", "categoryId": "restaurant", "name": {"fr": "Le Comptoir Rapide", "en": "Fast Counter"}, "description": {"fr": "Id\u00e9al pour un repas sur le pouce avant votre vol : sandwichs, salades et boissons chaudes.", "en": "Ideal for a quick meal before your flight: sandwiches, salads, and hot drinks."}, "image": "assets/restaurant_nancy.png", "phone": "03 83 XX XX 12", "address": "Terminal", "qrUrl": "https://google.com/maps"}, {"id": "t1", "categoryId": "taxi", "name": {"fr": "Taxi Nancy Confort", "en": "Nancy Comfort Taxi"}, "description": {"fr": "Service de taxi rapide et s\u00e9curis\u00e9 disponible 24/7 pour vos d\u00e9placements r\u00e9gionaux.", "en": "Fast and secure taxi service available 24/7 for regional travel."}, "image": "assets/vtc_luxury.png", "phone": "03 83 XX XX 21", "address": "Station de taxis du Terminal", "qrUrl": "https://google.com/maps"}, {"id": "t2", "categoryId": "taxi", "name": {"fr": "G7 A\u00e9roport", "en": "G7 Airport"}, "description": {"fr": "R\u00e9servez votre course avec notre flotte de v\u00e9hicules hybrides haut de gamme.", "en": "Book your ride with our fleet of premium hybrid vehicles."}, "image": "assets/vtc_luxury.png", "phone": "03 83 XX XX 22", "address": "Station de taxis du Terminal", "qrUrl": "https://google.com/maps"}, {"id": "t3", "categoryId": "taxi", "name": {"fr": "VTC Premium Elite", "en": "VTC Premium Elite"}, "description": {"fr": "Voyagez en premi\u00e8re classe avec nos chauffeurs priv\u00e9s. Bouteilles d'eau et Wi-Fi inclus.", "en": "Travel first class with our private chauffeurs. Bottled water and Wi-Fi included."}, "image": "assets/vtc_luxury.png", "phone": "03 83 XX XX 23", "address": "Sur r\u00e9servation", "qrUrl": "https://google.com/maps"}], "aerops": {"title": {"fr": "Payer vos taxes", "en": "Pay fees"}, "headline": {"fr": "AeroPS", "en": "AeroPS"}, "description": {"fr": "Scannez le QR code via l'application AeroPS pour payer vos taxes d'atterrissage facilement.", "en": "Scan QR code with AeroPS app to easily pay landing fees."}, "qrUrl": "https://aerops.com", "image": "assets/aerops_qr.jpg"}, "infosPratiques": {"title": {"fr": "Infos Pratiques", "en": "Practical Info"}, "headline": {"fr": "Horaires et Acc\u00e8s", "en": "Hours and Access"}, "description": {"fr": "Ouvert tous les jours de 8h \u00e0 20h. L'a\u00e9rodrome propose un ensemble de services professionnels.", "en": "Open daily from 8am to 8pm. The aerodrome offers professional services."}, "image": "tile_infos_1781167902885.png"}, "mapConfig": {"kioskPos": {"x": 580, "y": 730}, "imageUrl": "media__1781129951804.jpg", "paths": {"red": {"name": "", "hex": "#ef4444", "d": ""}}}};

    if (typeof supabaseClient === 'undefined') {
        console.error("Supabase not loaded");
        return;
    }
    supabaseClient.from('kiosque_config').select('data').eq('id', 1).single()
        .then(({ data, error }) => {
            if (error) throw error;
            cmsData = data.data || {};
            if (Object.keys(cmsData).length === 0) {
                cmsData = DEFAULT_DATA;
            }
            
            if(cmsData.media && cmsData.media.topVideoUrl) {
                const container = document.getElementById('video-banner-container');
                if (container) {
                    const url = cmsData.media.topVideoUrl;
                    // Check if YouTube
                    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                    if (ytMatch && ytMatch[1]) {
                        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&showinfo=0&rel=0&modestbranding=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
                    } else {
                        container.innerHTML = `<video src="${url}" autoplay loop muted playsinline></video>`;
                    }
                }
            }

            renderUI();
            setupMeteoInputs();
            fetchNancyWeather();
            resetAttractTimer();
        })
        .catch(err => {
            console.error("Could not load config from Supabase", err);
            cmsData = DEFAULT_DATA;
            renderUI();
            setupMeteoInputs();
            fetchNancyWeather();
            resetAttractTimer();
        });
}

initApp();

