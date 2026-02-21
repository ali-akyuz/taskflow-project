/**
 * Görev Servis Katmanı
 * Görevlerle ilgili iş mantığı (business logic) bu katmanda handleı edilir
 * Model ve Controller arasında ara katman olarak görev yapar
 */

const { Task, Project, User } = require('../models');
const { ERROR_MESSAGES, HTTP_STATUS } = require('../constants/errors');

/**
 * Yeni görev oluştur (sadece admin)
 * @param {Number} adminId - Admin kullanıcının ID'si
 * @param {Object} taskData - Görev bilgileri {title, description, projectId, assignedTo}
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function createTask(adminId, taskData) {
  try {
    const { title, description, projectId, assignedTo } = taskData;

    // Yeni görev oluştur
    const newTask = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      status: 'pending',
      priority: 'medium'
    });

    // Görev detaylarını include ile birlikte döndür
    const task = await Task.findByPk(newTask.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'email'] }
      ]
    });

    return {
      success: true,
      data: task,
      statusCode: HTTP_STATUS.CREATED
    };
  } catch (error) {
    console.error('Görev oluşturma hatası:', error.message);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Tüm görevleri listele (admin için)
 * @returns {Object} {success: Boolean, data: Array, error: String, statusCode: Number}
 */
async function getAllTasks() {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      success: true,
      data: tasks,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Tüm görevleri listeleme hatası:', error.message);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * ID ile görev bul
 * @param {Number} taskId - Görev ID'si
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function getTaskById(taskId) {
  try {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'email'] }
      ]
    });

    if (!task) {
      return {
        success: false,
        error: ERROR_MESSAGES.TASK_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    return {
      success: true,
      data: task,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Görev bulma hatası:', error.message);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Belirtilen projenin tüm görevlerini listele
 * @param {Number} projectId - Proje ID'si
 * @returns {Object} {success: Boolean, data: Array, error: String, statusCode: Number}
 */
async function getTasksByProjectId(projectId) {
  try {
    const tasks = await Task.findAll({
      where: { projectId },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      success: true,
      data: tasks,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Proje görevleri listeleme hatası:', error.message);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Bir çalışana atanmış tüm görevleri listele
 * @param {Number} employeeId - Çalışan ID'si
 * @returns {Object} {success: Boolean, data: Array, error: String, statusCode: Number}
 */
async function getTasksByEmployeeId(employeeId) {
  try {
    const tasks = await Task.findAll({
      where: { assignedTo: employeeId },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      success: true,
      data: tasks,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Çalışan görevleri listeleme hatası:', error.message);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Görev'i güncelle
 * @param {Number} taskId - Görev ID'si
 * @param {Object} updateData - Güncellenecek bilgiler {title, description, status, priority, projectId, assignedTo}
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function updateTask(taskId, updateData) {
  try {
    // Görev var mı kontrol et
    const task = await Task.findByPk(taskId);
    if (!task) {
      return {
        success: false,
        error: ERROR_MESSAGES.TASK_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Güncelle
    if (updateData.title) task.title = updateData.title;
    if (updateData.description !== undefined) task.description = updateData.description;
    if (updateData.status !== undefined) task.status = updateData.status;
    if (updateData.priority) task.priority = updateData.priority;
    if (updateData.projectId) task.projectId = updateData.projectId;
    if (updateData.assignedTo || updateData.assigneeId) {
      task.assignedTo = updateData.assignedTo || updateData.assigneeId;
    }

    await task.save();

    // Güncellenmiş görev bilgilerini include ile döndür
    const updatedTask = await Task.findByPk(taskId, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'email'] }
      ]
    });

    return {
      success: true,
      data: updatedTask,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Görev güncelleme hatası:', error.message);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

/**
 * Görev'i sil
 * @param {Number} taskId - Silinecek görev ID'si
 * @returns {Object} {success: Boolean, error: String, statusCode: Number}
 */
async function deleteTask(taskId) {
  try {
    // Görev var mı kontrol et
    const task = await Task.findByPk(taskId);
    if (!task) {
      return {
        success: false,
        error: ERROR_MESSAGES.TASK_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Görev'i sil
    await task.destroy();

    return {
      success: true,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Görev silme hatası:', error.message);
    return {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
    };
  }
}

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksByProjectId,
  getTasksByEmployeeId,
  updateTask,
  deleteTask
};
