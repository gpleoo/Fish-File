/**
 * Fish File - Demo Data Generator
 * Genera 135 sessioni di pesca simulate per la costa laziale (3 anni: 2026-2028)
 *
 * Uso: node scripts/generateDemoData.cjs
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

    // Località costa laziale con coordinate GPS PRECISE sulle spiagge
    // Ogni località ha più punti lungo la spiaggia per variazione realistica
    localita: [
        {
            nome: 'Ostia',
            punti: [
                { lat: 41.7285, lon: 12.2750, desc: 'Pontile' },
                { lat: 41.7310, lon: 12.2680, desc: 'Stabilimenti' },
                { lat: 41.7350, lon: 12.2600, desc: 'Castel Fusano' },
                { lat: 41.7250, lon: 12.2820, desc: 'Canale dei Pescatori' }
            ]
        },
        {
            nome: 'Fiumicino',
            punti: [
                { lat: 41.7680, lon: 12.2180, desc: 'Foce Tevere Nord' },
                { lat: 41.7620, lon: 12.2250, desc: 'Faro' },
                { lat: 41.7550, lon: 12.2350, desc: 'Spiaggia libera' },
                { lat: 41.7700, lon: 12.2100, desc: 'Porto canale' }
            ]
        },
        {
            nome: 'Anzio',
            punti: [
                { lat: 41.4470, lon: 12.6180, desc: 'Riviera Mallozzi' },
                { lat: 41.4510, lon: 12.6250, desc: 'Porto' },
                { lat: 41.4430, lon: 12.6100, desc: 'Tor Caldara' },
                { lat: 41.4490, lon: 12.6320, desc: 'Grotte di Nerone' }
            ]
        },
        {
            nome: 'Nettuno',
            punti: [
                { lat: 41.4590, lon: 12.6550, desc: 'Torre Astura' },
                { lat: 41.4620, lon: 12.6680, desc: 'Cimitero Americano' },
                { lat: 41.4560, lon: 12.6450, desc: 'Scogliera' },
                { lat: 41.4650, lon: 12.6750, desc: 'Spiaggia libera' }
            ]
        },
        {
            nome: 'San Felice Circeo',
            punti: [
                { lat: 41.2320, lon: 13.0750, desc: 'Quarto Caldo' },
                { lat: 41.2280, lon: 13.0680, desc: 'Punta Rossa' },
                { lat: 41.2380, lon: 13.0850, desc: 'Porto' },
                { lat: 41.2250, lon: 13.0600, desc: 'Grotta delle Capre' }
            ]
        },
        {
            nome: 'Terracina',
            punti: [
                { lat: 41.2850, lon: 13.2380, desc: 'Spiaggia di Levante' },
                { lat: 41.2880, lon: 13.2480, desc: 'Porto Badino' },
                { lat: 41.2820, lon: 13.2280, desc: 'Spiaggia di Ponente' },
                { lat: 41.2900, lon: 13.2550, desc: 'Foce Portatore' }
            ]
        },
        {
            nome: 'Latina',
            punti: [
                { lat: 41.4050, lon: 12.8750, desc: 'Foce Sisto' },
                { lat: 41.4100, lon: 12.8850, desc: 'Lido di Latina' },
                { lat: 41.4000, lon: 12.8650, desc: 'Capoportiere' },
                { lat: 41.4150, lon: 12.8950, desc: 'Rio Martino' }
            ]
        }
    ],

    // Numero sessioni totali (3 anni)
    numSessioni: 135,

    // Anni di simulazione
    anniSimulazione: [2026, 2027, 2028]
};

// ==================== DATI METEO STAGIONALI ====================

const METEO_STAGIONALE = {
    inverno: { // Dic, Gen, Feb
        tempAriaMin: 8, tempAriaMax: 14,
        tempAcquaMin: 13, tempAcquaMax: 15,
        venti: ['Tramontana', 'Grecale', 'Maestrale'],
        condizioni: ['clear', 'cloudy', 'overcast', 'rain'],
        pressioneMin: 1005, pressioneMax: 1030
    },
    primavera: { // Mar, Apr, Mag
        tempAriaMin: 15, tempAriaMax: 24,
        tempAcquaMin: 15, tempAcquaMax: 20,
        venti: ['Maestrale', 'Ponente', 'Libeccio', 'Scirocco'],
        condizioni: ['clear', 'cloudy', 'overcast'],
        pressioneMin: 1010, pressioneMax: 1025
    },
    estate: { // Giu, Lug, Ago
        tempAriaMin: 25, tempAriaMax: 34,
        tempAcquaMin: 22, tempAcquaMax: 27,
        venti: ['Libeccio', 'Scirocco', 'Ponente', 'Maestrale'],
        condizioni: ['clear', 'clear', 'cloudy'],
        pressioneMin: 1012, pressioneMax: 1022
    },
    autunno: { // Set, Ott, Nov
        tempAriaMin: 14, tempAriaMax: 24,
        tempAcquaMin: 18, tempAcquaMax: 23,
        venti: ['Scirocco', 'Maestrale', 'Libeccio', 'Grecale'],
        condizioni: ['clear', 'cloudy', 'overcast', 'rain'],
        pressioneMin: 1008, pressioneMax: 1028
    }
};

// Fasi lunari (chiavi inglesi per compatibilità con i filtri)
const FASI_LUNARI = ['newMoon', 'firstQuarter', 'fullMoon', 'lastQuarter', 'waxingCrescent', 'waxingGibbous', 'waningGibbous', 'waningCrescent'];

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

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getStagione(mese) {
    if (mese >= 3 && mese <= 5) return 'primavera';
    if (mese >= 6 && mese <= 8) return 'estate';
    if (mese >= 9 && mese <= 11) return 'autunno';
    return 'inverno';
}

// Aggiunge piccola variazione alle coordinate (max 200m lungo la spiaggia)
function addVariation(coord, maxDelta = 0.002) {
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

// Seleziona un punto GPS casuale dalla località (sempre sulla spiaggia)
function getPuntoSpiaggia(localitaObj) {
    const punto = randomElement(localitaObj.punti);
    return {
        lat: addVariation(punto.lat),
        lon: addVariation(punto.lon),
        desc: punto.desc
    };
}

// ==================== PATTERN RIPETUTI PER TEST FILTRI ====================

const PATTERN_SESSIONI = [
    // Pattern 1: Orata + Luna Piena + Ostia (8 sessioni distribuite nei 3 anni)
    { localita: 'Ostia', specie: 'Orata', luna: 'fullMoon', count: 8 },
    // Pattern 2: Spigola + Scirocco + Anzio (7 sessioni)
    { localita: 'Anzio', specie: 'Spigola', vento: 'Scirocco', count: 7 },
    // Pattern 3: Sarago + Tramontana + Fiumicino (7 sessioni)
    { localita: 'Fiumicino', specie: 'Sarago', vento: 'Tramontana', count: 7 },
    // Pattern 4: Cefalo + Estate + Nettuno (6 sessioni)
    { localita: 'Nettuno', specie: 'Cefalo', stagione: 'estate', count: 6 },
    // Pattern 5: Mormora + Arenicola (8 sessioni)
    { specie: 'Mormora', esca: 'Arenicola', count: 8 },
    // Pattern 6: Leccia Stella + San Felice Circeo (6 sessioni)
    { localita: 'San Felice Circeo', specie: 'Leccia Stella', count: 6 },
    // Pattern 7: Vopa + Terracina + Primavera (5 sessioni)
    { localita: 'Terracina', specie: 'Vopa', stagione: 'primavera', count: 5 },
    // Pattern 8: Occhiata + Latina + Maestrale (5 sessioni)
    { localita: 'Latina', specie: 'Occhiata', vento: 'Maestrale', count: 5 }
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

            // Distribuisci i pattern nei 3 anni
            const annoIndex = i % CONFIG.anniSimulazione.length;
            const anno = CONFIG.anniSimulazione[annoIndex];

            const sessione = generaSessioneConPattern(pattern, sessioneIndex, anno);
            sessioni.push(sessione.sessione);
            catture.push(...sessione.catture);
            sessioneIndex++;
        }
    });

    // Poi genera sessioni casuali per il resto, distribuite uniformemente nei 3 anni
    while (sessioneIndex < CONFIG.numSessioni) {
        const annoIndex = sessioneIndex % CONFIG.anniSimulazione.length;
        const anno = CONFIG.anniSimulazione[annoIndex];

        const sessione = generaSessioneCasuale(sessioneIndex, anno);
        sessioni.push(sessione.sessione);
        catture.push(...sessione.catture);
        sessioneIndex++;
    }

    // Ordina per data
    sessioni.sort((a, b) => new Date(a.dataInizio) - new Date(b.dataInizio));

    return { sessioni, catture };
}

function generaSessioneConPattern(pattern, index, anno) {
    // Determina il mese in base alla stagione richiesta o casuale
    let mese;
    if (pattern.stagione === 'estate') mese = randomInt(6, 8);
    else if (pattern.stagione === 'inverno') mese = randomElement([0, 1, 11]);
    else if (pattern.stagione === 'primavera') mese = randomInt(3, 5);
    else if (pattern.stagione === 'autunno') mese = randomInt(9, 11);
    else mese = randomInt(0, 11);

    const giorno = randomInt(1, 28);
    const data = new Date(anno, mese, giorno);

    // Località
    const locObj = pattern.localita ?
        CONFIG.localita.find(l => l.nome === pattern.localita) :
        randomElement(CONFIG.localita);

    // Punto preciso sulla spiaggia
    const punto = getPuntoSpiaggia(locObj);

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
        latitudine: punto.lat,
        longitudine: punto.lon,
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

function generaSessioneCasuale(index, anno) {
    // Mese casuale
    const mese = randomInt(0, 11);
    const giorno = randomInt(1, 28);
    const data = new Date(anno, mese, giorno);

    const locObj = randomElement(CONFIG.localita);
    const punto = getPuntoSpiaggia(locObj);

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
        latitudine: punto.lat,
        longitudine: punto.lon,
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
    console.log(`📅 Periodo: ${CONFIG.anniSimulazione[0]} - ${CONFIG.anniSimulazione[CONFIG.anniSimulazione.length - 1]}`);
    console.log(`🎯 Sessioni da generare: ${CONFIG.numSessioni}\n`);

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

    // Distribuzione per anno
    console.log('\n📅 Sessioni per anno:');
    const perAnno = {};
    sessioni.forEach(s => {
        const anno = new Date(s.dataInizio).getFullYear();
        perAnno[anno] = (perAnno[anno] || 0) + 1;
    });
    Object.entries(perAnno).sort((a, b) => a[0] - b[0]).forEach(([anno, count]) => {
        console.log(`   • ${anno}: ${count} sessioni`);
    });

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

    // Distribuzione per mese (aggregata)
    console.log('\n📅 Sessioni per mese (tutti gli anni):');
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
