/**
 * Proje Servis Katmanı
 * Projelerle ilgili iş mantığı (business logic) bu katmanda handleı edilir
 * Model ve Controller arasında ara katman olarak görev yapar
 */

const Project = require('../models/Project');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../constants/errors');

/**
 * Yeni proje oluştur (sadece admin)
 * @param {Number} adminId - Admin kullanıcının ID'si
 * @param {Object} projectData - Proje bilgileri {name, description}
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function createProject(adminId, projectData) {
  try {
    const { name, description } = projectData;

    // Yeni proje oluştur
    const projectId = await Project.create({
      name,
      description,
      created_by: adminId,
      status: 'active'
    });

    // Oluşturulan proje bilgilerini döndür
    const newProject = await Project.findById(projectId);

    return {
      success: true,
      data: newProject,
      statusCode: HTTP_STATUS.CREATED
    };
  } catch (error) {
    console.error('Proje oluşturma hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Tüm projeleri listele
 * @returns {Object} {success: Boolean, data: Array, error: String, statusCode: Number}
 */
async function getAllProjects() {
  try {
    const projects = await Project.findAll();

    return {
      success: true,
      data: projects,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Projeler listeleme hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * ID ile proje bul
 * @param {Number} projectId - Proje ID'si
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function getProjectById(projectId) {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return {
        success: false,
        error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    return {
      success: true,
      data: project,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Proje bulma hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Projeyi güncelle
 * @param {Number} projectId - Proje ID'si
 * @param {Object} updateData - Güncellenecek bilgiler {name, description, status}
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function updateProject(projectId, updateData) {
  try {
    // Proje var mı kontrol et
    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
      return {
        success: false,
        error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Projeyi güncelle
    await Project.update(projectId, updateData);

    // Güncellenmiş proje bilgilerini döndür
    const updatedProject = await Project.findById(projectId);

    return {
      success: true,
      data: updatedProject,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Proje güncelleme hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Projeyi sil
 * @param {Number} projectId - Silinecek proje ID'si
 * @returns {Object} {success: Boolean, error: String, statusCode: Number}
 */
async function deleteProject(projectId) {
  try {
    // Proje var mı kontrol et
    const existingProject = await Project.findById(projectId);
    if (!existingProject) {
      return {
        success: false,
        error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Projeyi sil
    await Project.delete(projectId);

    return {
      success: true,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Proje silme hatası:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
};
