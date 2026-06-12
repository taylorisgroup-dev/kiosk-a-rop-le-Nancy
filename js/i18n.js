const translations = {
    fr: {
        back: "RETOUR",
        loading: "Chargement en cours...",
        not_found: "Ville introuvable.",
        no_provider: "Aucun prestataire disponible.",
        downloadApp: "Scannez pour télécharger l'application",
        you_are_here: "VOUS ÊTES ICI",
        wind: "Vent",
        gusts: "Rafales",
        dew_point: "Pt. Rosée",
        visibility: "Visibilité",
        cloudiness: "Nébulosité",
        forecast: "Prévisions horaires",
        departure: "Départ",
        destination: "Destination",
        search: "Consulter"
    },
    en: {
        back: "BACK",
        loading: "Loading...",
        not_found: "City not found.",
        no_provider: "No providers available.",
        downloadApp: "Scan to download the app",
        you_are_here: "YOU ARE HERE",
        wind: "Wind",
        gusts: "Gusts",
        dew_point: "Dew Point",
        visibility: "Visibility",
        cloudiness: "Cloudiness",
        forecast: "Hourly Forecast",
        departure: "Departure",
        destination: "Destination",
        search: "Search"

    }
};

let currentLang = 'fr';

function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    // Update flags UI
    document.querySelectorAll('.lang-flag').forEach(el => {
        el.classList.toggle('active', el.getAttribute('alt').toLowerCase() === lang);
    });

    // Update static UI elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    // Update dynamic content via event so app.js can re-render
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

function t(objOrString) {
    if (!objOrString) return '';
    if (typeof objOrString === 'string') return objOrString;
    return objOrString[currentLang] || objOrString['fr'] || '';
}

function ti(key) {
    return translations[currentLang][key] || key;
}
