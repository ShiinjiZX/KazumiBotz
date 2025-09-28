/**
 * Throw message sebagai reply
 * @param {string} message - Pesan yang akan dikirim sebagai reply
 * @throws {string} Message untuk ditangkap handler sebagai reply
 */
export function throwReply(message) {
    throw message
}

/**
 * Throw dengan format error
 * @param {string} message - Pesan error
 * @throws {string} Formatted error message
 */
export function throwError(message) {
    throw `❌ ${message}`
}

/**
 * Throw dengan format warning
 * @param {string} message - Pesan warning
 * @throws {string} Formatted warning message
 */
export function throwWarning(message) {
    throw `⚠️ ${message}`
}

/**
 * Throw dengan format info
 * @param {string} message - Pesan info
 * @throws {string} Formatted info message
 */
export function throwInfo(message) {
    throw `ℹ️ ${message}`
}

/**
 * Throw dengan format success
 * @param {string} message - Pesan success
 * @throws {string} Formatted success message
 */
export function throwSuccess(message) {
    throw `✅ ${message}`
}

/**
 * Conditional throw - hanya throw jika kondisi true
 * @param {boolean} condition - Kondisi untuk check
 * @param {string} message - Pesan yang akan di-throw
 * @throws {string} Message jika kondisi true
 */
export function throwIf(condition, message) {
    if (condition) throw message
}

/**
 * Conditional throw - hanya throw jika kondisi false
 * @param {boolean} condition - Kondisi untuk check
 * @param {string} message - Pesan yang akan di-throw
 * @throws {string} Message jika kondisi false
 */
export function throwUnless(condition, message) {
    if (!condition) throw message
}

/**
 * Throw dengan format bantuan/usage
 * @param {string} command - Nama command
 * @param {string} usage - Cara penggunaan
 * @param {string} example - Contoh penggunaan
 * @throws {string} Formatted help message
 */
export function throwUsage(command, usage, example = '') {
    let message = `📖 *Cara Penggunaan:*\n${usage}`
    if (example) {
        message += `\n\n💡 *Contoh:*\n${example}`
    }
    throw message
}

/**
 * Throw untuk validasi parameter
 * @param {any} value - Value yang di-check
 * @param {string} paramName - Nama parameter
 * @param {string} expectedType - Tipe yang diharapkan
 * @throws {string} Error message jika validasi gagal
 */
export function validateParam(value, paramName, expectedType = 'string') {
    if (value === undefined || value === null) {
        throw `❌ Parameter '${paramName}' wajib diisi`
    }
    
    if (expectedType === 'number' && isNaN(Number(value))) {
        throw `❌ Parameter '${paramName}' harus berupa angka`
    }
    
    if (expectedType === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        throw `❌ Parameter '${paramName}' harus berupa email yang valid`
    }
    
    if (expectedType === 'url' && !/^https?:\/\//.test(value)) {
        throw `❌ Parameter '${paramName}' harus berupa URL yang valid`
    }
}

/**
 * Throw untuk permission check
 * @param {boolean} hasPermission - Apakah user punya permission
 * @param {string} permissionType - Tipe permission yang dibutuhkan
 * @throws {string} Permission error message
 */
export function requirePermission(hasPermission, permissionType = 'admin') {
    if (!hasPermission) {
        const messages = {
            admin: '🔒 Command ini hanya untuk admin grup',
            owner: '🔒 Command ini hanya untuk owner bot',
            premium: '💎 Command ini hanya untuk user premium',
            group: '👥 Command ini hanya bisa digunakan di grup',
            private: '💬 Command ini hanya bisa digunakan di chat private'
        }
        throw messages[permissionType] || `🔒 Anda tidak memiliki permission: ${permissionType}`
    }
}

/**
 * Throw untuk rate limiting
 * @param {number} lastUsed - Timestamp last used
 * @param {number} cooldown - Cooldown dalam detik
 * @throws {string} Cooldown message jika masih dalam cooldown
 */
export function checkCooldown(lastUsed, cooldown = 5) {
    const now = Date.now()
    const timeDiff = (now - lastUsed) / 1000
    
    if (timeDiff < cooldown) {
        const remaining = Math.ceil(cooldown - timeDiff)
        throw `⏱️ Tunggu ${remaining} detik lagi sebelum menggunakan command ini`
    }
}


global.throwReply = throwReply
global.throwError = throwError
global.throwWarning = throwWarning
global.throwInfo = throwInfo
global.throwSuccess = throwSuccess
global.throwIf = throwIf
global.throwUnless = throwUnless
global.throwUsage = throwUsage
global.validateParam = validateParam
global.requirePermission = requirePermission
global.checkCooldown = checkCooldown