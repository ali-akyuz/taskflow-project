/**
 * Role-Based Authorization Middleware
 * Kullanıcı rollerine göre belirli endpoint'lere erişim kontrolü yapılır
 * Bu middleware authenticate middleware'den sonra kullanılmalıdır
 */

const { ERROR_MESSAGES, HTTP_STATUS } = require('../constants/errors');

/**
 * Belirli rollere erişim izni verilmesini sağlayan middleware factory'si
 * @param {...String} roles - İzin verilen roller (örn: 'admin', 'employee')
 * @returns {Function} Middleware fonksiyonu
 * 
 * Kullanım:
 * router.post('/admin-only', authenticate, authorize('admin'), controller);
 * router.get('/team-access', authenticate, authorize('admin', 'employee'), controller);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Önce authenticate middleware'inin çalıştığından ve req.user'ın var olduğundan emin ol
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    // Kullanıcının rolü izin verilen roller arasında mı kontrol et
    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN
      });
    }

    // Yetki var, sonraki middleware'e geç
    next();
  };
};

module.exports = authorize;
