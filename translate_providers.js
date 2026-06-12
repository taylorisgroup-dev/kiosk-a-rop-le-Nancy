const fs = require('fs');
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

function translate(str, lang) {
    if (!str) return '';
    
    // Hardcoded translations for known strings
    const dict = {
        "Partenaire de l'Aéropôle Grand Nancy Tomblaine.": {
            en: "Partner of the Grand Nancy Tomblaine Aeropole.",
            de: "Partner der Aeropole Grand Nancy Tomblaine.",
            es: "Socio del Aeropolo Grand Nancy Tomblaine."
        },
        "Ouvert tous les jours (Midi et Soir)": {
            en: "Open every day (Lunch and Dinner)",
            de: "Täglich geöffnet (Mittags und Abends)",
            es: "Abierto todos los días (Almuerzo y Cena)"
        },
        "Ouvert du Lundi au Vendredi de 9h00 à 17h00": {
            en: "Open Monday to Friday from 9:00 AM to 5:00 PM",
            de: "Geöffnet von Montag bis Freitag von 9:00 bis 17:00 Uhr",
            es: "Abierto de lunes a viernes de 9:00 a 17:00"
        },
        "Tél : ": { en: "Phone: ", de: "Tel: ", es: "Tel: " },
        "Tél :": { en: "Phone: ", de: "Tel: ", es: "Tel: " },
        " depuis l'Aéropôle": { en: " from the Aeropole", de: " von der Aeropole", es: " desde el Aeropolo" }
    };

    if (dict[str] && dict[str][lang]) return dict[str][lang];

    // Simple replacement for contact details
    let res = str;
    if (str.includes('Tél :')) {
        res = res.replace('Tél :', dict['Tél :'][lang] || 'Tel: ');
        res = res.replace(" depuis l'Aéropôle", dict[" depuis l'Aéropôle"][lang] || ' from Aeropole');
    }

    // Rough translations for hotel descriptions
    if (str.includes("Niché dans un cadre verdoyant")) {
        if (lang === 'en') return "Nestled in a green setting on the outskirts of Nancy, the Novotel Nancy Ouest welcomes you in 119 modern and fully renovated rooms. Relax by the seasonal heated outdoor pool, enjoy fine dining at La Cachette restaurant, or organize events in over 400 m² of flexible spaces. Free parking with EV chargers, high-speed Wi-Fi, and children under 16 stay free.";
        if (lang === 'de') return "Eingebettet ins Grüne am Stadtrand von Nancy empfängt Sie das Novotel Nancy Ouest in 119 modernen, renovierten Zimmern. Entspannen Sie am beheizten Außenpool, genießen Sie im Restaurant La Cachette oder planen Sie Events auf über 400 m². Kostenloser Parkplatz, WLAN und Kinder unter 16 übernachten gratis.";
        if (lang === 'es') return "Ubicado en un entorno verde a las afueras de Nancy, el Novotel Nancy Ouest le da la bienvenida en 119 habitaciones modernas y renovadas. Relájese junto a la piscina climatizada, disfrute de una excelente comida en La Cachette u organice eventos. Aparcamiento gratuito, Wi-Fi y niños menores de 16 años se alojan gratis.";
    }

    if (str.includes("en plein cœur de Nancy")) {
        if (lang === 'en') return "Located in the heart of Nancy, the Mercure Centre Place Stanislas places you steps away from the UNESCO World Heritage square. This elegant 4-star hotel offers soundproofed rooms with modern comfort: minibar, Nespresso machine, flat-screen TV. Gourmet restaurant on site, lounge bar, and seminar spaces.";
        if (lang === 'de') return "Mitten im Herzen von Nancy, nur wenige Schritte vom UNESCO-Weltkulturerbe entfernt. Dieses elegante 4-Sterne-Hotel bietet schallisolierte Zimmer mit modernem Komfort: Minibar, Nespresso-Maschine, Flachbildfernseher. Gourmet-Restaurant vor Ort, Lounge-Bar und Seminarräume.";
        if (lang === 'es') return "Situado en el corazón de Nancy, a pocos pasos de la plaza declarada Patrimonio de la Humanidad por la UNESCO. Este elegante hotel de 4 estrellas ofrece habitaciones insonorizadas con todas las comodidades modernas. Restaurante gastronómico, bar lounge y espacios para seminarios.";
    }

    if (str.includes("Face à la gare de Nancy")) {
        if (lang === 'en') return "Facing Nancy train station and close to Place Stanislas, ibis Styles Nancy Centre Gare combines contemporary design and absolute practicality. Breakfast included, fitness area with sauna, and playful atmosphere with foosball. The ideal hotel for connected travelers.";
        if (lang === 'de') return "Gegenüber dem Bahnhof von Nancy verbindet das ibis Styles zeitgenössisches Design mit absoluter Praktikabilität. Inklusive Frühstück, Fitnessbereich mit Sauna und spielerische Atmosphäre mit Tischfußball. Das ideale Hotel für moderne Reisende.";
        if (lang === 'es') return "Frente a la estación de tren de Nancy, el ibis Styles combina un diseño contemporáneo y máxima practicidad. Desayuno incluido, área de fitness con sauna y un ambiente lúdico con futbolín. El hotel ideal para los viajeros.";
    }

    if (str.includes("Véritable havre de paix")) {
        if (lang === 'en') return "A true haven of peace in the city center, the Best Western Plus Crystal stands out for its exceptional 200 m² spa with indoor heated pool, sauna, hammam, and massage cabins. Enjoy a cocktail at the rooftop bar with panoramic views. A luxury setting near Place Stanislas.";
        if (lang === 'de') return "Als wahre Oase der Ruhe im Stadtzentrum zeichnet sich das Best Western Plus Crystal durch sein 200 m² großes Spa aus. Genießen Sie einen Cocktail an der Rooftop-Bar mit Panoramablick auf die Dächer von Nancy.";
        if (lang === 'es') return "Un verdadero remanso de paz en el centro, el Best Western Plus Crystal destaca por su excepcional spa de 200 m² con piscina cubierta. Disfrute de un cóctel en el bar de la azotea con vistas panorámicas de Nancy.";
    }

    if (str.includes("Idéalement situé aux portes sud")) {
        if (lang === 'en') return "Ideally located at the southern gates of Nancy with direct access to highways, Kyriad Nancy Sud offers comfortable air-conditioned rooms. On-site restaurant, free secure private parking. A smart choice for business travelers and explorers.";
        if (lang === 'de') return "Ideal an den südlichen Toren von Nancy gelegen mit direktem Autobahnanschluss bietet das Kyriad Nancy Sud komfortable Zimmer. Restaurant vor Ort, kostenloser sicherer Parkplatz.";
        if (lang === 'es') return "Idealmente situado en las puertas sur de Nancy con acceso directo a autopistas, Kyriad Nancy Sud ofrece cómodas habitaciones. Restaurante en el lugar, estacionamiento privado seguro y gratuito.";
    }

    if (str.includes("Découvrez notre carte élaborée")) {
        if (lang === 'en') return "Discover our menu made with local and seasonal products. Enjoy a breathtaking panoramic view of the runways during takeoffs. Ideal for your business meals, meetings, or family moments.";
        if (lang === 'de') return "Entdecken Sie unsere Speisekarte mit regionalen und saisonalen Produkten. Genießen Sie einen atemberaubenden Panoramablick auf die Start- und Landebahnen. Ideal für Geschäftsessen oder Familienmomente.";
        if (lang === 'es') return "Descubra nuestro menú elaborado con productos locales y de temporada. Disfrute de una vista panorámica impresionante de las pistas. Ideal para comidas de negocios o momentos en familia.";
    }

    if (str.includes("Bienvenue à l'accueil de l'Aéropôle")) {
        if (lang === 'en') return "Welcome to the Grand Nancy Tomblaine Aeropole reception. Our team is at your disposal for any questions regarding flights, partner companies, and runway access.";
        if (lang === 'de') return "Willkommen an der Rezeption der Aeropole Grand Nancy Tomblaine. Unser Team steht Ihnen für alle Fragen zu Flügen und Partnerunternehmen zur Verfügung.";
        if (lang === 'es') return "Bienvenido a la recepción del Aeropolo Grand Nancy Tomblaine. Nuestro equipo está a su disposición para cualquier duda sobre vuelos y empresas asociadas.";
    }

    return res;
}

data.providers.forEach(prov => {
    if (prov.description && prov.description.fr) {
        prov.description.en = translate(prov.description.fr, 'en');
        prov.description.de = translate(prov.description.fr, 'de');
        prov.description.es = translate(prov.description.fr, 'es');
    }
    if (prov.contact && prov.contact.fr) {
        prov.contact.en = translate(prov.contact.fr, 'en');
        prov.contact.de = translate(prov.contact.fr, 'de');
        prov.contact.es = translate(prov.contact.fr, 'es');
    }
});

fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
console.log('Provider translations applied');
