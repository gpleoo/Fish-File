/**
 * Spanish translations
 */
const es = {
    // App general
    app: {
        title: 'Fish File',
        subtitle: 'registra tus jornadas de pesca',
        catchesSaved: '{count} capturas guardadas',
        version: 'Fish File v1.0 - 2025 Giampietro Leonoro',
        language: 'Idioma'
    },

    // Session
    session: {
        title: 'sesión de pesca',
        start: 'iniciar sesión',
        end: 'terminar sesión',
        active: 'sesión activa',
        location: 'ubicación',
        locationPlaceholder: 'ej: muelle de Valencia...',
        latitude: 'latitud',
        longitude: 'longitud',
        getGPS: 'GPS',
        gpsAcquired: '¡Posición GPS adquirida!',
        gpsAccuracy: 'Precisión: ±{meters}m',
        gpsError: 'Error GPS',
        gpsNotSupported: '¡La geolocalización no es compatible con tu navegador!',
        permissionDenied: 'Permiso denegado.',
        positionUnavailable: 'Posición no disponible.',
        timeout: 'Tiempo de espera agotado.',
        unknownError: 'Error desconocido.',
        fillAllFields: '¡Completa todos los campos!',
        invalidCoordinates: 'Coordenadas no válidas',
        startedWithWeather: '¡Sesión iniciada con datos meteorológicos!',
        startedNoWeather: 'Sesión iniciada. Datos meteorológicos no disponibles, complételos manualmente en la sección meteorológica.'
    },

    // Catch form
    catch: {
        title: 'nueva captura',
        date: 'fecha',
        time: 'hora',
        species: 'especie',
        speciesPlaceholder: 'selecciona o escribe...',
        weight: 'peso (g)',
        weightLabel: 'peso',
        length: 'longitud (cm)',
        lengthLabel: 'longitud',
        bait: 'cebo',
        baitPlaceholder: 'selecciona o escribe...',
        rod: 'caña',
        leader: 'bajo de línea',
        hook: 'anzuelo',
        sinker: 'plomo',
        notes: 'notas',
        notesPlaceholder: 'notas sobre la captura...',
        add: 'añadir captura',
        added: '¡Captura registrada con éxito!',
        startSessionFirst: 'Inicia primero una sesión de pesca',
        enterSpecies: 'Introduce la especie de la captura'
    },

    // Weather form
    weather: {
        title: 'datos meteorológicos',
        subtitle: 'datos opcionales pero útiles para análisis - puedes modificarlos en cualquier momento',
        optional: 'Los datos meteorológicos son opcionales pero útiles para el análisis',
        refresh: 'Actualizar Meteo desde GPS',
        refreshFromGPS: 'Actualizar Meteo desde GPS',
        loading: 'Cargando...',
        temperature: 'temperatura (°C)',
        temperatureLabel: 'temperatura',
        waterTemp: 'temp. agua (°C)',
        waterTempLabel: 'temp. agua',
        pressure: 'presión (hPa)',
        pressureLabel: 'presión',
        wind: 'viento (nudos)',
        windLabel: 'viento',
        windDirection: 'dirección del viento',
        conditions: 'condiciones',
        moonPhase: 'fase lunar',
        highTide: 'marea alta',
        lowTide: 'marea baja',
        waveHeight: 'altura olas (cm)',
        waveFrequency: 'frecuencia olas (seg)',
        select: 'seleccionar...',
        fetchingWeather: 'Obteniendo datos meteorológicos...',
        weatherUpdated: '¡Datos meteorológicos actualizados!',
        weatherUnavailable: 'Datos meteorológicos no disponibles. Introdúcelos manualmente.',
        enterGPSFirst: 'Introduce primero las coordenadas GPS'
    },

    // Management section
    management: {
        title: 'gestión',
        locations: 'ubicaciones',
        species: 'especies',
        baits: 'cebos',
        rods: 'cañas',
        leaders: 'bajos de línea',
        hooks: 'anzuelos',
        sinkers: 'plomos',
        add: 'añadir',
        edit: 'editar',
        delete: 'eliminar',
        save: 'guardar',
        cancel: 'cancelar',
        emptyName: '¡El nombre no puede estar vacío!',
        alreadyExists: '¡Esta entrada ya existe!'
    },

    // Analysis section
    analysis: {
        title: 'analizar datos',
        noCatches: 'ninguna captura registrada',
        totalCatches: 'capturas totales',
        mostCaught: 'especie más capturada',
        avgWeight: 'peso promedio',
        filters: 'filtros',
        resetFilters: 'restablecer filtros',
        allYears: 'todos los años',
        allMonths: 'todos los meses',
        allSpecies: 'todas las especies',
        allLocations: 'todas las ubicaciones',
        allWindDirections: 'todas las direcciones del viento',
        allWindSpeeds: 'todas las velocidades del viento',
        windCalm: 'calma (0-5 nudos)',
        windLight: 'ligero (6-15 nudos)',
        windModerate: 'moderado (16-25 nudos)',
        windStrong: 'fuerte (>25 nudos)',
        allPressures: 'todas las presiones',
        pressureLow: 'baja (<1010 hPa)',
        pressureNormal: 'normal (1010-1020 hPa)',
        pressureHigh: 'alta (>1020 hPa)',
        allConditions: 'todas las condiciones',
        allMoonPhases: 'todas las fases lunares',
        export: 'exportar',
        import: 'importar',
        exported: '¡Datos exportados con éxito!',
        imported: '¡{count} capturas importadas!',
        nothingToExport: '¡No hay capturas para exportar!',
        invalidFile: 'Archivo no válido: falta array de capturas',
        importConfirm: '¿Importar {count} capturas?\n\nEsto reemplazará los datos existentes.\nAsegúrate de haber exportado los datos actuales primero.'
    },

    // Map
    map: {
        title: 'mapa de sesiones',
        sessions: 'sesiones',
        catches: 'capturas',
        noSessions: 'Ninguna sesión con coordenadas GPS',
        completeSession: 'Completa una sesión de pesca para verla en el mapa',
        unknownLocation: 'Ubicación desconocida',
        noCatches: 'Sin capturas',
        legend: {
            zeroCatches: '0 capturas',
            oneFour: '1-4',
            fiveEight: '5-8',
            ninePlus: '9+'
        }
    },

    // Registered sessions
    sessions: {
        title: 'sesiones registradas',
        noSessions: 'Ninguna sesión completada',
        noMatchingFilters: 'Ninguna sesión coincide con los filtros',
        of: 'de',
        start: 'Inicio',
        end: 'Fin',
        time: 'Horario',
        lat: 'Lat',
        lng: 'Lng',
        catches: 'Capturas',
        delete: 'Eliminar sesión',
        deleteSession: 'Eliminar sesión',
        deleteConfirm: '¿Eliminar la sesión en {location}? Las capturas asociadas NO serán eliminadas.',
        deleted: 'Sesión eliminada',
        prev: 'Ant',
        next: 'Sig'
    },

    // Catch registry
    registry: {
        title: 'registro de capturas',
        noCatches: 'Ninguna captura registrada',
        noMatchingFilters: 'Ninguna captura coincide con los filtros',
        editCatch: 'Editar captura',
        deleteCatch: 'Eliminar',
        deleteConfirm: '¿Eliminar la captura de {species}?',
        deleted: 'Captura eliminada',
        updated: 'Captura actualizada',
        save: 'Guardar',
        cancel: 'Cancelar',
        catchData: 'datos de captura',
        weatherData: 'datos meteorológicos'
    },

    // Charts
    charts: {
        title: 'gráficos estadísticos',
        statistics: 'Estadísticas de capturas',
        total: 'total',
        mostCaught: 'más capturada',
        avgWeight: 'peso promedio',
        byMonth: 'por mes',
        bySpecies: 'por especie',
        byWind: 'por viento',
        catchesByMonth: 'Capturas por mes ({count} totales)',
        totalCatches: 'totales',
        topSpecies: 'Especies más capturadas (top 8)',
        noCatches: 'Ninguna captura registrada',
        catchesByWind: 'Capturas por dirección del viento',
        noWindData: 'Ningún dato de viento registrado',
        month: 'Mes',
        species: 'Especie',
        wind: 'Viento',
        chart: 'Gráfico',
        catches: 'Capturas',
        cat: 'cap.'
    },

    // Voice input
    voice: {
        title: 'Asistente de Voz',
        button: 'Asistente de Voz',
        notSupported: 'El reconocimiento de voz no es compatible con este navegador',
        starting: 'Iniciando asistente...',
        welcome: '¡Hola! Empecemos a registrar la captura.',
        askSpecies: '¿Especie?',
        askLength: '¿Longitud?',
        askBait: '¿Cebo?',
        askConfirm: '¿Registrar captura?',
        waitingSpecies: 'Esperando la especie...',
        waitingLength: 'Esperando la longitud...',
        waitingBait: 'Esperando el cebo...',
        waitingConfirm: 'Responde sí o no',
        waitingNewCatch: 'Di "nueva captura" para continuar',
        listening: 'Escuchando...',
        speaking: 'Hablando...',
        waiting: 'Esperando...',
        heard: 'He escuchado',
        currentData: 'Datos actuales',
        notUnderstood: 'No he entendido.',
        fillManually: 'Completa manualmente',
        catchRegistered: '¡Captura registrada!',
        sayNewCatch: 'Di "nueva captura" para continuar',
        cancelled: 'Cancelado.',
        yesOrNo: 'Responde sí o no',
        attempt: 'Intento',
        error: 'Error - completa manualmente',
        closeAndFillManually: 'Cerrar y completar manualmente'
    },

    // Common
    common: {
        yes: 'Sí',
        no: 'No',
        ok: 'OK',
        confirm: 'Confirmar',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        warning: 'Atención',
        info: 'Info',
        prev: 'Ant',
        next: 'Sig',
        delete: 'Eliminar',
        of: 'de'
    },

    // Months
    months: {
        jan: 'Ene', feb: 'Feb', mar: 'Mar', apr: 'Abr',
        may: 'May', jun: 'Jun', jul: 'Jul', aug: 'Ago',
        sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dic',
        january: 'enero', february: 'febrero', march: 'marzo',
        april: 'abril', may_full: 'mayo', june: 'junio',
        july: 'julio', august: 'agosto', september: 'septiembre',
        october: 'octubre', november: 'noviembre', december: 'diciembre'
    },

    // Moon phases
    moonPhases: {
        newMoon: 'luna nueva',
        waxingCrescent: 'creciente',
        firstQuarter: 'cuarto creciente',
        waxingGibbous: 'gibosa creciente',
        fullMoon: 'llena',
        waningGibbous: 'gibosa menguante',
        lastQuarter: 'cuarto menguante',
        waningCrescent: 'menguante'
    },

    // Weather conditions
    weatherConditions: {
        clear: 'despejado',
        cloudy: 'nublado',
        overcast: 'cubierto',
        rain: 'lluvia',
        storm: 'tormenta',
        fog: 'niebla'
    },

    // Backup
    backup: {
        title: 'backup y nube',
        dataSize: 'Tamaño de datos',
        localBackup: 'Backup local',
        export: 'Exportar',
        import: 'Importar',
        autoBackup: 'Backup automático',
        createAutoBackup: 'Crear backup automático',
        autoBackupHint: 'Guarda un punto de restauración local',
        cloudBackup: 'Backup en la nube',
        cloudHint: 'Descarga el archivo y súbelo manualmente a la nube',
        history: 'Historial de backups',
        local: 'Local',
        auto: 'Automático',
        exportSuccess: 'Backup exportado: {catture} capturas, {sessioni} sesiones',
        exportError: 'Error durante la exportación',
        restoreConfirm: '¿Restaurar el backup? Los datos actuales serán sobrescritos.',
        restoreSuccess: 'Restauración completada: {catture} capturas, {sessioni} sesiones',
        restoreError: 'Error durante la restauración',
        autoBackupSuccess: '¡Backup automático creado con éxito!',
        autoBackupError: 'Error durante el backup automático',
        cloudInstructions: '¡Archivo descargado! Súbelo manualmente a Google Drive o Dropbox',
        cloudError: 'Error durante el backup en la nube',
        deleteConfirm: '¿Eliminar este backup del historial?',
        deleted: 'Backup eliminado del historial'
    },

    // Settings
    settings: {
        title: 'Configuración',
        language: 'Idioma',
        installApp: 'Instalar App',
        installButton: 'Instalar Fish File',
        installHint: 'Añade la app a la pantalla de inicio para un acceso rápido',
        appInstalled: '¡App instalada con éxito!'
    },

    // Units
    units: {
        title: 'Unidades de Medida',
        weight: 'Peso',
        length: 'Longitud',
        temperature: 'Temperatura',
        timeFormat: 'Formato de Hora',
        dateFormat: 'Formato de Fecha'
    },

    // Privacy & Legal
    privacy: {
        title: 'Privacidad y Datos',
        privacyPolicy: 'Política de Privacidad',
        termsOfService: 'Términos de Servicio',
        consents: 'Gestión de Consentimientos',
        locationConsent: 'Consentimiento de Ubicación',
        locationDescription: 'Permite guardar las coordenadas GPS de las capturas',
        microphoneConsent: 'Consentimiento de Micrófono',
        microphoneDescription: 'Permite usar el asistente de voz',
        exportData: 'Exportar mis datos',
        exportDataDescription: 'Descarga todos tus datos en formato JSON',
        exportSuccess: '¡Datos exportados con éxito!',
        importData: 'Importar datos',
        importDataDescription: 'Restaurar datos desde un archivo JSON exportado',
        importConfirm: '¿Quieres importar {{count}} capturas? Los datos existentes serán reemplazados.',
        importSuccess: '¡{{count}} capturas importadas con éxito!',
        importError: 'Error durante la importación',
        invalidFile: 'Archivo no válido. Asegúrate de seleccionar un archivo JSON exportado desde Fish File.',
        deleteData: 'Eliminar todos los datos',
        deleteDataDescription: 'Elimina permanentemente todos tus datos',
        deleteConfirm: '⚠️ ¡ATENCIÓN!\n\nEsta acción eliminará PERMANENTEMENTE:\n- Todas las capturas\n- Todas las sesiones\n- Todas las listas guardadas\n- Todas las configuraciones\n\n¿Estás seguro de que quieres continuar?',
        deleteConfirmFinal: 'Escribe "ELIMINAR" para confirmar:',
        deleteSuccess: 'Todos los datos han sido eliminados',
        deleteCancelled: 'Eliminación cancelada',
        consentGranted: 'Consentimiento otorgado',
        consentDenied: 'Consentimiento denegado',
        consentRevoked: 'Consentimiento revocado',
        permissionBlocked: 'Permiso bloqueado por el navegador. Ve a la configuración del sitio (icono de candado) para desbloquearlo.',
        consentRequired: 'Este permiso es necesario para usar esta funcionalidad',
        lastUpdated: 'Última actualización',
        version: 'Versión'
    },

    // Sponsors
    sponsors: {
        title: 'socios y patrocinadores',
        description: 'Nuestros socios que apoyan Fish File y la comunidad de pescadores',
        shops: 'Tiendas de Pesca',
        associations: 'Asociaciones',
        masters: 'Maestros de Pesca',
        noShops: 'Ninguna tienda asociada por el momento',
        noAssociations: 'Ninguna asociación asociada por el momento',
        noMasters: 'Ningún maestro asociado por el momento',
        becomeSponsor: '¿Quieres convertirte en socio de Fish File?',
        contactUs: 'Contáctanos',
        website: 'Web',
        call: 'Llamar',
        email: 'Email'
    },

    // Pianifica uscita
    planner: {
        title: 'planificar salida',
        subtitle: 'Encuentra el mejor lugar según el tiempo del día',
        settingsTitle: 'Planificar salida',
        settingsDescription: 'Muestra la sección que elige el lugar según el tiempo',
        unavailable: 'Planificar salida no está disponible ahora. El resto de la app funciona con normalidad.',
        retry: 'Reintentar',
        noSessions: 'Registra al menos una sesión de pesca para usar esta función.',
        setupZones: 'Crea una zona de pesca y asígnale tus lugares para empezar.',
        manageZones: 'Gestionar zonas',
        whenWhere: 'Cuándo y dónde',
        zone: 'Zona',
        date: 'Fecha',
        from: 'Desde',
        to: 'Hasta',
        spotsInZone: '{count} lugares en esta zona',
        forecastTitle: 'Previsión',
        resetForecast: 'Restaurar previsión',
        forecastHelp: 'Valores de la previsión: corrige los que creas incorrectos.',
        forecastError: 'Previsión no disponible: introduce los valores a mano.',
        tidesTitle: 'Mareas',
        tidesHelp: 'Introduce las horas de pleamar y bajamar del día.',
        find: 'Encontrar el mejor lugar',
        loadingHistory: 'Recuperando tiempo histórico... {done}/{total}',
        origin: {
            prev: 'PREV',
            mod: 'MOD',
            calc: 'CALC'
        },
        factors: {
            tAria: 'Temp. aire',
            tAcqua: 'Temp. agua',
            pressione: 'Presión',
            ventoKn: 'Viento',
            ventoDir: 'Dirección viento',
            condizioni: 'Cielo',
            onde: 'Olas',
            luna: 'Fase lunar',
            marea: 'Marea'
        },
        tide: {
            montante: 'Creciente',
            stanca: 'Repunte (agua quieta)',
            calante: 'Vaciante',
            alta1: '1a pleamar',
            alta2: '2a pleamar',
            bassa1: '1a bajamar',
            bassa2: '2a bajamar'
        },
        reliability: {
            alta: 'Fiabilidad alta',
            media: 'Fiabilidad media',
            bassa: 'Datos insuficientes - solo orientativo'
        },
        prey: {
            fromSimilar: 'Capturas y cebos con tiempo similar:',
            fromSpot: 'Capturas y cebos en general en este lugar:',
            withBait: 'con'
        },
        spotTypes: {
            mare: 'Mar',
            lago: 'Lago',
            fiume: 'Río'
        },
        results: {
            fewDataGroup: 'Lugares con pocos datos similares (solo orientativo, puntuación poco fiable):',
            back: 'Modificar tiempo',
            basedOn: 'Calculado sobre {count} sesiones registradas en la zona.',
            modified: 'Valores corregidos a mano: {fields}.',
            noSimilar: 'Ninguna sesión con tiempo similar en {count} salidas: puntuación basada en la media del lugar.',
            similarSummary: '{count} sesiones con tiempo similar: media {avg} capturas, {empty}% salidas sin capturas.',
            farForecast: 'Previsión a más de 3 días: viento y olas pueden cambiar. Vuelve a comprobar el día antes.',
            disclaimer: 'La puntuación compara el tiempo con tu historial: es una indicación, no una certeza.'
        },
        detail: {
            back: 'Clasificación',
            comparison: 'Comparación con tus {count} mejores días aquí',
            noBest: 'Ninguna salida con capturas y tiempo registrado en este lugar.',
            factor: 'Factor',
            forecast: 'Previsto',
            best: 'Mejores días',
            spotWeather: 'Tiempo para este lugar',
            resetSpot: 'Restaurar',
            spotWeatherHelp: 'Corrige solo si aquí el tiempo es distinto del resto de la zona.',
            whatWorked: 'Capturas y cebos',
            species: 'Especies',
            baits: 'Cebos',
            bestHours: 'Mejores horas',
            sessionsUsed: 'Sesiones similares usadas',
            noSessions: 'Ninguna sesión con tiempo similar.',
            catches: '{count} capturas',
            withoutWeather: '{count} salidas excluidas por falta de datos meteo.'
        },
        zones: {
            title: 'Zonas de pesca',
            help: 'Agrupa los lugares cercanos (20-30 km) en una zona: tendrán el mismo tiempo. El tipo de lugar sirve para olas y mareas.',
            placeholder: 'ej: Costa pontina',
            add: 'Añadir zona',
            empty: 'Ninguna zona creada.',
            spotCount: '{count} lugares',
            confirmDelete: '¿Eliminar la zona "{name}"? Sus lugares quedarán sin zona.',
            spots: 'Lugares registrados',
            noSpots: 'Ningún lugar en las sesiones registradas.',
            outings: '{count} salidas',
            zone: 'Zona',
            type: 'Tipo',
            noZone: 'Sin zona',
            done: 'Hecho'
        }
    }
}

export default es
