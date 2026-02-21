/**
 * Proje İşlemleri Validasyonu
 * Proje oluşturma ve güncelleme request'lerinin validasyonu yapılır
 */

const { ERROR_MESSAGES } = require('../constants/errors');

/**
 * Proje oluşturma request validasyonu
 * @param {Object} data - Request body'deki veriler
 * @returns {Object} {valid: Boolean, error: String}
 */
function validateCreateProjectRequest(data) {
  const { name, description } = data;

  // Zorunlu alanlar kontrolü
  if (!name) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_FIELDS
    };
  }

  // Proje adı uzunluğu kontrolü (minimum 3 karakter)
  if (name.length < 3) {
    return {
      valid: false,
      error: 'Proje adı en az 3 karakter olmalıdır'
    };
  }

  // Proje adı maksimum uzunluğu (maksimum 100 karakter)
  if (name.length > 100) {
    return {
      valid: false,
      error: 'Proje adı en fazla 100 karakter olmalıdır'
    };
  }

  return { valid: true };
}

/**
 * Proje güncelleme request validasyonu
 * @param {Object} data - Request body'deki veriler
 * @returns {Object} {valid: Boolean, error: String}
 */
function validateUpdateProjectRequest(data) {
  const { name, description, status } = data;

  // En az bir alan güncellenmelidir
  if (!name && !description && !status) {
    return {
      valid: false,
      error: 'Güncellenecek en az bir alan belirtmelisiniz'
    };
  }

  // Proje adı validasyonu (belirtilmişse)
  if (name && (name.length < 3 || name.length > 100)) {
    return {
      valid: false,
      error: 'Proje adı 3-100 karakter arasında olmalıdır'
    };
  }

  // Status validasyonu (belirtilmişse)
  const validStatuses = ['active', 'inactive', 'completed'];
  if (status && !validStatuses.includes(status)) {
    return {
      valid: false,
      error: 'Geçersiz proje durumu'
    };
  }

  return { valid: true };
}

module.exports = {
  validateCreateProjectRequest,
  validateUpdateProjectRequest
};
