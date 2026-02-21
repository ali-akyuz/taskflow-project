/**
 * User Servis Katmanı
 * Kullanıcı yönetimi iş mantığı (business logic) bu katmanda yer alır
 * Model ve Controller arasında ara katman olarak görev yapar
 */

const { User } = require('../models');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../constants/errors');

/**
 * Yeni kullanıcı oluştur
 * @param {Object} userData - Kullanıcı bilgileri {username, email, password, name, role}
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function createUser(userData) {
  try {
    const { username, email, password, name, role } = userData;

    // Email kontrol
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return {
        success: false,
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        statusCode: HTTP_STATUS.CONFLICT
      };
    }

    // Kullanıcı oluştur
    const user = await User.create({
      username,
      email,
      password,
      name,
      role: role === 'admin' ? 'admin' : 'employee'
    });

    return {
      success: true,
      data: user.toPublic(),
      statusCode: HTTP_STATUS.CREATED
    };
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error.message);
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
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const usersPublic = users.map(u => u.toPublic());

    return {
      success: true,
      data: usersPublic,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Kullanıcıları listeleme hatası:', error.message);
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
    const employees = await User.findAll({
      where: { role: 'employee' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const employeesPublic = employees.map(e => e.toPublic());

    return {
      success: true,
      data: employeesPublic,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Çalışanları listeleme hatası:', error.message);
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
    const user = await User.findByPk(userId);

    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    return {
      success: true,
      data: user.toPublic(),
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error.message);
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
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Email değiştiriliyorsa kontrol et
    if (updateData.email && updateData.email !== user.email) {
      const existing = await User.findOne({ where: { email: updateData.email } });
      if (existing) {
        return {
          success: false,
          error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
          statusCode: HTTP_STATUS.CONFLICT
        };
      }
    }

    // Güncelle
    if (updateData.username) user.username = updateData.username;
    if (updateData.email) user.email = updateData.email;
    if (updateData.name) user.name = updateData.name;
    if (updateData.role) user.role = updateData.role === 'admin' ? 'admin' : 'employee';

    await user.save();

    return {
      success: true,
      data: user.toPublic(),
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error.message);
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
    const user = await User.findByPk(userId);
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

    await user.destroy();

    return {
      success: true,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error.message);
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
