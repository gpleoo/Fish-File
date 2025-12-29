/**
 * Fish File - Demo Data Generator
 * Genera 50 sessioni di pesca simulate per la costa laziale
 *
 * Uso: node scripts/generateDemoData.js
 * Output: demo-backup.json (importabile nell'app)
 */

const fs = require('fs');
const path = require('path');

// ==================== CONFIGURAZIONE ====================

const CONFIG = {
    // Attrezzatura specificata dall'utente
    canne: ['FSH', 'M1S', 'Kali Kunnan Jaw'],
    travi: ['3x100', '2x200', '1x300'],
    specie: ['Spigola', 'Orata', 'Sarago', 'Mormora', 'Cefalo', 'Occhiata', 'Leccia Stella', 'Sughero', 'Vopa'],
    esche: ['Arenicola', 'Americano', 'Bibi', 'Coreano', 'Granchio'],
    piombi: ['Ogiva 125 gr', 'Ogiva 100 gr', 'Idropiramide 100 gr', 'Idropiramide 125 gr', 'Sporten 100 gr', 'Sporten 125 gr'],
    ami: ['n.2', 'n.4', 'n.6', 'n.8', 'n.10', 'n.12'],

    // Località costa laziale con coordinate GPS reali
    localita: [
        { nome: 'Ostia', lat: 41.7325, lon: 12.2819 },
        { nome: 'Fiumicino', lat: 41.7647, lon: 12.2314 },
        { nome: 'Anzio', lat: 41.4475, lon: 12.6275 },
        { nome: 'Nettuno', lat: 41.4578, lon: 12.6656 },
        { nome: 'San Felice Circeo', lat: 41.2297, lon: 13.0881 },
        { nome: 'Terracina', lat: 41.2917, lon: 13.2486 },
        { nome: 'Latina', lat: 41.3833, lon: 12.9167 }
    ],

    // Numero sessioni
    numSessioni: 50
};

// ==================== DATI METEO STAGIONALI ====================

const METEO_STAGIONALE = {
    inverno: { // Dic, Gen, Feb
        tempAriaMin: 8, tempAriaMax: 14,
        tempAcquaMin: 13, tempAcquaMax: 15,
        venti: ['Tramontana', 'Grecale', 'Maestrale'],
        condizioni: ['Sereno', 'Nuvoloso', 'Coperto', 'Pioggia'],
        pressioneMin: 1005, pressioneMax: 1030
    },
    primavera: { // Mar, Apr, Mag
        tempAriaMin: 15, tempAriaMax: 24,
        tempAcquaMin: 15, tempAcquaMax: 20,
        venti: ['Maestrale', 'Ponente', 'Libeccio', 'Scirocco'],
        condizioni: ['Sereno', 'Poco nuvoloso', 'Nuvoloso', 'Variabile'],
        pressioneMin: 1010, pressioneMax: 1025
    },
    estate: { // Giu, Lug, Ago
        tempAriaMin: 25, tempAriaMax: 34,
        tempAcquaMin: 22, tempAcquaMax: 27,
        venti: ['Libeccio', 'Scirocco', 'Ponente', 'Maestrale'],
        condizioni: ['Sereno', 'Poco nuvoloso', 'Sereno'],
        pressioneMin: 1012, pressioneMax: 1022
    },
    autunno: { // Set, Ott, Nov
        tempAriaMin: 14, tempAriaMax: 24,
        tempAcquaMin: 18, tempAcquaMax: 23,
        venti: ['Scirocco', 'Maestrale', 'Libeccio', 'Grecale'],
        condizioni: ['Sereno', 'Nuvoloso', 'Variabile', 'Pioggia'],
        pressioneMin: 1008, pressioneMax: 1028
    }
};

// Fasi lunari
const FASI_LUNARI = ['Luna Nuova', 'Primo Quarto', 'Luna Piena', 'Ultimo Quarto'];

// Direzioni vento complete
const DIREZIONI_VENTO = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// ==================== UTILITY FUNCTIONS ====================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomElements(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getStagione(mese) {
    if (mese >= 3 && mese <= 5) return 'primavera';
    if (mese >= 6 && mese <= 8) return 'estate';
    if (mese >= 9 && mese <= 11) return 'autunno';
    return 'inverno';
}

function addVariation(coord, maxDelta = 0.01) {
    return coord + (Math.random() - 0.5) * 2 * maxDelta;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatTime(date) {
    return date.toTimeString().slice(0, 5);
}

// Genera orari marea realistici
function generaOrariMarea(data) {
    const baseHour = randomInt(0, 6);
    const altaOra1 = `${String(baseHour).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`;
    const bassaOra1 = `${String((baseHour + 6) % 24).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`;
    const altaOra2 = `${String((baseHour + 12) % 24).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`;
    const bassaOra2 = `${String((baseHour + 18) % 24).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`;

    return { altaOra1, bassaOra1, altaOra2, bassaOra2 };
}

// Peso in base alla specie e lunghezza
function calcolaPeso(specie, lunghezza) {
    const fattori = {
        'Spigola': 0.012,
        'Orata': 0.018,
        'Sarago': 0.015,
        'Mormora': 0.010,
        'Cefalo': 0.008,
        'Occhiata': 0.012,
        'Leccia Stella': 0.015,
        'Sughero': 0.010,
        'Vopa': 0.008
    };
    const fattore = fattori[specie] || 0.012;
    // Peso = fattore * lunghezza^3 (approssimazione)
    const peso = fattore * Math.pow(lunghezza, 2.8);
    return Math.round(peso);
}

// Lunghezza tipica per specie
function getLunghezzaSpecie(specie) {
    const range = {
        'Spigola': { min: 25, max: 70 },
        'Orata': { min: 20, max: 50 },
        'Sarago': { min: 15, max: 40 },
        'Mormora': { min: 15, max: 35 },
        'Cefalo': { min: 20, max: 50 },
        'Occhiata': { min: 15, max: 30 },
        'Leccia Stella': { min: 25, max: 60 },
        'Sughero': { min: 12, max: 25 },
        'Vopa': { min: 10, max: 20 }
    };
    const r = range[specie] || { min: 15, max: 35 };
    return randomInt(r.min, r.max);
}

// ==================== PATTERN RIPETUTI PER TEST FILTRI ====================

const PATTERN_SESSIONI = [
    // Pattern 1: Orata + Luna Piena + Ostia (5 sessioni)
    { localita: 'Ostia', specie: 'Orata', luna: 'Luna Piena', count: 5 },
    // Pattern 2: Spigola + Scirocco + Anzio (4 sessioni)
    { localita: 'Anzio', specie: 'Spigola', vento: 'Scirocco', count: 4 },
    // Pattern 3: Sarago + Tramontana + Fiumicino (4 sessioni)
    { localita: 'Fiumicino', specie: 'Sarago', vento: 'Tramontana', count: 4 },
    // Pattern 4: Cefalo + Estate + Nettuno (3 sessioni)
    { localita: 'Nettuno', specie: 'Cefalo', stagione: 'estate', count: 3 },
    // Pattern 5: Mormora + Arenicola (4 sessioni)
    { specie: 'Mormora', esca: 'Arenicola', count: 4 },
    // Pattern 6: Leccia Stella + San Felice Circeo (3 sessioni)
    { localita: 'San Felice Circeo', specie: 'Leccia Stella', count: 3 }
];

// ==================== GENERAZIONE DATI ====================

function generaSessioni() {
    const sessioni = [];
    const catture = [];
    let sessioneIndex = 0;

    // Prima genera le sessioni con pattern per test filtri
    PATTERN_SESSIONI.forEach(pattern => {
        for (let i = 0; i < pattern.count; i++) {
            if (sessioneIndex >= CONFIG.numSessioni) break;

            const sessione = generaSessioneConPattern(pattern, sessioneIndex);
            sessioni.push(sessione.sessione);
            catture.push(...sessione.catture);
            sessioneIndex++;
        }
    });

    // Poi genera sessioni casuali per il resto
    while (sessioneIndex < CONFIG.numSessioni) {
        const sessione = generaSessioneCasuale(sessioneIndex);
        sessioni.push(sessione.sessione);
        catture.push(...sessione.catture);
        sessioneIndex++;
    }

    // Mescola per distribuzione realistica
    sessioni.sort((a, b) => new Date(a.dataInizio) - new Date(b.dataInizio));

    return { sessioni, catture };
}

function generaSessioneConPattern(pattern, index) {
    // Determina la data (distribuita nel 2026)
    const mese = pattern.stagione === 'estate' ? randomInt(6, 8) :
                 pattern.stagione === 'inverno' ? randomInt(0, 2) :
                 pattern.stagione === 'primavera' ? randomInt(3, 5) :
                 pattern.stagione === 'autunno' ? randomInt(9, 11) :
                 randomInt(0, 11);

    const giorno = randomInt(1, 28);
    const data = new Date(2026, mese, giorno);

    // Località
    const locObj = pattern.localita ?
        CONFIG.localita.find(l => l.nome === pattern.localita) :
        randomElement(CONFIG.localita);

    const stagione = getStagione(mese);
    const meteo = METEO_STAGIONALE[stagione];

    // Genera sessione
    const oraInizio = randomInt(5, 8);
    const durataOre = randomInt(3, 8);
    const dataInizio = new Date(data);
    dataInizio.setHours(oraInizio, randomInt(0, 59));
    const dataFine = new Date(dataInizio);
    dataFine.setHours(dataInizio.getHours() + durataOre);

    const maree = generaOrariMarea(data);

    const sessione = {
        id: generateId(),
        localita: locObj.nome,
        latitudine: addVariation(locObj.lat),
        longitudine: addVariation(locObj.lon),
        dataInizio: dataInizio.toISOString(),
        dataFine: dataFine.toISOString(),
        meteo: {
            temperaturaAria: randomInt(meteo.tempAriaMin, meteo.tempAriaMax),
            temperaturaAcqua: randomInt(meteo.tempAcquaMin, meteo.tempAcquaMax),
            vento: pattern.vento || randomElement(meteo.venti),
            direzioneVento: randomElement(DIREZIONI_VENTO),
            forzaVento: randomInt(5, 25),
            condizioni: randomElement(meteo.condizioni),
            pressione: randomInt(meteo.pressioneMin, meteo.pressioneMax),
            faseLunare: pattern.luna || randomElement(FASI_LUNARI),
            mareggiate: randomElement(['Calmo', 'Poco mosso', 'Mosso']),
            altezzaOnde: randomFloat(0.2, 1.5),
            frequenzaOnde: randomInt(4, 12),
            mareaAlta1: maree.altaOra1,
            mareaBassa1: maree.bassaOra1,
            mareaAlta2: maree.altaOra2,
            mareaBassa2: maree.bassaOra2
        }
    };

    // Genera catture (con specie del pattern predominante)
    const numCatture = randomInt(2, 8);
    const catture = [];

    for (let i = 0; i < numCatture; i++) {
        // 70% probabilità di usare la specie del pattern
        const specie = (pattern.specie && Math.random() < 0.7) ?
            pattern.specie : randomElement(CONFIG.specie);

        const esca = pattern.esca || randomElement(CONFIG.esche);

        catture.push(generaCattura(sessione, specie, esca, i));
    }

    return { sessione, catture };
}

function generaSessioneCasuale(index) {
    // Data casuale nel 2026
    const mese = randomInt(0, 11);
    const giorno = randomInt(1, 28);
    const data = new Date(2026, mese, giorno);

    const locObj = randomElement(CONFIG.localita);
    const stagione = getStagione(mese);
    const meteo = METEO_STAGIONALE[stagione];

    const oraInizio = randomInt(5, 10);
    const durataOre = randomInt(2, 8);
    const dataInizio = new Date(data);
    dataInizio.setHours(oraInizio, randomInt(0, 59));
    const dataFine = new Date(dataInizio);
    dataFine.setHours(dataInizio.getHours() + durataOre);

    const maree = generaOrariMarea(data);

    const sessione = {
        id: generateId(),
        localita: locObj.nome,
        latitudine: addVariation(locObj.lat),
        longitudine: addVariation(locObj.lon),
        dataInizio: dataInizio.toISOString(),
        dataFine: dataFine.toISOString(),
        meteo: {
            temperaturaAria: randomInt(meteo.tempAriaMin, meteo.tempAriaMax),
            temperaturaAcqua: randomInt(meteo.tempAcquaMin, meteo.tempAcquaMax),
            vento: randomElement(meteo.venti),
            direzioneVento: randomElement(DIREZIONI_VENTO),
            forzaVento: randomInt(5, 25),
            condizioni: randomElement(meteo.condizioni),
            pressione: randomInt(meteo.pressioneMin, meteo.pressioneMax),
            faseLunare: randomElement(FASI_LUNARI),
            mareggiate: randomElement(['Calmo', 'Poco mosso', 'Mosso', 'Molto mosso']),
            altezzaOnde: randomFloat(0.2, 2.0),
            frequenzaOnde: randomInt(4, 12),
            mareaAlta1: maree.altaOra1,
            mareaBassa1: maree.bassaOra1,
            mareaAlta2: maree.altaOra2,
            mareaBassa2: maree.bassaOra2
        }
    };

    // Distribuzione catture: 10% zero, 40% 1-3, 35% 4-7, 15% 8+
    const rnd = Math.random();
    let numCatture;
    if (rnd < 0.10) numCatture = 0;
    else if (rnd < 0.50) numCatture = randomInt(1, 3);
    else if (rnd < 0.85) numCatture = randomInt(4, 7);
    else numCatture = randomInt(8, 12);

    const catture = [];
    for (let i = 0; i < numCatture; i++) {
        catture.push(generaCattura(sessione, null, null, i));
    }

    return { sessione, catture };
}

function generaCattura(sessione, specieForced = null, escaForced = null, index) {
    const specie = specieForced || randomElement(CONFIG.specie);
    const lunghezza = getLunghezzaSpecie(specie);
    const peso = calcolaPeso(specie, lunghezza);

    // Ora cattura tra inizio e fine sessione
    const inizio = new Date(sessione.dataInizio);
    const fine = new Date(sessione.dataFine);
    const oraCattura = new Date(inizio.getTime() + Math.random() * (fine.getTime() - inizio.getTime()));

    return {
        id: generateId(),
        sessioneId: sessione.id,
        specie: specie,
        peso: peso,
        lunghezza: lunghezza,
        esca: escaForced || randomElement(CONFIG.esche),
        canna: randomElement(CONFIG.canne),
        trave: randomElement(CONFIG.travi),
        amo: randomElement(CONFIG.ami),
        piombo: randomElement(CONFIG.piombi),
        data: formatDate(oraCattura),
        ora: formatTime(oraCattura),
        localita: sessione.localita,
        latitudine: sessione.latitudine,
        longitudine: sessione.longitudine,
        note: generaNota(specie, lunghezza),
        // Copia dati meteo dalla sessione
        meteo: { ...sessione.meteo }
    };
}

function generaNota(specie, lunghezza) {
    const note = [
        '',
        '',
        '',
        `${specie} di buona taglia`,
        'Abboccata decisa',
        'Presa al primo lancio',
        'Combattimento intenso',
        `Bella ${specie.toLowerCase()}`,
        'Rilasciata dopo foto',
        'Esca molto efficace oggi'
    ];
    return Math.random() < 0.3 ? randomElement(note) : '';
}

// ==================== GENERAZIONE BACKUP ====================

function generaBackup() {
    console.log('🎣 Fish File - Demo Data Generator');
    console.log('===================================\n');

    const { sessioni, catture } = generaSessioni();

    // Prepara il backup nel formato corretto
    const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
            diarioPesca_catture: catture,
            diarioPesca_sessioniCompletate: sessioni,
            diarioPesca_specie: CONFIG.specie,
            diarioPesca_localita: CONFIG.localita.map(l => l.nome),
            diarioPesca_esche: CONFIG.esche,
            diarioPesca_canne: CONFIG.canne,
            diarioPesca_travi: CONFIG.travi,
            diarioPesca_ami: CONFIG.ami,
            diarioPesca_piombi: CONFIG.piombi,
            diarioPesca_note: [],
            fishFileLanguage: 'it'
        }
    };

    // Statistiche
    console.log('📊 Statistiche generate:');
    console.log(`   • Sessioni: ${sessioni.length}`);
    console.log(`   • Catture totali: ${catture.length}`);
    console.log(`   • Media catture/sessione: ${(catture.length / sessioni.length).toFixed(1)}`);

    // Distribuzione per località
    console.log('\n📍 Catture per località:');
    const perLocalita = {};
    catture.forEach(c => {
        perLocalita[c.localita] = (perLocalita[c.localita] || 0) + 1;
    });
    Object.entries(perLocalita).sort((a, b) => b[1] - a[1]).forEach(([loc, count]) => {
        console.log(`   • ${loc}: ${count}`);
    });

    // Distribuzione per specie
    console.log('\n🐟 Catture per specie:');
    const perSpecie = {};
    catture.forEach(c => {
        perSpecie[c.specie] = (perSpecie[c.specie] || 0) + 1;
    });
    Object.entries(perSpecie).sort((a, b) => b[1] - a[1]).forEach(([sp, count]) => {
        console.log(`   • ${sp}: ${count}`);
    });

    // Distribuzione per mese
    console.log('\n📅 Sessioni per mese:');
    const perMese = {};
    const mesiNomi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    sessioni.forEach(s => {
        const mese = new Date(s.dataInizio).getMonth();
        perMese[mese] = (perMese[mese] || 0) + 1;
    });
    Object.entries(perMese).sort((a, b) => a[0] - b[0]).forEach(([mese, count]) => {
        console.log(`   • ${mesiNomi[mese]}: ${count}`);
    });

    // Salva il file
    const outputPath = path.join(__dirname, '..', 'demo-backup.json');
    fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2));

    console.log(`\n✅ File generato: ${outputPath}`);
    console.log('\n📱 Per importare:');
    console.log('   1. Apri Fish File');
    console.log('   2. Vai su Impostazioni → Backup');
    console.log('   3. Clicca "Importa dati"');
    console.log('   4. Seleziona demo-backup.json');

    return backup;
}

// Esegui
generaBackup();
