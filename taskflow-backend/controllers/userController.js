/**
 * User Controller
 * HTTP request/response yönetimini gerçekleştirir
 * İş mantığı (business logic) UserService'de yer alır
 */

const userService = require('../services/userService');
const { HTTP_STATUS } = require('../constants/errors');

/**
 * Yeni çalışan oluştur (sadece admin)
 * POST /api/users
 * Body: {username, email, password, name, role}
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    const result = await userService.createUser({
      username,
      email,
      password,
      name,
      role
    });

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Çalışan başarıyla oluşturuldu' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Çalışan oluşturma hatası:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Çalışan oluşturulurken bir hata oluştu'
    });
  }
};

/**
 * Tüm kullanıcıları listele (sadece admin)
 * GET /api/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers();
    return res.status(result.statusCode).json({
      success: result.success,
      count: result.data ? result.data.length : 0,
      data: result.data || []
    });
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Kullanıcılar listelenirken bir hata oluştu'
    });
  }
};

/**
 * Çalışanları listele (sadece admin) - sadece employee role'ü olanlar
 * GET /api/users/employees
 */
exports.getEmployees = async (req, res) => {
  try {
    const result = await userService.getEmployees();
    return res.status(result.statusCode).json({
      success: result.success,
      count: result.data ? result.data.length : 0,
      data: result.data || []
    });
  } catch (error) {
    console.error('Çalışan listeleme hatası:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Çalışanlar listelenirken bir hata oluştu'
    });
  }
};

/**
 * Belirli bir kullanıcıyı getir (sadece admin)
 * GET /api/users/:id
 */
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.getUserById(id);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Başarılı' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Kullanıcı getirilirken bir hata oluştu'
    });
  }
};

/**
 * Kullanıcı güncelle (sadece admin)
 * PUT /api/users/:id
 * Body: {username?, email?, name?, role?}
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, name, role } = req.body;

    const result = await userService.updateUser(id, {
      username,
      email,
      name,
      role
    });

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Kullanıcı başarıyla güncellendi' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Kullanıcı güncellenirken bir hata oluştu'
    });
  }
};

/**
 * Kullanıcı sil (sadece admin)
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Kullanıcı başarıyla silindi' : result.error,
      data: null
    });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Kullanıcı silinirken bir hata oluştu'
    });
  }
};
