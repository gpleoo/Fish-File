/**
 * English translations
 */
const en = {
    // App general
    app: {
        title: 'Fish File',
        subtitle: 'record your fishing trips',
        catchesSaved: '{count} catches saved',
        version: 'Fish File v1.0 - 2025 Giampietro Leonoro',
        language: 'Language'
    },

    // Session
    session: {
        title: 'fishing session',
        start: 'start session',
        end: 'end session',
        active: 'active session',
        location: 'location',
        locationPlaceholder: 'e.g.: pier, beach...',
        latitude: 'latitude',
        longitude: 'longitude',
        getGPS: 'GPS',
        gpsAcquired: 'GPS position acquired!',
        gpsAccuracy: 'Accuracy: ±{meters}m',
        gpsError: 'GPS Error',
        gpsNotSupported: 'Geolocation not supported by your browser!',
        permissionDenied: 'Permission denied.',
        positionUnavailable: 'Position unavailable.',
        timeout: 'Timeout expired.',
        unknownError: 'Unknown error.',
        fillAllFields: 'Fill all fields!',
        invalidCoordinates: 'Invalid coordinates',
        startedWithWeather: 'Session started with weather data!',
        startedNoWeather: 'Session started. Weather data unavailable, fill it manually in the weather section.'
    },

    // Catch form
    catch: {
        title: 'new catch',
        date: 'date',
        time: 'time',
        species: 'species',
        speciesPlaceholder: 'select or type...',
        weight: 'weight (g)',
        weightLabel: 'weight',
        length: 'length (cm)',
        lengthLabel: 'length',
        bait: 'bait',
        baitPlaceholder: 'select or type...',
        rod: 'rod',
        leader: 'leader',
        hook: 'hook',
        sinker: 'sinker',
        notes: 'notes',
        notesPlaceholder: 'notes about the catch...',
        add: 'add catch',
        added: 'Catch recorded successfully!',
        startSessionFirst: 'Start a fishing session first',
        enterSpecies: 'Enter the species of the catch'
    },

    // Weather form
    weather: {
        title: 'weather data',
        subtitle: 'optional data but useful for analysis - you can edit them anytime',
        optional: 'Weather data is optional but useful for analysis',
        refresh: 'Refresh Weather from GPS',
        refreshFromGPS: 'Refresh Weather from GPS',
        loading: 'Loading...',
        temperature: 'temperature (°C)',
        temperatureLabel: 'temperature',
        waterTemp: 'water temp. (°C)',
        waterTempLabel: 'water temp.',
        pressure: 'pressure (hPa)',
        pressureLabel: 'pressure',
        wind: 'wind (knots)',
        windLabel: 'wind',
        windDirection: 'wind direction',
        conditions: 'conditions',
        moonPhase: 'moon phase',
        highTide: 'high tide',
        lowTide: 'low tide',
        waveHeight: 'wave height (cm)',
        waveFrequency: 'wave frequency (sec)',
        select: 'select...',
        fetchingWeather: 'Fetching weather data...',
        weatherUpdated: 'Weather data updated!',
        weatherUnavailable: 'Weather data unavailable. Enter it manually.',
        enterGPSFirst: 'Enter GPS coordinates first'
    },

    // Management section
    management: {
        title: 'management',
        locations: 'locations',
        species: 'species',
        baits: 'baits',
        rods: 'rods',
        leaders: 'leaders',
        hooks: 'hooks',
        sinkers: 'sinkers',
        add: 'add',
        edit: 'edit',
        delete: 'delete',
        save: 'save',
        cancel: 'cancel',
        emptyName: 'Name cannot be empty!',
        alreadyExists: 'This entry already exists!'
    },

    // Analysis section
    analysis: {
        title: 'analyze data',
        noCatches: 'no catches recorded',
        totalCatches: 'total catches',
        mostCaught: 'most caught species',
        avgWeight: 'average weight',
        filters: 'filters',
        resetFilters: 'reset filters',
        allYears: 'all years',
        allMonths: 'all months',
        allSpecies: 'all species',
        allLocations: 'all locations',
        allWindDirections: 'all wind directions',
        allConditions: 'all conditions',
        allMoonPhases: 'all moon phases',
        export: 'export',
        import: 'import',
        exportSuccess: 'Data exported successfully!',
        importSuccess: 'Imported {count} catches!',
        nothingToExport: 'No catches to export!',
        invalidFile: 'Invalid file: missing catches array',
        importConfirm: 'Import {count} catches?\n\nThis will replace existing data.\nMake sure you exported current data first.',
        importError: 'Error reading JSON file'
    },

    // Map
    map: {
        title: 'sessions map',
        sessions: 'sessions',
        catches: 'catches',
        noSessions: 'No sessions with GPS coordinates',
        completeSession: 'Complete a fishing session to see it on the map',
        unknownLocation: 'Unknown location',
        noCatches: 'No catches',
        legend: {
            zeroCatches: '0 catches',
            oneFour: '1-4',
            fiveEight: '5-8',
            ninePlus: '9+'
        }
    },

    // Registered sessions
    sessions: {
        title: 'recorded sessions',
        noSessions: 'No completed sessions',
        noMatchingFilters: 'No sessions match the filters',
        of: 'of',
        start: 'Start',
        end: 'End',
        time: 'Time',
        lat: 'Lat',
        lng: 'Lng',
        catches: 'Catches',
        delete: 'Delete session',
        deleteSession: 'Delete session',
        deleteConfirm: 'Delete session at {location}? Associated catches will NOT be deleted.',
        deleted: 'Session deleted',
        prev: 'Prev',
        next: 'Next'
    },

    // Catch registry
    registry: {
        title: 'catch registry',
        noCatches: 'No catches recorded',
        noMatchingFilters: 'No catches match the filters',
        editCatch: 'Edit catch',
        deleteCatch: 'Delete',
        deleteConfirm: 'Delete the {species} catch?',
        deleted: 'Catch deleted',
        updated: 'Catch updated',
        save: 'Save',
        cancel: 'Cancel',
        catchData: 'catch data',
        weatherData: 'weather data'
    },

    // Charts
    charts: {
        title: 'statistics charts',
        statistics: 'Catch statistics',
        total: 'total',
        mostCaught: 'most caught',
        avgWeight: 'avg weight',
        byMonth: 'by month',
        bySpecies: 'by species',
        byWind: 'by wind',
        catchesByMonth: 'Catches per month ({count} total)',
        totalCatches: 'total',
        topSpecies: 'Most caught species (top 8)',
        noCatches: 'No catches recorded',
        catchesByWind: 'Catches by wind direction',
        noWindData: 'No wind data recorded',
        month: 'Month',
        species: 'Species',
        wind: 'Wind',
        chart: 'Chart',
        catches: 'Catches',
        cat: 'cat.'
    },

    // Voice input
    voice: {
        listening: 'listening',
        speakNow: 'Speak now',
        stop: 'Stop',
        notSupported: 'Your browser does not support voice recognition',
        error: 'Recognition error',
        recordWithVoice: 'record with voice',
        stopRecording: 'stop recording',
        startRecording: 'Start voice recording',
        filled: 'Filled!',
        noDataRecognized: 'No data recognized. Try saying a species name.',
        micDenied: 'Microphone permission denied. Enable it in settings.',
        noAudio: 'No audio detected. Try again.',
        startError: 'Error starting voice recognition',
        examples: 'Examples: "Bass" or "Trout 40 centimeters with worm"',
        hint: 'Just say the species! Weight, length and bait are optional'
    },

    // Common
    common: {
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        confirm: 'Confirm',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',
        prev: 'Prev',
        next: 'Next',
        delete: 'Delete',
        of: 'of'
    },

    // Months
    months: {
        jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr',
        may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Aug',
        sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec',
        january: 'january', february: 'february', march: 'march',
        april: 'april', may_full: 'may', june: 'june',
        july: 'july', august: 'august', september: 'september',
        october: 'october', november: 'november', december: 'december'
    },

    // Moon phases
    moonPhases: {
        newMoon: 'new moon',
        waxingCrescent: 'waxing crescent',
        firstQuarter: 'first quarter',
        waxingGibbous: 'waxing gibbous',
        fullMoon: 'full moon',
        waningGibbous: 'waning gibbous',
        lastQuarter: 'last quarter',
        waningCrescent: 'waning crescent'
    },

    // Weather conditions
    weatherConditions: {
        clear: 'clear',
        cloudy: 'cloudy',
        overcast: 'overcast',
        rain: 'rain',
        storm: 'storm',
        fog: 'fog'
    },

    // Backup
    backup: {
        title: 'backup & cloud',
        dataSize: 'Data size',
        localBackup: 'Local backup',
        export: 'Export',
        import: 'Import',
        autoBackup: 'Automatic backup',
        createAutoBackup: 'Create auto backup',
        autoBackupHint: 'Save a local restore point',
        cloudBackup: 'Cloud backup',
        cloudHint: 'Download file and manually upload to cloud',
        history: 'Backup history',
        local: 'Local',
        auto: 'Automatic',
        exportSuccess: 'Backup exported: {catture} catches, {sessioni} sessions',
        exportError: 'Error during export',
        restoreConfirm: 'Restore backup? Current data will be overwritten.',
        restoreSuccess: 'Restore completed: {catture} catches, {sessioni} sessions',
        restoreError: 'Error during restore',
        autoBackupSuccess: 'Auto backup created successfully!',
        autoBackupError: 'Error during auto backup',
        cloudInstructions: 'File downloaded! Upload it manually to Google Drive or Dropbox',
        cloudError: 'Error during cloud backup',
        deleteConfirm: 'Delete this backup from history?',
        deleted: 'Backup deleted from history'
    },

    // Settings
    settings: {
        title: 'Settings',
        language: 'Language',
        installApp: 'Install App',
        installButton: 'Install Fish File',
        installHint: 'Add the app to your home screen for quick access',
        appInstalled: 'App installed successfully!'
    },

    // Units
    units: {
        title: 'Units of Measurement',
        weight: 'Weight',
        length: 'Length',
        temperature: 'Temperature',
        timeFormat: 'Time Format',
        dateFormat: 'Date Format'
    },

    // Voice Assistant
    voice: {
        title: 'Voice Assistant',
        button: 'Voice Assistant',
        notSupported: 'Speech recognition is not supported on this browser',
        starting: 'Starting assistant...',
        welcome: 'Hi! Let\'s start recording the catch.',
        askSpecies: 'Species?',
        askLength: 'Length?',
        askBait: 'Bait?',
        askConfirm: 'Register catch?',
        waitingSpecies: 'Waiting for species...',
        waitingLength: 'Waiting for length...',
        waitingBait: 'Waiting for bait...',
        waitingConfirm: 'Answer yes or no',
        waitingNewCatch: 'Say "new catch" to continue',
        listening: 'Listening...',
        speaking: 'Speaking...',
        waiting: 'Waiting...',
        heard: 'I heard',
        currentData: 'Current data',
        notUnderstood: 'I didn\'t understand.',
        fillManually: 'Fill in manually',
        catchRegistered: 'Catch registered!',
        sayNewCatch: 'Say "new catch" to continue',
        cancelled: 'Cancelled.',
        yesOrNo: 'Answer yes or no',
        attempt: 'Attempt',
        error: 'Error - fill in manually',
        closeAndFillManually: 'Close and fill manually'
    },

    // Privacy & Legal
    privacy: {
        title: 'Privacy & Data',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        consents: 'Manage Consents',
        locationConsent: 'Location Consent',
        locationDescription: 'Allows saving GPS coordinates of catches',
        microphoneConsent: 'Microphone Consent',
        microphoneDescription: 'Allows using the voice assistant',
        exportData: 'Export my data',
        exportDataDescription: 'Download all your data in JSON format',
        exportSuccess: 'Data exported successfully!',
        importData: 'Import data',
        importDataDescription: 'Restore data from an exported JSON file',
        importConfirm: 'Do you want to import {{count}} catches? Existing data will be replaced.',
        importSuccess: 'Successfully imported {{count}} catches!',
        importError: 'Error during import',
        invalidFile: 'Invalid file. Make sure to select a JSON file exported from Fish File.',
        deleteData: 'Delete all data',
        deleteDataDescription: 'Permanently delete all your data',
        deleteConfirm: '⚠️ WARNING!\n\nThis action will PERMANENTLY delete:\n- All catches\n- All sessions\n- All saved lists\n- All settings\n\nAre you sure you want to proceed?',
        deleteConfirmFinal: 'Type "DELETE" to confirm:',
        deleteSuccess: 'All data has been deleted',
        deleteCancelled: 'Deletion cancelled',
        consentGranted: 'Consent granted',
        consentDenied: 'Consent denied',
        consentRevoked: 'Consent revoked',
        permissionBlocked: 'Permission blocked by browser. Go to site settings (lock icon) to unblock it.',
        consentRequired: 'This permission is required to use this feature',
        lastUpdated: 'Last updated',
        version: 'Version'
    },

    // Sponsors
    sponsors: {
        title: 'partners & sponsors',
        description: 'Our partners who support Fish File and the fishing community',
        shops: 'Fishing Shops',
        associations: 'Associations',
        masters: 'Fishing Masters',
        noShops: 'No partner shops at the moment',
        noAssociations: 'No partner associations at the moment',
        noMasters: 'No partner masters at the moment',
        becomeSponsor: 'Want to become a Fish File partner?',
        contactUs: 'Contact us',
        website: 'Website',
        call: 'Call',
        email: 'Email'
    }
}

export default en
