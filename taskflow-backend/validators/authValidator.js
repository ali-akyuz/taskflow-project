/**
 * Authentication Validator
 * Kimlik doğrulama isteklerinin geçerliliğini kontrol eder
 */

const { ERROR_MESSAGES } = require('../constants/errors');

/**
 * Kayıt isteğini doğrula
 * @param {Object} data - {username, email, password}
 * @returns {Object} {valid: Boolean, error: String|null}
 */
function validateRegisterRequest({ username, email, password }) {
    // Zorunlu alanlar kontrolü
    if (!username || !email || !password) {
        return { valid: false, error: ERROR_MESSAGES.MISSING_FIELDS };
    }

    // Kullanıcı adı uzunluk kontrolü
    if (username.trim().length < 3) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_USERNAME };
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
    }

    // Şifre uzunluk kontrolü
    if (password.length < 6) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_PASSWORD };
    }

    return { valid: true, error: null };
}

/**
 * Giriş isteğini doğrula
 * @param {Object} data - {email, password}
 * @returns {Object} {valid: Boolean, error: String|null}
 */
function validateLoginRequest({ email, password }) {
    // Zorunlu alanlar kontrolü
    if (!email || !password) {
        return { valid: false, error: ERROR_MESSAGES.MISSING_FIELDS };
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
    }

    return { valid: true, error: null };
}

module.exports = {
    validateRegisterRequest,
    validateLoginRequest
};
