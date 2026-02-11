/**
 * User Servis Katmanı
 * Kullanıcı yönetimi iş mantığı (business logic) bu katmanda yer alır
 * Model ve Controller arasında ara katman olarak görev yapar
 */

const User = require('../models/User');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../constants/errors');
const { pool } = require('../config/database');

/**
 * Yeni kullanıcı oluştur
 * @param {Object} userData - Kullanıcı bilgileri {username, email, password, name, role}
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function createUser(userData) {
  try {
    const { username, email, password, name, role } = userData;

    // Email kontrol
    const existing = await User.findByEmail(email);
    if (existing) {
      return {
        success: false,
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        statusCode: HTTP_STATUS.CONFLICT
      };
    }

    // Kullanıcı oluştur
    const userId = await User.create({
      username,
      email,
      password,
      name,
      role: role === 'admin' ? 'admin' : 'employee'
    });

    const user = await User.findById(userId);

    return {
      success: true,
      data: user,
      statusCode: HTTP_STATUS.CREATED
    };
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Tüm kullanıcıları listele
 * @returns {Object} {success: Boolean, data: Array, error: String, statusCode: Number}
 */
async function getAllUsers() {
  try {
    const users = await User.findAll();
    return {
      success: true,
      data: users,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Kullanıcıları listeleme hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Çalışanları listele (employee role'üne sahip olanlar)
 * @returns {Object} {success: Boolean, data: Array, error: String, statusCode: Number}
 */
async function getEmployees() {
  try {
    const users = await User.findAll();
    const employees = users.filter(u => u.role === 'employee');
    return {
      success: true,
      data: employees,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Çalışanları listeleme hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * ID ile kullanıcı getir
 * @param {Number} userId - Kullanıcı ID'si
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function getUserById(userId) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    return {
      success: true,
      data: user,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Kullanıcı güncelle
 * @param {Number} userId - Kullanıcı ID'si
 * @param {Object} updateData - Güncellenecek veriler {username?, email?, name?, role?}
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function updateUser(userId, updateData) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Email değiştiriliyorsa kontrol et
    if (updateData.email && updateData.email !== user.email) {
      const existing = await User.findByEmail(updateData.email);
      if (existing) {
        return {
          success: false,
          error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
          statusCode: HTTP_STATUS.CONFLICT
        };
      }
    }

    // Güncelleme bilgilerini hazırla
    const dataToUpdate = {};
    if (updateData.username) dataToUpdate.username = updateData.username;
    if (updateData.email) dataToUpdate.email = updateData.email;
    if (updateData.name) dataToUpdate.name = updateData.name;
    if (updateData.role) dataToUpdate.role = updateData.role === 'admin' ? 'admin' : 'employee';

    // SQL update
    if (Object.keys(dataToUpdate).length > 0) {
      const setClause = Object.keys(dataToUpdate).map(key => `${key} = ?`).join(', ');
      const values = Object.values(dataToUpdate);
      values.push(userId);

      await pool.execute(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values
      );
    }

    const updatedUser = await User.findById(userId);

    return {
      success: true,
      data: updatedUser,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Kullanıcı sil
 * @param {Number} userId - Silinecek kullanıcı ID'si
 * @returns {Object} {success: Boolean, error: String, statusCode: Number}
 */
async function deleteUser(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Ana admin'i silmeyi engelle
    if (user.role === 'admin' && userId == 1) {
      return {
        success: false,
        error: 'Ana admin silinemez',
        statusCode: HTTP_STATUS.FORBIDDEN
      };
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    return {
      success: true,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getEmployees,
  getUserById,
  updateUser,
  deleteUser
};
