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
        length: 'length (cm)',
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
        refresh: 'Refresh Weather from GPS',
        loading: 'Loading...',
        temperature: 'temperature (°C)',
        waterTemp: 'water temp. (°C)',
        pressure: 'pressure (hPa)',
        wind: 'wind (knots)',
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
        exported: 'Data exported successfully!',
        imported: 'Imported {count} catches!',
        nothingToExport: 'No catches to export!',
        invalidFile: 'Invalid file: missing catches array',
        importConfirm: 'Import {count} catches?\n\nThis will replace existing data.\nMake sure you exported current data first.'
    },

    // Map
    map: {
        title: 'sessions map',
        sessions: 'sessions',
        catches: 'catches',
        noSessions: 'No sessions with GPS coordinates',
        completeSession: 'Complete a fishing session to see it on the map',
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
        lat: 'Lat',
        lng: 'Lng',
        catches: 'Catches',
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
        deleteConfirm: 'Delete this catch?',
        deleted: 'Catch deleted',
        updated: 'Catch updated',
        save: 'Save',
        cancel: 'Cancel'
    },

    // Charts
    charts: {
        title: 'statistics charts',
        byMonth: 'by month',
        bySpecies: 'by species',
        byWind: 'by wind',
        catchesPerMonth: 'Catches per month',
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
        listening: 'Listening...',
        speakNow: 'Speak now',
        stop: 'Stop',
        notSupported: 'Voice recognition not supported',
        error: 'Voice recognition error'
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
        info: 'Info'
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
    }
}

export default en
