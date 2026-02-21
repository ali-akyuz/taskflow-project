/**
 * Görev İşlemleri Validasyonu
 * Görev oluşturma, güncelleme ve filtleme request'lerinin validasyonu yapılır
 */

const { ERROR_MESSAGES } = require('../constants/errors');

/**
 * Görev oluşturma request validasyonu
 * @param {Object} data - Request body'deki veriler
 * @returns {Object} {valid: Boolean, error: String}
 */
function validateCreateTaskRequest(data) {
  const { title, description, projectId, assignedTo } = data;

  // Zorunlu alanlar kontrolü
  if (!title || !projectId) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_FIELDS
    };
  }

  // Başlık uzunluğu kontrolü (minimum 3 karakter)
  if (title.length < 3) {
    return {
      valid: false,
      error: 'Görev başlığı en az 3 karakter olmalıdır'
    };
  }

  // Başlık maksimum uzunluğu (maksimum 200 karakter)
  if (title.length > 200) {
    return {
      valid: false,
      error: 'Görev başlığı en fazla 200 karakter olmalıdır'
    };
  }

  return { valid: true };
}

/**
 * Görev güncelleme request validasyonu
 * @param {Object} data - Request body'deki veriler
 * @returns {Object} {valid: Boolean, error: String}
 */
function validateUpdateTaskRequest(data) {
  const { title, description, status, priority } = data;

  // En az bir alan güncellenmelidir
  if (!title && !description && !status && !priority) {
    return {
      valid: false,
      error: 'Güncellenecek en az bir alan belirtmelisiniz'
    };
  }

  // Başlık validasyonu (belirtilmişse)
  if (title && (title.length < 3 || title.length > 200)) {
    return {
      valid: false,
      error: 'Görev başlığı 3-200 karakter arasında olmalıdır'
    };
  }

  // Status validasyonu (belirtilmişse)
  const validStatuses = ['pending', 'in_progress', 'completed'];
  if (status && !validStatuses.includes(status)) {
    return {
      valid: false,
      error: 'Geçersiz görev durumu. Geçerli değerler: pending, in_progress, completed'
    };
  }

  // Priority validasyonu (belirtilmişse)
  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return {
      valid: false,
      error: 'Geçersiz görev önceliği. Geçerli değerler: low, medium, high'
    };
  }

  return { valid: true };
}

/**
 * Görev güncelleme request validasyonu (ayrıntılı, status kontrol ile)
 * @param {Object} data - Request body'deki veriler
 * @returns {Object} {valid: Boolean, error: String}
 */
function validateUpdateTaskRequestStrict(data) {
  const { title, description, status, priority, project_id, assignee_id } = data;

  // En az bir alan güncellenmelidir
  if (!title && !description && !status && !priority && !project_id && !assignee_id) {
    return {
      valid: false,
      error: 'Güncellenecek en az bir alan belirtmelisiniz'
    };
  }

  // Başlık validasyonu (belirtilmişse)
  if (title && (title.length < 3 || title.length > 200)) {
    return {
      valid: false,
      error: 'Görev başlığı 3-200 karakter arasında olmalıdır'
    };
  }

  // Status validasyonu (belirtilmişse) - STRICT
  if (status !== undefined && status !== null) {
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return {
        valid: false,
        error: 'Geçersiz görev durumu. Geçerli değerler: pending, in_progress, completed'
      };
    }
  }

  // Priority validasyonu (belirtilmişse)
  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return {
      valid: false,
      error: 'Geçersiz görev önceliği. Geçerli değerler: low, medium, high'
    };
  }

  // project_id validasyonu (belirtilmişse)
  if (project_id && (typeof project_id !== 'number' || project_id <= 0)) {
    return {
      valid: false,
      error: 'Geçerli bir proje ID\'si belirtmelisiniz'
    };
  }

  // assignee_id validasyonu (belirtilmişse)
  if (assignee_id && (typeof assignee_id !== 'number' || assignee_id <= 0)) {
    return {
      valid: false,
      error: 'Geçerli bir kullanıcı ID\'si belirtmelisiniz'
    };
  }

  return { valid: true };
}

module.exports = {
  validateCreateTaskRequest,
  validateUpdateTaskRequest,
  validateUpdateTaskRequestStrict
};
