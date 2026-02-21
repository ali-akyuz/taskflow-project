/**
 * Authentication Controller
 * HTTP request/response yönetimini gerçekleştirir
 * İş mantığı (business logic) AuthService'de yer alır
 */

const authService = require('../services/authService');
const authValidator = require('../validators/authValidator');
const { HTTP_STATUS } = require('../constants/errors');

/**
 * Kullanıcı kaydı (sadece admin)
 * POST /api/auth/register
 * Body: {username, email, password, role}
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Request'i validasyon katmanında kontrol et
    const validation = authValidator.validateRegisterRequest({
      username,
      email,
      password
    });

    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: validation.error
      });
    }

    // Servis katmanında kullanıcı kaydı işlemini yap
    const result = await authService.registerUser({
      username,
      email,
      password,
      role
    });

    // Servis tarafından döndürülen sonucu client'a gönder
    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success
        ? 'Kullanıcı başarıyla oluşturuldu'
        : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Kayıt hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Kullanıcı oluşturulurken bir hata oluştu'
    });
  }
};

/**
 * Kullanıcı girişi
 * POST /api/auth/login
 * Body: {email, password}
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Request'i validasyon katmanında kontrol et
    const validation = authValidator.validateLoginRequest({
      email,
      password
    });

    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: validation.error
      });
    }

    // Servis katmanında giriş işlemini yap
    const result = await authService.loginUser(email, password);

    // Servis tarafından döndürülen sonucu client'a gönder
    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Giriş başarılı' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Giriş hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Giriş yapılırken bir hata oluştu'
    });
  }
};

/**
 * Mevcut oturumdaki kullanıcı bilgilerini getir
 * GET /api/auth/me
 * Headers: {Authorization: Bearer <token>}
 */
exports.getMe = async (req, res) => {
  try {
    // Middleware'ten gelen kullanıcı ID'sini kullan
    const result = await authService.getUserById(req.user.id);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Başarılı' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Kullanıcı bilgisi hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Kullanıcı bilgileri alınırken bir hata oluştu'
    });
  }
};
