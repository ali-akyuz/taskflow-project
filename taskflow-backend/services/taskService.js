/**
 * Görev Servis Katmanı
 * Görevlerle ilgili iş mantığı (business logic) bu katmanda handleı edilir
 * Model ve Controller arasında ara katman olarak görev yapar
 */

const Task = require('../models/Task');
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
    const taskId = await Task.create({
      title,
      description,
      project_id: projectId,
      assigned_to: assignedTo,
      status: 'pending', // Varsayılan durum
      priority: 'medium', // Varsayılan öncelik
    });

    // Oluşturulan görev bilgilerini döndür
    const newTask = await Task.findById(taskId);

    return {
      success: true,
      data: newTask,
      statusCode: HTTP_STATUS.CREATED
    };
  } catch (error) {
    console.error('Görev oluşturma hatası:', error);
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
    const tasks = await Task.findAll();

    return {
      success: true,
      data: tasks,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Tüm görevleri listeleme hatası:', error);
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
    const task = await Task.findById(taskId);

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
    console.error('Görev bulma hatası:', error);
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
    const tasks = await Task.findByProjectId(projectId);

    return {
      success: true,
      data: tasks,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Proje görevleri listeleme hatası:', error);
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
    const tasks = await Task.findByAssignedTo(employeeId);

    return {
      success: true,
      data: tasks,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Çalışan görevleri listeleme hatası:', error);
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
 * @param {Object} updateData - Güncellenecek bilgiler {title, description, status, priority, project_id, assignee_id}
 * @returns {Object} {success: Boolean, data: Object, error: String, statusCode: Number}
 */
async function updateTask(taskId, updateData) {
  try {
    // Görev var mı kontrol et
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return {
        success: false,
        error: ERROR_MESSAGES.TASK_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Güncellenecek veriyi hazırla
    const dataToUpdate = {};
    if (updateData.title) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.priority) dataToUpdate.priority = updateData.priority;
    if (updateData.project_id) dataToUpdate.project_id = updateData.project_id;
    if (updateData.assignee_id || updateData.assigned_to) {
      dataToUpdate.assigned_to = updateData.assignee_id || updateData.assigned_to;
    }

    // Görev'i güncelle
    if (Object.keys(dataToUpdate).length > 0) {
      await Task.update(taskId, dataToUpdate);
    }

    // Güncellenmiş görev bilgilerini döndür
    const updatedTask = await Task.findById(taskId);

    return {
      success: true,
      data: updatedTask,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Görev güncelleme hatası:', error);
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
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return {
        success: false,
        error: ERROR_MESSAGES.TASK_NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND
      };
    }

    // Görev'i sil
    await Task.delete(taskId);

    return {
      success: true,
      statusCode: HTTP_STATUS.OK
    };
  } catch (error) {
    console.error('Görev silme hatası:', error);
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
