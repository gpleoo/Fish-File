/**
 * French translations
 */
const fr = {
    // App general
    app: {
        title: 'Fish File',
        subtitle: 'enregistrez vos sessions de pêche',
        catchesSaved: '{count} captures enregistrées',
        version: 'Fish File v1.0 - 2025 Giampietro Leonoro',
        language: 'Langue'
    },

    // Session
    session: {
        title: 'session de pêche',
        start: 'démarrer la session',
        end: 'terminer la session',
        active: 'session active',
        location: 'lieu',
        locationPlaceholder: 'ex: jetée de Marseille...',
        latitude: 'latitude',
        longitude: 'longitude',
        getGPS: 'GPS',
        gpsAcquired: 'Position GPS acquise !',
        gpsAccuracy: 'Précision: ±{meters}m',
        gpsError: 'Erreur GPS',
        gpsNotSupported: 'La géolocalisation n\'est pas supportée par votre navigateur !',
        permissionDenied: 'Permission refusée.',
        positionUnavailable: 'Position non disponible.',
        timeout: 'Délai expiré.',
        unknownError: 'Erreur inconnue.',
        fillAllFields: 'Remplissez tous les champs !',
        invalidCoordinates: 'Coordonnées invalides',
        startedWithWeather: 'Session démarrée avec les données météo !',
        startedNoWeather: 'Session démarrée. Données météo non disponibles, remplissez-les manuellement dans la section météo.'
    },

    // Catch form
    catch: {
        title: 'nouvelle capture',
        date: 'date',
        time: 'heure',
        species: 'espèce',
        speciesPlaceholder: 'sélectionner ou écrire...',
        weight: 'poids (g)',
        weightLabel: 'poids',
        length: 'longueur (cm)',
        lengthLabel: 'longueur',
        bait: 'appât',
        baitPlaceholder: 'sélectionner ou écrire...',
        rod: 'canne',
        leader: 'bas de ligne',
        hook: 'hameçon',
        sinker: 'plomb',
        notes: 'notes',
        notesPlaceholder: 'notes sur la capture...',
        add: 'ajouter capture',
        added: 'Capture enregistrée avec succès !',
        startSessionFirst: 'Démarrez d\'abord une session de pêche',
        enterSpecies: 'Entrez l\'espèce de la capture'
    },

    // Weather form
    weather: {
        title: 'données météo',
        subtitle: 'données optionnelles mais utiles pour l\'analyse - vous pouvez les modifier à tout moment',
        optional: 'Les données météo sont optionnelles mais utiles pour l\'analyse',
        refresh: 'Actualiser Météo depuis GPS',
        refreshFromGPS: 'Actualiser Météo depuis GPS',
        loading: 'Chargement...',
        temperature: 'température (°C)',
        temperatureLabel: 'température',
        waterTemp: 'temp. eau (°C)',
        waterTempLabel: 'temp. eau',
        pressure: 'pression (hPa)',
        pressureLabel: 'pression',
        wind: 'vent (nœuds)',
        windLabel: 'vent',
        windDirection: 'direction du vent',
        conditions: 'conditions',
        moonPhase: 'phase lunaire',
        highTide: 'marée haute',
        lowTide: 'marée basse',
        waveHeight: 'hauteur vagues (cm)',
        waveFrequency: 'fréquence vagues (sec)',
        select: 'sélectionner...',
        fetchingWeather: 'Récupération des données météo...',
        weatherUpdated: 'Données météo mises à jour !',
        weatherUnavailable: 'Données météo non disponibles. Entrez-les manuellement.',
        enterGPSFirst: 'Entrez d\'abord les coordonnées GPS'
    },

    // Management section
    management: {
        title: 'gestion',
        locations: 'lieux',
        species: 'espèces',
        baits: 'appâts',
        rods: 'cannes',
        leaders: 'bas de ligne',
        hooks: 'hameçons',
        sinkers: 'plombs',
        add: 'ajouter',
        edit: 'modifier',
        delete: 'supprimer',
        save: 'enregistrer',
        cancel: 'annuler',
        emptyName: 'Le nom ne peut pas être vide !',
        alreadyExists: 'Cette entrée existe déjà !'
    },

    // Analysis section
    analysis: {
        title: 'analyser les données',
        noCatches: 'aucune capture enregistrée',
        totalCatches: 'captures totales',
        mostCaught: 'espèce la plus capturée',
        avgWeight: 'poids moyen',
        filters: 'filtres',
        resetFilters: 'réinitialiser filtres',
        allYears: 'toutes les années',
        allMonths: 'tous les mois',
        allSpecies: 'toutes les espèces',
        allLocations: 'tous les lieux',
        allWindDirections: 'toutes les directions du vent',
        allWindSpeeds: 'toutes les vitesses du vent',
        windCalm: 'calme (0-5 nœuds)',
        windLight: 'léger (6-15 nœuds)',
        windModerate: 'modéré (16-25 nœuds)',
        windStrong: 'fort (>25 nœuds)',
        allPressures: 'toutes les pressions',
        pressureLow: 'basse (<1010 hPa)',
        pressureNormal: 'normale (1010-1020 hPa)',
        pressureHigh: 'haute (>1020 hPa)',
        allConditions: 'toutes les conditions',
        allMoonPhases: 'toutes les phases lunaires',
        export: 'exporter',
        import: 'importer',
        exported: 'Données exportées avec succès !',
        imported: '{count} captures importées !',
        nothingToExport: 'Aucune capture à exporter !',
        invalidFile: 'Fichier invalide: tableau de captures manquant',
        importConfirm: 'Importer {count} captures ?\n\nCela remplacera les données existantes.\nAssurez-vous d\'avoir exporté les données actuelles d\'abord.'
    },

    // Map
    map: {
        title: 'carte des sessions',
        sessions: 'sessions',
        catches: 'captures',
        noSessions: 'Aucune session avec coordonnées GPS',
        completeSession: 'Complétez une session de pêche pour la voir sur la carte',
        unknownLocation: 'Lieu inconnu',
        noCatches: 'Aucune capture',
        legend: {
            zeroCatches: '0 captures',
            oneFour: '1-4',
            fiveEight: '5-8',
            ninePlus: '9+'
        }
    },

    // Registered sessions
    sessions: {
        title: 'sessions enregistrées',
        noSessions: 'Aucune session terminée',
        noMatchingFilters: 'Aucune session ne correspond aux filtres',
        of: 'de',
        start: 'Début',
        end: 'Fin',
        time: 'Horaire',
        lat: 'Lat',
        lng: 'Lng',
        catches: 'Captures',
        delete: 'Supprimer session',
        deleteSession: 'Supprimer session',
        deleteConfirm: 'Supprimer la session à {location} ? Les captures associées NE seront PAS supprimées.',
        deleted: 'Session supprimée',
        prev: 'Préc',
        next: 'Suiv'
    },

    // Catch registry
    registry: {
        title: 'registre des captures',
        noCatches: 'Aucune capture enregistrée',
        noMatchingFilters: 'Aucune capture ne correspond aux filtres',
        editCatch: 'Modifier capture',
        deleteCatch: 'Supprimer',
        deleteConfirm: 'Supprimer la capture de {species} ?',
        deleted: 'Capture supprimée',
        updated: 'Capture mise à jour',
        save: 'Enregistrer',
        cancel: 'Annuler',
        catchData: 'données de capture',
        weatherData: 'données météo'
    },

    // Charts
    charts: {
        title: 'graphiques statistiques',
        statistics: 'Statistiques des captures',
        total: 'total',
        mostCaught: 'plus capturée',
        avgWeight: 'poids moyen',
        byMonth: 'par mois',
        bySpecies: 'par espèce',
        byWind: 'par vent',
        catchesByMonth: 'Captures par mois ({count} totales)',
        totalCatches: 'totales',
        topSpecies: 'Espèces les plus capturées (top 8)',
        noCatches: 'Aucune capture enregistrée',
        catchesByWind: 'Captures par direction du vent',
        noWindData: 'Aucune donnée de vent enregistrée',
        month: 'Mois',
        species: 'Espèce',
        wind: 'Vent',
        chart: 'Graphique',
        catches: 'Captures',
        cat: 'cap.'
    },

    // Voice input
    voice: {
        title: 'Assistant Vocal',
        button: 'Assistant Vocal',
        notSupported: 'La reconnaissance vocale n\'est pas supportée par ce navigateur',
        starting: 'Démarrage de l\'assistant...',
        welcome: 'Bonjour ! Commençons à enregistrer la capture.',
        askSpecies: 'Espèce ?',
        askLength: 'Longueur ?',
        askBait: 'Appât ?',
        askConfirm: 'Enregistrer la capture ?',
        waitingSpecies: 'En attente de l\'espèce...',
        waitingLength: 'En attente de la longueur...',
        waitingBait: 'En attente de l\'appât...',
        waitingConfirm: 'Répondez oui ou non',
        waitingNewCatch: 'Dites "nouvelle capture" pour continuer',
        listening: 'À l\'écoute...',
        speaking: 'Je parle...',
        waiting: 'En attente...',
        heard: 'J\'ai entendu',
        currentData: 'Données actuelles',
        notUnderstood: 'Je n\'ai pas compris.',
        fillManually: 'Remplissez manuellement',
        catchRegistered: 'Capture enregistrée !',
        sayNewCatch: 'Dites "nouvelle capture" pour continuer',
        cancelled: 'Annulé.',
        yesOrNo: 'Répondez oui ou non',
        attempt: 'Tentative',
        error: 'Erreur - remplissez manuellement',
        closeAndFillManually: 'Fermer et remplir manuellement'
    },

    // Common
    common: {
        yes: 'Oui',
        no: 'Non',
        ok: 'OK',
        confirm: 'Confirmer',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Attention',
        info: 'Info',
        prev: 'Préc',
        next: 'Suiv',
        delete: 'Supprimer',
        of: 'de'
    },

    // Months
    months: {
        jan: 'Jan', feb: 'Fév', mar: 'Mar', apr: 'Avr',
        may: 'Mai', jun: 'Juin', jul: 'Juil', aug: 'Août',
        sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Déc',
        january: 'janvier', february: 'février', march: 'mars',
        april: 'avril', may_full: 'mai', june: 'juin',
        july: 'juillet', august: 'août', september: 'septembre',
        october: 'octobre', november: 'novembre', december: 'décembre'
    },

    // Moon phases
    moonPhases: {
        newMoon: 'nouvelle lune',
        waxingCrescent: 'premier croissant',
        firstQuarter: 'premier quartier',
        waxingGibbous: 'gibbeuse croissante',
        fullMoon: 'pleine lune',
        waningGibbous: 'gibbeuse décroissante',
        lastQuarter: 'dernier quartier',
        waningCrescent: 'dernier croissant'
    },

    // Weather conditions
    weatherConditions: {
        clear: 'dégagé',
        cloudy: 'nuageux',
        overcast: 'couvert',
        rain: 'pluie',
        storm: 'orage',
        fog: 'brouillard'
    },

    // Backup
    backup: {
        title: 'sauvegarde et cloud',
        dataSize: 'Taille des données',
        localBackup: 'Sauvegarde locale',
        export: 'Exporter',
        import: 'Importer',
        autoBackup: 'Sauvegarde automatique',
        createAutoBackup: 'Créer sauvegarde automatique',
        autoBackupHint: 'Enregistre un point de restauration local',
        cloudBackup: 'Sauvegarde cloud',
        cloudHint: 'Téléchargez le fichier et uploadez-le manuellement sur le cloud',
        history: 'Historique des sauvegardes',
        local: 'Locale',
        auto: 'Automatique',
        exportSuccess: 'Sauvegarde exportée: {catture} captures, {sessioni} sessions',
        exportError: 'Erreur lors de l\'exportation',
        restoreConfirm: 'Restaurer la sauvegarde ? Les données actuelles seront écrasées.',
        restoreSuccess: 'Restauration terminée: {catture} captures, {sessioni} sessions',
        restoreError: 'Erreur lors de la restauration',
        autoBackupSuccess: 'Sauvegarde automatique créée avec succès !',
        autoBackupError: 'Erreur lors de la sauvegarde automatique',
        cloudInstructions: 'Fichier téléchargé ! Uploadez-le manuellement sur Google Drive ou Dropbox',
        cloudError: 'Erreur lors de la sauvegarde cloud',
        deleteConfirm: 'Supprimer cette sauvegarde de l\'historique ?',
        deleted: 'Sauvegarde supprimée de l\'historique'
    },

    // Settings
    settings: {
        title: 'Paramètres',
        language: 'Langue',
        installApp: 'Installer l\'App',
        installButton: 'Installer Fish File',
        installHint: 'Ajoutez l\'app à l\'écran d\'accueil pour un accès rapide',
        appInstalled: 'App installée avec succès !'
    },

    // Units
    units: {
        title: 'Unités de Mesure',
        weight: 'Poids',
        length: 'Longueur',
        temperature: 'Température',
        timeFormat: 'Format d\'Heure',
        dateFormat: 'Format de Date'
    },

    // Privacy & Legal
    privacy: {
        title: 'Confidentialité et Données',
        privacyPolicy: 'Politique de Confidentialité',
        termsOfService: 'Conditions d\'Utilisation',
        consents: 'Gestion des Consentements',
        locationConsent: 'Consentement Localisation',
        locationDescription: 'Permet d\'enregistrer les coordonnées GPS des captures',
        microphoneConsent: 'Consentement Microphone',
        microphoneDescription: 'Permet d\'utiliser l\'assistant vocal',
        exportData: 'Exporter mes données',
        exportDataDescription: 'Téléchargez toutes vos données au format JSON',
        exportSuccess: 'Données exportées avec succès !',
        importData: 'Importer des données',
        importDataDescription: 'Restaurer les données depuis un fichier JSON exporté',
        importConfirm: 'Voulez-vous importer {{count}} captures ? Les données existantes seront remplacées.',
        importSuccess: '{{count}} captures importées avec succès !',
        importError: 'Erreur lors de l\'importation',
        invalidFile: 'Fichier invalide. Assurez-vous de sélectionner un fichier JSON exporté depuis Fish File.',
        deleteData: 'Supprimer toutes les données',
        deleteDataDescription: 'Supprime définitivement toutes vos données',
        deleteConfirm: '⚠️ ATTENTION !\n\nCette action supprimera DÉFINITIVEMENT :\n- Toutes les captures\n- Toutes les sessions\n- Toutes les listes enregistrées\n- Tous les paramètres\n\nÊtes-vous sûr de vouloir continuer ?',
        deleteConfirmFinal: 'Tapez "SUPPRIMER" pour confirmer :',
        deleteSuccess: 'Toutes les données ont été supprimées',
        deleteCancelled: 'Suppression annulée',
        consentGranted: 'Consentement accordé',
        consentDenied: 'Consentement refusé',
        consentRevoked: 'Consentement révoqué',
        permissionBlocked: 'Permission bloquée par le navigateur. Allez dans les paramètres du site (icône de cadenas) pour la débloquer.',
        consentRequired: 'Cette permission est nécessaire pour utiliser cette fonctionnalité',
        lastUpdated: 'Dernière mise à jour',
        version: 'Version'
    },

    // Sponsors
    sponsors: {
        title: 'partenaires et sponsors',
        description: 'Nos partenaires qui soutiennent Fish File et la communauté des pêcheurs',
        shops: 'Magasins de Pêche',
        associations: 'Associations',
        masters: 'Maîtres de Pêche',
        noShops: 'Aucun magasin partenaire pour le moment',
        noAssociations: 'Aucune association partenaire pour le moment',
        noMasters: 'Aucun maître partenaire pour le moment',
        becomeSponsor: 'Voulez-vous devenir partenaire de Fish File ?',
        contactUs: 'Contactez-nous',
        website: 'Site',
        call: 'Appeler',
        email: 'Email'
    },

    // Pianifica uscita
    planner: {
        title: 'planifier une sortie',
        subtitle: 'Trouvez le meilleur spot selon la météo du jour',
        settingsTitle: 'Planifier une sortie',
        settingsDescription: 'Affiche la section qui choisit le spot selon la météo',
        unavailable: 'Planifier une sortie n\'est pas disponible pour le moment. Le reste de l\'app fonctionne normalement.',
        retry: 'Réessayer',
        noSessions: 'Enregistrez au moins une session de pêche pour utiliser cette fonction.',
        setupZones: 'Créez une zone de pêche et assignez-lui vos spots pour commencer.',
        manageZones: 'Gérer les zones',
        whenWhere: 'Quand et où',
        zone: 'Zone',
        date: 'Date',
        from: 'De',
        to: 'À',
        spotsInZone: '{count} spots dans cette zone',
        forecastTitle: 'Prévisions',
        resetForecast: 'Rétablir les prévisions',
        forecastHelp: 'Valeurs issues des prévisions : corrigez celles qui vous semblent fausses.',
        forecastError: 'Prévisions indisponibles : saisissez les valeurs à la main.',
        tidesTitle: 'Marées',
        tidesHelp: 'Saisissez les heures de pleine et basse mer du jour.',
        find: 'Trouver le meilleur spot',
        loadingHistory: 'Récupération de la météo passée... {done}/{total}',
        origin: {
            prev: 'PRÉV',
            mod: 'MOD',
            calc: 'CALC'
        },
        factors: {
            tAria: 'Temp. air',
            tAcqua: 'Temp. eau',
            pressione: 'Pression',
            ventoKn: 'Vent',
            ventoDir: 'Direction du vent',
            condizioni: 'Ciel',
            onde: 'Vagues',
            luna: 'Phase lunaire',
            marea: 'Marée'
        },
        tide: {
            montante: 'Montante',
            stanca: 'Étale (eau calme)',
            calante: 'Descendante',
            alta1: '1re pleine mer',
            alta2: '2e pleine mer',
            bassa1: '1re basse mer',
            bassa2: '2e basse mer'
        },
        reliability: {
            alta: 'Fiabilité élevée',
            media: 'Fiabilité moyenne',
            bassa: 'Données insuffisantes - indicatif'
        },
        prey: {
            fromSimilar: 'Prises et appâts avec une météo similaire :',
            fromSpot: 'Prises et appâts en général sur ce spot :',
            withBait: 'avec'
        },
        spotTypes: {
            mare: 'Mer',
            lago: 'Lac',
            fiume: 'Rivière'
        },
        results: {
            fewDataGroup: 'Spots avec peu de données similaires (indicatif, score peu fiable) :',
            back: 'Modifier la météo',
            basedOn: 'Calculé sur {count} sessions enregistrées dans la zone.',
            modified: 'Valeurs corrigées à la main : {fields}.',
            noSimilar: 'Aucune session avec une météo similaire sur {count} sorties : score basé sur la moyenne du spot.',
            similarSummary: '{count} sessions avec une météo similaire : moyenne {avg} prises, {empty}% sorties bredouilles.',
            farForecast: 'Prévision à plus de 3 jours : vent et vagues peuvent changer. Revérifiez la veille.',
            disclaimer: 'Le score compare la météo avec votre historique : c\'est une indication, pas une certitude.'
        },
        detail: {
            back: 'Classement',
            comparison: 'Comparaison avec vos {count} meilleures journées ici',
            noBest: 'Aucune sortie avec prises et météo enregistrée sur ce spot.',
            factor: 'Facteur',
            forecast: 'Prévu',
            best: 'Meilleures journées',
            spotWeather: 'Météo pour ce spot',
            resetSpot: 'Rétablir',
            spotWeatherHelp: 'Corrigez seulement si la météo ici diffère du reste de la zone.',
            whatWorked: 'Prises et appâts',
            species: 'Espèces',
            baits: 'Appâts',
            bestHours: 'Meilleures heures',
            sessionsUsed: 'Sessions similaires utilisées',
            noSessions: 'Aucune session avec une météo similaire.',
            catches: '{count} prises',
            withoutWeather: '{count} sorties exclues faute de données météo.'
        },
        zones: {
            title: 'Zones de pêche',
            help: 'Regroupez les spots proches (20-30 km) dans une zone : ils partageront la même météo. Le type de spot sert pour les vagues et les marées.',
            placeholder: 'ex : Côte pontine',
            add: 'Ajouter une zone',
            empty: 'Aucune zone créée.',
            spotCount: '{count} spots',
            confirmDelete: 'Supprimer la zone "{name}" ? Ses spots n\'auront plus de zone.',
            spots: 'Spots enregistrés',
            noSpots: 'Aucun spot dans les sessions enregistrées.',
            outings: '{count} sorties',
            zone: 'Zone',
            type: 'Type',
            noZone: 'Aucune zone',
            done: 'Terminé'
        }
    },

    // Condivisione dati tra utenti
    sharing: {
        title: 'Partage de données',
        description: 'Échangez sessions et prises avec d\'autres pêcheurs. Les données reçues restent séparées des vôtres : elles apparaissent sur la carte (triangles) et dans les sessions enregistrées et comptent dans la planification, mais pas dans vos statistiques ni dans votre sauvegarde.',
        yourName: 'Votre nom (visible par ceux qui reçoivent vos données)',
        namePlaceholder: 'ex : Marc',
        nameRequired: 'Saisissez votre nom avant de partager.',
        nothingToShare: 'Vous n\'avez pas encore de sessions à partager.',
        export: 'Partager mes données',
        exportHelp: 'Crée un fichier avec toutes vos sessions et prises, coordonnées GPS comprises. Envoyez-le comme vous voulez (WhatsApp, e-mail, AirDrop).',
        exported: 'Fichier créé : {sessions} sessions, {catches} prises.',
        'import': 'Importer des données partagées',
        importHelp: 'Ajoute les données d\'un autre utilisateur sans toucher aux vôtres. Un fichier mis à jour de la même personne remplace ses données précédentes.',
        imported: 'Données de {name} importées : {sessions} sessions, {catches} prises.',
        updated: 'Données de {name} mises à jour : {sessions} sessions, {catches} prises.',
        receivedTitle: 'Données reçues',
        noneReceived: 'Aucune donnée reçue.',
        counts: '{sessions} sessions, {catches} prises',
        confirmDelete: 'Supprimer toutes les données reçues de {name} ?',
        deleted: 'Données de {name} supprimées.',
        errors: {
            formato: 'Fichier non valide : ce n\'est pas un fichier de partage Fish File.',
            backup: 'C\'est une sauvegarde complète : pour la restaurer utilisez "Importer" dans Backup & cloud.',
            proprio: 'Ce fichier contient vos propres données.',
            vuoto: 'Le fichier ne contient aucune session.',
            storage: 'Mémoire pleine : supprimez des données reçues et réessayez.'
        },
        mapLegend: 'données partagées',
        sharedBy: 'Partagée par {name}',
        originFilter: 'Origine des données',
        originAll: 'Toutes les données (miennes et partagées)',
        originMine: 'Seulement mes données',
        originShared: 'Seulement données partagées',
        originPerson: 'Partagées par {name}',
        weightsConverted: '{count} poids saisis en kg ont été convertis en grammes.',
        sharedSpot: '(données partagées)',
        basedOnShared: 'Calculé sur {count} sessions de la zone, dont {shared} partagées par d\'autres utilisateurs.',
        sharedTag: '(partagée)'
    }
}

export default fr
