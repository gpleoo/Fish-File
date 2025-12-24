/**
 * Fuzzy string matching utility
 * Uses Levenshtein distance to find similar strings
 */

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1, str2) => {
    const m = str1.length
    const n = str2.length

    // Create distance matrix
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

    // Initialize base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    // Fill the matrix
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                )
            }
        }
    }

    return dp[m][n]
}

/**
 * Calculate similarity score between two strings (0 to 1)
 */
const similarityScore = (str1, str2) => {
    const s1 = str1.toLowerCase().trim()
    const s2 = str2.toLowerCase().trim()

    if (s1 === s2) return 1

    const maxLength = Math.max(s1.length, s2.length)
    if (maxLength === 0) return 1

    const distance = levenshteinDistance(s1, s2)
    return 1 - (distance / maxLength)
}

/**
 * Find the best match for a spoken word in a list
 * @param {string} spoken - The word spoken by the user
 * @param {string[]} list - The list of valid options
 * @param {number} threshold - Minimum similarity score (0-1), default 0.6
 * @returns {object} - { match: string|null, score: number, exactMatch: boolean }
 */
export const findBestMatch = (spoken, list, threshold = 0.6) => {
    if (!spoken || !list || list.length === 0) {
        return { match: null, score: 0, exactMatch: false }
    }

    const spokenLower = spoken.toLowerCase().trim()

    // First, check for exact match
    const exactMatch = list.find(item => item.toLowerCase() === spokenLower)
    if (exactMatch) {
        return { match: exactMatch, score: 1, exactMatch: true }
    }

    // Check if spoken word is contained in any list item or vice versa
    const containsMatch = list.find(item => {
        const itemLower = item.toLowerCase()
        return itemLower.includes(spokenLower) || spokenLower.includes(itemLower)
    })
    if (containsMatch) {
        return { match: containsMatch, score: 0.9, exactMatch: false }
    }

    // Find best fuzzy match
    let bestMatch = null
    let bestScore = 0

    for (const item of list) {
        const score = similarityScore(spokenLower, item)
        if (score > bestScore) {
            bestScore = score
            bestMatch = item
        }
    }

    // Only return match if above threshold
    if (bestScore >= threshold) {
        return { match: bestMatch, score: bestScore, exactMatch: false }
    }

    return { match: null, score: bestScore, exactMatch: false }
}

/**
 * Find the best match for a spoken phrase in a list
 * Checks each word and combinations of adjacent words
 * @param {string} spoken - The phrase spoken by the user
 * @param {string[]} list - The list of valid options
 * @param {number} threshold - Minimum similarity score (0-1), default 0.6
 * @returns {object} - { match: string|null, score: number }
 */
export const findBestMatchInPhrase = (spoken, list, threshold = 0.6) => {
    if (!spoken || !list || list.length === 0) {
        return { match: null, score: 0 }
    }

    const spokenLower = spoken.toLowerCase().trim()
    const words = spokenLower.split(/\s+/).filter(w => w.length > 1)

    let bestMatch = null
    let bestScore = 0

    // First, try exact match with full phrase
    for (const item of list) {
        if (item.toLowerCase() === spokenLower) {
            return { match: item, score: 1 }
        }
    }

    // Check each word individually
    for (const word of words) {
        const result = findBestMatch(word, list, threshold)
        if (result.match && result.score > bestScore) {
            bestScore = result.score
            bestMatch = result.match
        }
    }

    // Check combinations of adjacent words (for multi-word items like "pesce serra")
    for (let i = 0; i < words.length - 1; i++) {
        const twoWords = `${words[i]} ${words[i + 1]}`
        const result = findBestMatch(twoWords, list, threshold)
        if (result.match && result.score > bestScore) {
            bestScore = result.score
            bestMatch = result.match
        }
    }

    // Check if any list item is contained in the spoken phrase
    for (const item of list) {
        const itemLower = item.toLowerCase()
        if (spokenLower.includes(itemLower)) {
            const score = itemLower.length / spokenLower.length + 0.3 // Bonus for containment
            if (score > bestScore) {
                bestScore = Math.min(score, 0.95) // Cap at 0.95
                bestMatch = item
            }
        }
    }

    if (bestScore >= threshold) {
        return { match: bestMatch, score: bestScore }
    }

    return { match: null, score: bestScore }
}

/**
 * Parse spoken number (handles both digits and Italian words)
 * Improved to handle phrases like "quaranta centimetri", "circa 40", etc.
 * @param {string} spoken - The spoken number
 * @returns {number|null} - The parsed number or null
 */
export const parseSpokenNumber = (spoken) => {
    if (!spoken) return null

    const cleaned = spoken.toLowerCase().trim()

    // Remove common filler words
    const fillerWords = ['centimetri', 'centimetro', 'cm', 'circa', 'quasi', 'più', 'meno', 'e', 'di', 'metri', 'metro']
    let processedText = cleaned
    fillerWords.forEach(word => {
        processedText = processedText.replace(new RegExp(`\\b${word}\\b`, 'g'), ' ')
    })
    processedText = processedText.trim()

    // Try direct number parsing first
    const directNum = parseInt(processedText, 10)
    if (!isNaN(directNum) && directNum > 0 && directNum < 500) {
        return directNum
    }

    // Italian number words
    const italianNumbers = {
        'zero': 0, 'uno': 1, 'due': 2, 'tre': 3, 'quattro': 4,
        'cinque': 5, 'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9,
        'dieci': 10, 'undici': 11, 'dodici': 12, 'tredici': 13,
        'quattordici': 14, 'quindici': 15, 'sedici': 16, 'diciassette': 17,
        'diciotto': 18, 'diciannove': 19, 'venti': 20, 'ventuno': 21,
        'ventidue': 22, 'ventitre': 23, 'ventitré': 23, 'ventiquattro': 24, 'venticinque': 25,
        'ventisei': 26, 'ventisette': 27, 'ventotto': 28, 'ventinove': 29,
        'trenta': 30, 'trentuno': 31, 'trentadue': 32, 'trentatre': 33, 'trentatré': 33,
        'trentaquattro': 34, 'trentacinque': 35, 'trentasei': 36,
        'trentasette': 37, 'trentotto': 38, 'trentanove': 39,
        'quaranta': 40, 'quarantuno': 41, 'quarantadue': 42, 'quarantatre': 43, 'quarantatré': 43,
        'quarantaquattro': 44, 'quarantacinque': 45, 'quarantasei': 46,
        'quarantasette': 47, 'quarantotto': 48, 'quarantanove': 49,
        'cinquanta': 50, 'cinquantuno': 51, 'cinquantadue': 52,
        'cinquantatre': 53, 'cinquantatré': 53, 'cinquantaquattro': 54, 'cinquantacinque': 55,
        'cinquantasei': 56, 'cinquantasette': 57, 'cinquantotto': 58,
        'cinquantanove': 59, 'sessanta': 60, 'sessantuno': 61,
        'sessantadue': 62, 'sessantatre': 63, 'sessantatré': 63, 'sessantaquattro': 64,
        'sessantacinque': 65, 'sessantasei': 66, 'sessantasette': 67,
        'sessantotto': 68, 'sessantanove': 69, 'settanta': 70,
        'settantuno': 71, 'settantadue': 72, 'settantatre': 73, 'settantatré': 73,
        'settantaquattro': 74, 'settantacinque': 75, 'settantasei': 76,
        'settantasette': 77, 'settantotto': 78, 'settantanove': 79,
        'ottanta': 80, 'ottantuno': 81, 'ottantadue': 82, 'ottantatre': 83, 'ottantatré': 83,
        'ottantaquattro': 84, 'ottantacinque': 85, 'ottantasei': 86,
        'ottantasette': 87, 'ottantotto': 88, 'ottantanove': 89,
        'novanta': 90, 'novantuno': 91, 'novantadue': 92, 'novantatre': 93, 'novantatré': 93,
        'novantaquattro': 94, 'novantacinque': 95, 'novantasei': 96,
        'novantasette': 97, 'novantotto': 98, 'novantanove': 99,
        'cento': 100
    }

    // Check each word in the processed text
    const words = processedText.split(/\s+/)
    for (const word of words) {
        // Exact match
        if (italianNumbers[word] !== undefined) {
            return italianNumbers[word]
        }
    }

    // Fuzzy match for each word
    const numberWords = Object.keys(italianNumbers)
    for (const word of words) {
        if (word.length < 2) continue

        const { match } = findBestMatch(word, numberWords, 0.6)
        if (match && italianNumbers[match] !== undefined) {
            return italianNumbers[match]
        }
    }

    // Try to extract number from string (e.g., "circa 40" -> 40)
    const numberMatch = cleaned.match(/\d+/)
    if (numberMatch) {
        const num = parseInt(numberMatch[0], 10)
        if (num > 0 && num < 500) return num
    }

    return null
}

/**
 * Check if spoken word is affirmative (yes/sì)
 */
export const isAffirmative = (spoken) => {
    if (!spoken) return false
    const affirmatives = ['sì', 'si', 'yes', 'ok', 'okay', 'va bene', 'certo', 'certamente', 'esatto', 'conferma', 'confermo']
    const spokenLower = spoken.toLowerCase().trim()
    return affirmatives.some(a => spokenLower.includes(a))
}

/**
 * Check if spoken word is negative (no)
 */
export const isNegative = (spoken) => {
    if (!spoken) return false
    const negatives = ['no', 'non', 'niente', 'annulla', 'cancella', 'stop']
    const spokenLower = spoken.toLowerCase().trim()
    return negatives.some(n => spokenLower.includes(n))
}

/**
 * Check if user wants to start a new catch
 */
export const isNewCatch = (spoken) => {
    if (!spoken) return false
    const triggers = ['nuova cattura', 'nuova', 'ancora', 'altra', 'prossima', 'continua']
    const spokenLower = spoken.toLowerCase().trim()
    return triggers.some(t => spokenLower.includes(t))
}
