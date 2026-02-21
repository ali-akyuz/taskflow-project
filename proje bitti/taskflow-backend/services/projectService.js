/**
 * Proje Servis Katmanı
 * Projelerle ilgili iş mantığı (business logic) bu katmanda handleı edilir
 * Model ve Controller arasında ara katman olarak görev yapar
 */

const { Project, User, Task } = require('../models');
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
    const newProject = await Project.create({
      name,
      description,
      createdBy: adminId,
      status: 'active'
    });

    // Proje detaylarını include ile birlikte döndür
    const project = await Project.findByPk(newProject.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'email'] }]
    });

    return {
      success: true,
      data: project,
      statusCode: HTTP_STATUS.CREATED
    };
  } catch (error) {
    console.error('Proje oluşturma hatası:', error.message);
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
    const projects = await Project.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    return {
      success: true,
      data: projects,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Projeler listeleme hatası:', error.message);
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
    const project = await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] },
        { model: Task, as: 'tasks' }
      ]
    });

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
    console.error('Proje bulma hatası:', error.message);
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
    const project = await Project.findByPk(projectId);
    if (!project) {
      return {
        success: false,
        error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Güncelle
    if (updateData.name) project.name = updateData.name;
    if (updateData.description !== undefined) project.description = updateData.description;
    if (updateData.status) project.status = updateData.status;

    await project.save();

    // Güncellenmiş proje bilgilerini include ile döndür
    const updatedProject = await Project.findByPk(projectId, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'email'] }]
    });

    return {
      success: true,
      data: updatedProject,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Proje güncelleme hatası:', error.message);
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
    const project = await Project.findByPk(projectId);
    if (!project) {
      return {
        success: false,
        error: ERROR_MESSAGES.PROJECT_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Projeyi sil (ilişkili tasks otomatik silinir!)
    await project.destroy();

    return {
      success: true,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Proje silme hatası:', error.message);
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
