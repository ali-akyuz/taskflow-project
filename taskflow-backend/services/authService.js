/**
 * Kimlik Doğrulama Servis Katmanı
 * Giriş ve kayıt işlemlerine ait iş mantığı (business logic) bu katmanda yer alır
 * Model ve Controller arasında bir ara katman olarak görev yapar
 */

const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../constants/errors');

/**
 * Kullanıcı kaydı (sadece admin tarafından yapılabilir)
 * @param {Object} userData - Kullanıcı bilgileri {username, email, password, role}
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function registerUser(userData) {
  try {
    const { username, email, password, role } = userData;

    // Kullanıcı zaten var mı kontrol et
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return {
        success: false,
        error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        statusCode: HTTP_STATUS.CONFLICT
      };
    }

    // Yeni kullanıcı oluştur
    const userId = await User.create({
      username,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'employee'
    });

    // Oluşturulan kullanıcı bilgilerini geri dön
    const newUser = await User.findById(userId);

    return {
      success: true,
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      statusCode: HTTP_STATUS.CREATED
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Kullanıcı girişi
 * @param {String} email - Kullanıcı email'i
 * @param {String} password - Kullanıcı şifresi
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function loginUser(email, password) {
  try {
    // Kullanıcıyı email ile bul
    const user = await User.findByEmail(email);
    
    // Kullanıcı bulunamadı veya şifre yanlış
    if (!user || !(await User.comparePassword(password, user.password))) {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_CREDENTIALS,
        statusCode: HTTP_STATUS.UNAUTHORIZED
      };
    }

    // JWT token oluştur
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Kullanıcı bilgilerini ID ile getir
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
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserById
};
