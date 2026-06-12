const fs = require('fs');
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Ensure categories has Plan
const planCat = data.categories.find(c => c.id === 'plan');
if (!planCat) {
    data.categories.push({
        id: 'plan',
        name: 'Plan de l\'Aéropôle',
        image: 'assets/map_aerial.jpg',
        special: 'plan'
    });
}

// Remove old mock enterprises and add the real ones
data.providers = data.providers.filter(p => p.categoryId !== 'entreprises');

const realEntreprises = [
    { name: '54 Aéro Maintenance', color: 'red', num: '9' },
    { name: 'CARTEC', color: 'green', num: '21' },
    { name: 'CERTIGO-SECILOG', color: 'green', num: '15' },
    { name: 'CFAD', color: 'green', num: '2' },
    { name: 'CRV', color: 'red', num: '1' },
    { name: 'Ducavia', color: 'red', num: '9' },
    { name: 'Diffusion Prod', color: 'blue', num: '7' },
    { name: 'Helimouv', color: 'blue', num: '7' },
    { name: 'Icare', color: 'green', num: '2' },
    { name: 'Les Ailes Nanceiennes', color: 'green', num: '1' },
    { name: 'Les Tetes Brulées', color: 'green', num: '3' },
    { name: "Liaisons d'être", color: 'blue', num: '7' },
    { name: 'Lorraine Aviation', color: 'green', num: '2' },
    { name: 'Lorraine Motors', color: 'green', num: '21' },
    { name: 'Miniplan', color: 'red', num: '13' },
    { name: 'Passion Conduite', color: 'green', num: '21' },
    { name: "Print Sm'art", color: 'green', num: '2' },
    { name: 'Sega SARL', color: 'green', num: '2' },
    { name: 'Urbanloop', color: 'green', num: '2' },
    { name: 'Vauban', color: 'green', num: 'X' },
    { name: 'Web Air', color: 'blue', num: '7' }
];

realEntreprises.forEach((e, idx) => {
    data.providers.push({
        id: 'ent_' + idx,
        categoryId: 'entreprises',
        name: e.name,
        image: 'assets/logo_aeropole.jpg', // placeholder
        description: "Partenaire de l'Aéropôle Grand Nancy Tomblaine.",
        contact: '',
        qrUrl: '',
        mapData: {
            pinNum: e.num,
            color: e.color
        }
    });
});

fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
console.log('data.json updated successfully.');
