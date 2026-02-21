/**
 * Kimlik Doğrulama Validasyon Katmanı
 * Giriş ve kayıt işlemleri için input validasyonu yapılır
 */

const { ERROR_MESSAGES } = require('../constants/errors');

/**
 * Email format kontrolü
 * @param {String} email - Kontrol edilecek email
 * @returns {Boolean} Geçerli email ise true
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Şifre validasyonu (minimum 6 karakter)
 * @param {String} password - Kontrol edilecek şifre
 * @returns {Boolean} Geçerli şifre ise true
 */
function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Kullanıcı adı validasyonu (minimum 3 karakter)
 * @param {String} username - Kontrol edilecek kullanıcı adı
 * @returns {Boolean} Geçerli username ise true
 */
function isValidUsername(username) {
  return username && username.length >= 3;
}

/**
 * Giriş (Login) request validasyonu
 * @param {Object} data - Request body'deki veriler
 * @returns {Object} {valid: Boolean, error: String}
 */
function validateLoginRequest(data) {
  const { email, password } = data;

  // Zorunlu alanlar kontrolü
  if (!email || !password) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_FIELDS
    };
  }

  // Email format kontrolü
  if (!isValidEmail(email)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_EMAIL
    };
  }

  // Şifre kontrolü
  if (!isValidPassword(password)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_PASSWORD
    };
  }

  return { valid: true };
}

/**
 * Kayıt (Register) request validasyonu
 * @param {Object} data - Request body'deki veriler
 * @returns {Object} {valid: Boolean, error: String}
 */
function validateRegisterRequest(data) {
  const { username, email, password } = data;

  // Zorunlu alanlar kontrolü
  if (!username || !email || !password) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_FIELDS
    };
  }

  // Kullanıcı adı validasyonu
  if (!isValidUsername(username)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_USERNAME
    };
  }

  // Email format kontrolü
  if (!isValidEmail(email)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_EMAIL
    };
  }

  // Şifre kontrolü
  if (!isValidPassword(password)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_PASSWORD
    };
  }

  return { valid: true };
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  validateLoginRequest,
  validateRegisterRequest
};
