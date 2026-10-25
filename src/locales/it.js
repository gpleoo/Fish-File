/**
 * Italian translations (default language)
 */
const it = {
    // App general
    app: {
        title: 'Fish File',
        subtitle: 'registra le tue battute di pesca',
        catchesSaved: '{count} catture salvate',
        version: 'Fish File v1.0 - 2025 Giampietro Leonoro',
        language: 'Lingua'
    },

    // Session
    session: {
        title: 'sessione di pesca',
        start: 'avvia sessione',
        end: 'termina sessione',
        active: 'sessione attiva',
        location: 'località',
        locationPlaceholder: 'es: molo di fiumicino...',
        latitude: 'latitudine',
        longitude: 'longitudine',
        getGPS: 'GPS',
        gpsAcquired: 'Posizione GPS acquisita!',
        gpsAccuracy: 'Precisione: ±{meters}m',
        gpsError: 'Errore GPS',
        gpsNotSupported: 'Geolocalizzazione non supportata dal tuo browser!',
        permissionDenied: 'Permesso negato.',
        positionUnavailable: 'Posizione non disponibile.',
        timeout: 'Timeout scaduto.',
        unknownError: 'Errore sconosciuto.',
        fillAllFields: 'Compila tutti i campi!',
        invalidCoordinates: 'Coordinate non valide',
        startedWithWeather: 'Sessione avviata con dati meteo!',
        startedNoWeather: 'Sessione avviata. Dati meteo non disponibili, compilali manualmente nella sezione meteo.'
    },

    // Catch form
    catch: {
        title: 'nuova cattura',
        date: 'data',
        time: 'ora',
        species: 'specie',
        speciesPlaceholder: 'seleziona o scrivi...',
        weight: 'peso (g)',
        weightLabel: 'peso',
        length: 'lunghezza (cm)',
        lengthLabel: 'lunghezza',
        bait: 'esca',
        baitPlaceholder: 'seleziona o scrivi...',
        rod: 'canna',
        leader: 'trave',
        hook: 'amo',
        sinker: 'piombo',
        notes: 'note',
        notesPlaceholder: 'appunti sulla cattura...',
        add: 'aggiungi cattura',
        added: 'Cattura registrata con successo!',
        startSessionFirst: 'Avvia prima una sessione di pesca',
        enterSpecies: 'Inserisci la specie della cattura'
    },

    // Weather form
    weather: {
        title: 'dati meteo',
        subtitle: 'dati opzionali ma utili per analisi - puoi modificarli in qualsiasi momento',
        optional: 'I dati meteo sono opzionali ma utili per analisi',
        refresh: 'Aggiorna Meteo da GPS',
        refreshFromGPS: 'Aggiorna Meteo da GPS',
        loading: 'Caricamento...',
        temperature: 'temperatura (°C)',
        temperatureLabel: 'temperatura',
        waterTemp: 'temp. acqua (°C)',
        waterTempLabel: 'temp. acqua',
        pressure: 'pressione (hPa)',
        pressureLabel: 'pressione',
        wind: 'vento (nodi)',
        windLabel: 'vento',
        windDirection: 'direzione vento',
        conditions: 'condizioni',
        moonPhase: 'fase lunare',
        highTide: 'alta marea',
        lowTide: 'bassa marea',
        waveHeight: 'altezza onde (cm)',
        waveFrequency: 'frequenza onde (sec)',
        select: 'seleziona...',
        fetchingWeather: 'Recupero dati meteo...',
        weatherUpdated: 'Dati meteo aggiornati!',
        weatherUnavailable: 'Dati meteo non disponibili. Inseriscili manualmente.',
        enterGPSFirst: 'Inserisci prima le coordinate GPS'
    },

    // Management section
    management: {
        title: 'gestione',
        locations: 'località',
        species: 'specie',
        baits: 'esche',
        rods: 'canne',
        leaders: 'travi',
        hooks: 'ami',
        sinkers: 'piombi',
        add: 'aggiungi',
        edit: 'modifica',
        delete: 'elimina',
        save: 'salva',
        cancel: 'annulla',
        emptyName: 'Il nome non può essere vuoto!',
        alreadyExists: 'Questa voce esiste già!'
    },

    // Analysis section
    analysis: {
        title: 'analizza dati',
        noCatches: 'nessuna cattura registrata',
        totalCatches: 'catture totali',
        mostCaught: 'specie più catturata',
        avgWeight: 'peso medio',
        filters: 'filtri',
        resetFilters: 'reset filtri',
        allYears: 'tutti gli anni',
        allMonths: 'tutti i mesi',
        allSpecies: 'tutte le specie',
        allLocations: 'tutte le località',
        allWindDirections: 'tutte le direzioni vento',
        allWindSpeeds: 'tutte le velocità vento',
        windCalm: 'calmo (0-5 nodi)',
        windLight: 'leggero (6-15 nodi)',
        windModerate: 'moderato (16-25 nodi)',
        windStrong: 'forte (>25 nodi)',
        allPressures: 'tutte le pressioni',
        pressureLow: 'bassa (<1010 hPa)',
        pressureNormal: 'normale (1010-1020 hPa)',
        pressureHigh: 'alta (>1020 hPa)',
        allConditions: 'tutte le condizioni',
        allMoonPhases: 'tutte le fasi lunari',
        export: 'esporta',
        import: 'importa',
        exported: 'Dati esportati con successo!',
        imported: 'Importate {count} catture!',
        nothingToExport: 'Nessuna cattura da esportare!',
        invalidFile: 'File non valido: manca array catture',
        importConfirm: 'Importare {count} catture?\n\nQuesto sostituirà i dati esistenti.\nAssicurati di aver esportato prima i dati attuali.'
    },

    // Map
    map: {
        title: 'mappa sessioni',
        sessions: 'sessioni',
        catches: 'catture',
        noSessions: 'Nessuna sessione con coordinate GPS',
        completeSession: 'Completa una sessione di pesca per vederla sulla mappa',
        unknownLocation: 'Località sconosciuta',
        noCatches: 'Nessuna cattura',
        legend: {
            zeroCatches: '0 catture',
            oneFour: '1-4',
            fiveEight: '5-8',
            ninePlus: '9+'
        }
    },

    // Registered sessions
    sessions: {
        title: 'sessioni registrate',
        noSessions: 'Nessuna sessione completata',
        noMatchingFilters: 'Nessuna sessione corrisponde ai filtri',
        of: 'di',
        start: 'Inizio',
        end: 'Fine',
        time: 'Orario',
        lat: 'Lat',
        lng: 'Lng',
        catches: 'Catture',
        delete: 'Elimina sessione',
        deleteSession: 'Elimina sessione',
        deleteConfirm: 'Eliminare la sessione a {location}? Le catture associate NON verranno eliminate.',
        deleted: 'Sessione eliminata',
        prev: 'Prec',
        next: 'Succ'
    },

    // Catch registry
    registry: {
        title: 'registro catture',
        noCatches: 'Nessuna cattura registrata',
        noMatchingFilters: 'Nessuna cattura corrisponde ai filtri',
        editCatch: 'Modifica cattura',
        deleteCatch: 'Elimina',
        deleteConfirm: 'Cancellare la cattura di {species}?',
        deleted: 'Cattura eliminata',
        updated: 'Cattura aggiornata',
        save: 'Salva',
        cancel: 'Annulla',
        catchData: 'dati cattura',
        weatherData: 'dati meteo'
    },

    // Charts
    charts: {
        title: 'grafici statistiche',
        statistics: 'Statistiche catture',
        total: 'totale',
        mostCaught: 'più catturata',
        avgWeight: 'peso medio',
        byMonth: 'per mese',
        bySpecies: 'per specie',
        byWind: 'per vento',
        catchesByMonth: 'Catture per mese ({count} totali)',
        totalCatches: 'totali',
        topSpecies: 'Specie più catturate (top 8)',
        noCatches: 'Nessuna cattura registrata',
        catchesByWind: 'Catture per direzione vento',
        noWindData: 'Nessun dato vento registrato',
        month: 'Mese',
        species: 'Specie',
        wind: 'Vento',
        chart: 'Grafico',
        catches: 'Catture',
        cat: 'cat.'
    },

    // Voice input
    voice: {
        listening: 'in ascolto',
        speakNow: 'Parla ora',
        stop: 'Stop',
        notSupported: 'Il tuo browser non supporta il riconoscimento vocale',
        error: 'Errore riconoscimento',
        recordWithVoice: 'registra con voce',
        stopRecording: 'ferma registrazione',
        startRecording: 'Avvia registrazione vocale',
        filled: 'Compilato!',
        noDataRecognized: 'Nessun dato riconosciuto. Prova a dire il nome di una specie.',
        micDenied: 'Permesso microfono negato. Abilita il microfono nelle impostazioni.',
        noAudio: 'Nessun audio rilevato. Riprova.',
        startError: 'Errore avvio riconoscimento vocale',
        examples: 'Esempi: "Orata" oppure "Spigola 40 centimetri con coreano"',
        hint: 'Basta dire la specie! Peso, lunghezza ed esca sono opzionali'
    },

    // Common
    common: {
        yes: 'Sì',
        no: 'No',
        ok: 'OK',
        confirm: 'Conferma',
        loading: 'Caricamento...',
        error: 'Errore',
        success: 'Successo',
        warning: 'Attenzione',
        info: 'Info',
        prev: 'Prec',
        next: 'Succ',
        delete: 'Elimina',
        of: 'di'
    },

    // Months
    months: {
        jan: 'Gen', feb: 'Feb', mar: 'Mar', apr: 'Apr',
        may: 'Mag', jun: 'Giu', jul: 'Lug', aug: 'Ago',
        sep: 'Set', oct: 'Ott', nov: 'Nov', dec: 'Dic',
        january: 'gennaio', february: 'febbraio', march: 'marzo',
        april: 'aprile', may_full: 'maggio', june: 'giugno',
        july: 'luglio', august: 'agosto', september: 'settembre',
        october: 'ottobre', november: 'novembre', december: 'dicembre'
    },

    // Moon phases
    moonPhases: {
        newMoon: 'luna nuova',
        waxingCrescent: 'crescente',
        firstQuarter: 'primo quarto',
        waxingGibbous: 'gibbosa crescente',
        fullMoon: 'piena',
        waningGibbous: 'gibbosa calante',
        lastQuarter: 'ultimo quarto',
        waningCrescent: 'calante'
    },

    // Weather conditions
    weatherConditions: {
        clear: 'sereno',
        cloudy: 'nuvoloso',
        overcast: 'coperto',
        rain: 'pioggia',
        storm: 'temporale',
        fog: 'nebbia'
    },

    // Backup
    backup: {
        title: 'backup & cloud',
        dataSize: 'Dimensione dati',
        localBackup: 'Backup locale',
        export: 'Esporta',
        import: 'Importa',
        autoBackup: 'Backup automatico',
        createAutoBackup: 'Crea backup automatico',
        autoBackupHint: 'Salva un punto di ripristino locale',
        cloudBackup: 'Backup cloud',
        cloudHint: 'Scarica il file e caricalo manualmente sul cloud',
        history: 'Cronologia backup',
        local: 'Locale',
        auto: 'Automatico',
        exportSuccess: 'Backup esportato: {catture} catture, {sessioni} sessioni',
        exportError: 'Errore durante l\'esportazione',
        restoreConfirm: 'Ripristinare il backup? I dati attuali verranno sovrascritti.',
        restoreSuccess: 'Ripristino completato: {catture} catture, {sessioni} sessioni',
        restoreError: 'Errore durante il ripristino',
        autoBackupSuccess: 'Backup automatico creato con successo!',
        autoBackupError: 'Errore durante il backup automatico',
        cloudInstructions: 'File scaricato! Caricalo manualmente su Google Drive o Dropbox',
        cloudError: 'Errore durante il backup cloud',
        deleteConfirm: 'Eliminare questo backup dalla cronologia?',
        deleted: 'Backup eliminato dalla cronologia'
    },

    // Settings
    settings: {
        title: 'Impostazioni',
        language: 'Lingua',
        installApp: 'Installa App',
        installButton: 'Installa Fish File',
        installHint: 'Aggiungi l\'app alla schermata home per un accesso rapido',
        appInstalled: 'App installata con successo!'
    },

    // Units
    units: {
        title: 'Unità di Misura',
        weight: 'Peso',
        length: 'Lunghezza',
        temperature: 'Temperatura',
        timeFormat: 'Formato Orario',
        dateFormat: 'Formato Data'
    },

    // Voice Assistant
    voice: {
        title: 'Assistente Vocale',
        button: 'Assistente Vocale',
        notSupported: 'Il riconoscimento vocale non è supportato su questo browser',
        starting: 'Avvio assistente...',
        welcome: 'Ciao! Iniziamo a registrare la cattura.',
        askSpecies: 'Specie?',
        askLength: 'Lunghezza?',
        askBait: 'Esca?',
        askConfirm: 'Registra cattura?',
        waitingSpecies: 'In attesa della specie...',
        waitingLength: 'In attesa della lunghezza...',
        waitingBait: 'In attesa dell\'esca...',
        waitingConfirm: 'Rispondi sì o no',
        waitingNewCatch: 'Di "nuova cattura" per continuare',
        listening: 'In ascolto...',
        speaking: 'Sto parlando...',
        waiting: 'In attesa...',
        heard: 'Ho sentito',
        currentData: 'Dati correnti',
        notUnderstood: 'Non ho capito.',
        fillManually: 'Compila manualmente',
        catchRegistered: 'Cattura registrata!',
        sayNewCatch: 'Di "nuova cattura" per continuare',
        cancelled: 'Annullato.',
        yesOrNo: 'Rispondi sì o no',
        attempt: 'Tentativo',
        error: 'Errore - compila manualmente',
        closeAndFillManually: 'Chiudi e compila manualmente'
    },

    // Privacy & Legal
    privacy: {
        title: 'Privacy e Dati',
        privacyPolicy: 'Informativa Privacy',
        termsOfService: 'Termini di Servizio',
        consents: 'Gestione Consensi',
        locationConsent: 'Consenso Posizione',
        locationDescription: 'Permette di salvare le coordinate GPS delle catture',
        microphoneConsent: 'Consenso Microfono',
        microphoneDescription: 'Permette di usare l\'assistente vocale',
        exportData: 'Esporta i miei dati',
        exportDataDescription: 'Scarica tutti i tuoi dati in formato JSON',
        exportSuccess: 'Dati esportati con successo!',
        importData: 'Importa dati',
        importDataDescription: 'Ripristina dati da un file JSON esportato',
        importConfirm: 'Vuoi importare {{count}} catture? I dati esistenti verranno sostituiti.',
        importSuccess: 'Importate {{count}} catture con successo!',
        importError: 'Errore durante l\'importazione',
        invalidFile: 'File non valido. Assicurati di selezionare un file JSON esportato da Fish File.',
        deleteData: 'Elimina tutti i dati',
        deleteDataDescription: 'Cancella permanentemente tutti i tuoi dati',
        deleteConfirm: '⚠️ ATTENZIONE!\n\nQuesta azione eliminerà PERMANENTEMENTE:\n- Tutte le catture\n- Tutte le sessioni\n- Tutte le liste salvate\n- Tutte le impostazioni\n\nSei sicuro di voler procedere?',
        deleteConfirmFinal: 'Digita "ELIMINA" per confermare:',
        deleteSuccess: 'Tutti i dati sono stati eliminati',
        deleteCancelled: 'Eliminazione annullata',
        consentGranted: 'Consenso concesso',
        consentDenied: 'Consenso negato',
        consentRevoked: 'Consenso revocato',
        permissionBlocked: 'Permesso bloccato dal browser. Vai nelle impostazioni del sito (icona lucchetto) per sbloccarlo.',
        consentRequired: 'Questo permesso è necessario per usare questa funzionalità',
        lastUpdated: 'Ultimo aggiornamento',
        version: 'Versione'
    },

    // Sponsors
    sponsors: {
        title: 'partner & sponsor',
        description: 'I nostri partner che supportano Fish File e la comunità dei pescatori',
        shops: 'Negozi di Pesca',
        associations: 'Associazioni',
        masters: 'Maestri di Pesca',
        noShops: 'Nessun negozio partner al momento',
        noAssociations: 'Nessuna associazione partner al momento',
        noMasters: 'Nessun maestro partner al momento',
        becomeSponsor: 'Vuoi diventare partner di Fish File?',
        contactUs: 'Contattaci',
        website: 'Sito',
        call: 'Chiama',
        email: 'Email'
    },

    // Pianifica uscita
    planner: {
        title: 'pianifica uscita',
        subtitle: 'Trova lo spot migliore per il meteo del giorno',
        settingsTitle: 'Pianifica uscita',
        settingsDescription: 'Mostra la sezione per scegliere lo spot in base al meteo',
        unavailable: 'Pianifica uscita non disponibile al momento. Il resto dell\'app funziona normalmente.',
        retry: 'Riprova',
        noSessions: 'Registra almeno una sessione di pesca per usare questa funzione.',
        setupZones: 'Crea una zona di pesca e assegnale i tuoi spot per iniziare.',
        manageZones: 'Gestisci zone',
        whenWhere: 'Quando e dove',
        zone: 'Zona',
        date: 'Data',
        from: 'Dalle',
        to: 'Alle',
        spotsInZone: '{count} spot in questa zona',
        forecastTitle: 'Meteo previsto',
        resetForecast: 'Ripristina previsione',
        forecastHelp: 'Valori dalla previsione: correggi quelli che ritieni sbagliati.',
        forecastError: 'Previsioni non disponibili: inserisci i valori a mano.',
        tidesTitle: 'Maree',
        tidesHelp: 'Inserisci gli orari di alta e bassa marea del giorno.',
        find: 'Trova lo spot migliore',
        loadingHistory: 'Recupero meteo storico... {done}/{total}',
        origin: {
            prev: 'PREV',
            mod: 'MOD',
            calc: 'CALC'
        },
        factors: {
            tAria: 'Temp. aria',
            tAcqua: 'Temp. acqua',
            pressione: 'Pressione',
            ventoKn: 'Vento',
            ventoDir: 'Direzione vento',
            condizioni: 'Cielo',
            onde: 'Onde',
            luna: 'Fase lunare',
            marea: 'Marea'
        },
        tide: {
            montante: 'Montante',
            stanca: 'Stanca (acqua ferma)',
            calante: 'Calante',
            alta1: '1a alta',
            alta2: '2a alta',
            bassa1: '1a bassa',
            bassa2: '2a bassa'
        },
        reliability: {
            alta: 'Affidabilità alta',
            media: 'Affidabilità media',
            bassa: 'Dati insufficienti - solo indicativo'
        },
        prey: {
            fromSimilar: 'Prede ed esche con meteo simile:',
            fromSpot: 'Prede ed esche in generale su questo spot:',
            withBait: 'con'
        },
        spotTypes: {
            mare: 'Mare',
            lago: 'Lago',
            fiume: 'Fiume'
        },
        results: {
            fewDataGroup: 'Spot con pochi dati simili (solo indicativo, punteggio poco affidabile):',
            back: 'Modifica meteo',
            basedOn: 'Calcolato su {count} sessioni registrate nella zona.',
            modified: 'Valori corretti a mano: {fields}.',
            noSimilar: 'Nessuna sessione con meteo simile su {count} uscite: punteggio basato sulla media dello spot.',
            similarSummary: '{count} sessioni con meteo simile: media {avg} catture, {empty}% uscite a vuoto.',
            farForecast: 'Previsione a più di 3 giorni: vento e onde possono cambiare. Ricontrolla il giorno prima.',
            disclaimer: 'Il punteggio confronta il meteo con il tuo storico: è un\'indicazione, non una certezza.'
        },
        detail: {
            back: 'Classifica',
            comparison: 'Confronto con le tue {count} giornate migliori qui',
            noBest: 'Nessuna uscita con catture e meteo registrato in questo spot.',
            factor: 'Fattore',
            forecast: 'Previsto',
            best: 'Giornate migliori',
            spotWeather: 'Meteo per questo spot',
            resetSpot: 'Ripristina',
            spotWeatherHelp: 'Correggi solo se qui il meteo è diverso dal resto della zona.',
            whatWorked: 'Prede ed esche',
            species: 'Specie',
            baits: 'Esche',
            bestHours: 'Ore migliori',
            sessionsUsed: 'Sessioni simili usate per il calcolo',
            noSessions: 'Nessuna sessione con meteo simile.',
            catches: '{count} catture',
            withoutWeather: '{count} uscite escluse perché senza dati meteo.'
        },
        zones: {
            title: 'Zone di pesca',
            help: 'Raggruppa gli spot vicini (entro 20-30 km) in una zona: avranno lo stesso meteo. Il tipo di spot serve per onde e maree.',
            placeholder: 'es: Litorale pontino',
            add: 'Aggiungi zona',
            empty: 'Nessuna zona creata.',
            spotCount: '{count} spot',
            confirmDelete: 'Eliminare la zona "{name}"? Gli spot resteranno senza zona.',
            spots: 'Spot registrati',
            noSpots: 'Nessuno spot nelle sessioni registrate.',
            outings: '{count} uscite',
            zone: 'Zona',
            type: 'Tipo',
            noZone: 'Nessuna zona',
            done: 'Fatto'
        }
    },

    // Condivisione dati tra utenti
    sharing: {
        title: 'Condivisione dati',
        description: 'Scambia sessioni e catture con altri pescatori. I dati ricevuti restano separati dai tuoi: compaiono in mappa (triangoli) e nelle sessioni registrate e contano nella pianificazione, ma non nelle tue statistiche e non nel tuo backup.',
        yourName: 'Il tuo nome (visibile a chi riceve i tuoi dati)',
        namePlaceholder: 'es: Marco',
        nameRequired: 'Inserisci il tuo nome prima di condividere.',
        nothingToShare: 'Non hai ancora sessioni da condividere.',
        export: 'Condividi i miei dati',
        exportHelp: 'Crea un file con tutte le tue sessioni e catture, coordinate GPS comprese. Invialo come preferisci (WhatsApp, email, AirDrop).',
        exported: 'File creato: {sessions} sessioni, {catches} catture.',
        'import': 'Importa dati condivisi',
        importHelp: 'Aggiunge i dati di un altro utente senza toccare i tuoi. Un file aggiornato della stessa persona sostituisce i suoi dati precedenti.',
        imported: 'Dati di {name} importati: {sessions} sessioni, {catches} catture.',
        updated: 'Dati di {name} aggiornati: {sessions} sessioni, {catches} catture.',
        receivedTitle: 'Dati ricevuti',
        noneReceived: 'Nessun dato ricevuto.',
        counts: '{sessions} sessioni, {catches} catture',
        confirmDelete: 'Eliminare tutti i dati ricevuti da {name}?',
        deleted: 'Dati di {name} eliminati.',
        errors: {
            formato: 'File non valido: non è un file di condivisione di Fish File.',
            backup: 'Questo è un backup completo: per ripristinarlo usa "Importa" in Backup & cloud.',
            proprio: 'Questo file contiene i tuoi stessi dati.',
            vuoto: 'Il file non contiene sessioni.',
            storage: 'Spazio di memoria esaurito: elimina dei dati ricevuti e riprova.'
        },
        mapLegend: 'dati condivisi',
        sharedBy: 'Condivisa da {name}',
        originFilter: 'Origine dati',
        originAll: 'Tutti i dati (miei e condivisi)',
        originMine: 'Solo i miei dati',
        originShared: 'Solo dati condivisi',
        originPerson: 'Condivisi da {name}',
        weightsConverted: '{count} pesi inseriti in kg sono stati convertiti in grammi.',
        sharedSpot: '(da dati condivisi)',
        basedOnShared: 'Calcolato su {count} sessioni nella zona, di cui {shared} condivise da altri utenti.',
        sharedTag: '(condivisa)'
    }
}

export default it
