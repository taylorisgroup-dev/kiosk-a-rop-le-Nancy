const fs = require('fs');
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

const trans = {
  "VOTRE AÉROPORT VOUS PROPOSE": {en: "YOUR AIRPORT OFFERS", de: "IHR FLUGHAFEN BIETET", es: "SU AEROPUERTO OFRECE"},
  "Services à proximité": {en: "Nearby Services", de: "Dienstleistungen in der Nähe", es: "Servicios cercanos"},
  "Bienvenue à l'Aéropôle": {en: "Welcome to the Aeropole", de: "Willkommen am Aeropole", es: "Bienvenido al Aeropolo"},
  "Touchez l'écran pour accéder à vos services": {en: "Touch the screen to access services", de: "Bildschirm berühren für Dienste", es: "Toque la pantalla para acceder"},
  "Hôtels": {en: "Hotels", de: "Hotels", es: "Hoteles"},
  "Restaurants": {en: "Restaurants", de: "Restaurants", es: "Restaurantes"},
  "Taxis & VTC": {en: "Taxis & Cabs", de: "Taxis & VTC", es: "Taxis y VTC"},
  "Location de Voitures": {en: "Car Rental", de: "Autovermietung", es: "Alquiler de coches"},
  "Plan de l'Aéropôle": {en: "Aeropole Map", de: "Aeropole Karte", es: "Mapa del Aeropolo"},
  "Météo Aéronautique": {en: "Aviation Weather", de: "Flugwetter", es: "Meteorología aeronáutica"},
  "Entreprises Partenaires": {en: "Partner Companies", de: "Partnerunternehmen", es: "Empresas asociadas"},
  "Aerops (Paiement taxe)": {en: "Aerops (Tax Payment)", de: "Aerops (Steuerzahlung)", es: "Aerops (Pago de tasas)"},
  "Infos Pratiques": {en: "Practical Info", de: "Praktische Infos", es: "Información práctica"},
  "Payez votre taxe avec l'application": {en: "Pay your tax with the app", de: "Zahlen Sie Ihre Steuer mit der App", es: "Pague su impuesto con la app"},
  "Téléchargez Aerops pour régler vos taxes d'atterrissage, parking et carburant depuis votre smartphone.": {en: "Download Aerops to pay your landing, parking and fuel taxes from your smartphone.", de: "Laden Sie Aerops herunter, um Ihre Lande-, Park- und Treibstoffsteuern über Ihr Smartphone zu bezahlen.", es: "Descargue Aerops para pagar sus tasas de aterrizaje, estacionamiento y combustible desde su teléfono inteligente."},
  "Horaires": {en: "Schedule", de: "Zeitplan", es: "Horario"}
};

function translateObj(obj) {
  if (!obj || !obj.fr) return;
  const fr = obj.fr;
  if (trans[fr]) {
    obj.en = trans[fr].en || fr;
    obj.de = trans[fr].de || fr;
    obj.es = trans[fr].es || fr;
  }
}

translateObj(data.general.title);
translateObj(data.general.subtitle);
translateObj(data.screensaver?.title);
translateObj(data.screensaver?.subtitle);
translateObj(data.aerops?.title);
translateObj(data.aerops?.headline);
translateObj(data.aerops?.description);
translateObj(data.infosPratiques?.title);
translateObj(data.infosPratiques?.headline);
translateObj(data.infosPratiques?.description);

data.categories.forEach(c => translateObj(c.name));

fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
console.log('Translations applied');
