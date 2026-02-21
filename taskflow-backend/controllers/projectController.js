/**
 * Project Controller
 * HTTP request/response yönetimini gerçekleştirir
 * İş mantığı (business logic) ProjectService'de yer alır
 */

const projectService = require('../services/projectService');
const projectValidator = require('../validators/projectValidator');
const { HTTP_STATUS } = require('../constants/errors');

/**
 * Yeni proje oluştur (sadece admin)
 * POST /api/projects
 * Body: {name, description}
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Request'i validasyon katmanında kontrol et
    const validation = projectValidator.validateCreateProjectRequest({
      name,
      description
    });

    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: validation.error
      });
    }

    // Servis katmanında proje oluştur
    const result = await projectService.createProject(req.user.id, {
      name,
      description
    });

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Proje başarıyla oluşturuldu' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Proje oluşturma hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Proje oluşturulurken bir hata oluştu'
    });
  }
};

/**
 * Tüm projeleri listele
 * GET /api/projects
 */
exports.getAllProjects = async (req, res) => {
  try {
    // Servis katmanından tüm projeleri getir
    const result = await projectService.getAllProjects();

    return res.status(result.statusCode).json({
      success: result.success,
      count: result.data ? result.data.length : 0,
      data: result.data || []
    });
  } catch (error) {
    console.error('Proje listeleme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Projeler listelenirken bir hata oluştu'
    });
  }
};

/**
 * ID ile belirtilen projeyi getir
 * GET /api/projects/:id
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Servis katmanından projeyi getir
    const result = await projectService.getProjectById(id);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Başarılı' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Proje getirme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Proje getirilirken bir hata oluştu'
    });
  }
};

/**
 * Projeyi güncelle (sadece admin)
 * PUT /api/projects/:id
 * Body: {name?, description?, status?}
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    // Request'i validasyon katmanında kontrol et
    const validation = projectValidator.validateUpdateProjectRequest({
      name,
      description,
      status
    });

    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: validation.error
      });
    }

    // Servis katmanında projeyi güncelle
    const result = await projectService.updateProject(id, {
      name,
      description,
      status
    });

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Proje başarıyla güncellendi' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Proje güncelleme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Proje güncellenirken bir hata oluştu'
    });
  }
};

/**
 * Proje sil (sadece admin)
 * DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Servis katmanında projeyi sil
    const result = await projectService.deleteProject(id);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Proje başarıyla silindi' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Proje silme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Proje silinirken bir hata oluştu'
    });
  }
};
