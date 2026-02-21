/**
 * Authentication Middleware
 * HTTP request'lerinin geçerli bir JWT token içerip içermediğini kontrol eder
 * Token geçerli ise kullanıcı bilgilerine request'e eklenir
 */

const { verifyToken } = require('../utils/jwt');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../constants/errors');

/**
 * JWT token'ı doğrula ve kullanıcı bilgilerini req.user'a ekle
 * @middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // HTTP Authorization header'ından Bearer token'ı al
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.MISSING_TOKEN
      });
    }

    // "Bearer " safhe kısını çıkar, sadece token kısmını al
    const token = authHeader.substring(7);

    // Token'ı doğrula (geçerliliği ve imzasını kontrol et)
    const decoded = verifyToken(token);

    // Token geçerli ise kullanıcı bilgilerini request'e ekle
    // Bu sayede sonraki middleware ve controller'lar req.user'a erişebilir
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };

    // Sonraki middleware'e geç
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN
    });
  }
};

module.exports = authenticate;
