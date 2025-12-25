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
    }
}

export default fr
