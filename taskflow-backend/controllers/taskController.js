/**
 * Task Controller
 * HTTP request/response yönetimini gerçekleştirir
 * İş mantığı (business logic) TaskService'de yer alır
 */

const taskService = require('../services/taskService');
const taskValidator = require('../validators/taskValidator');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants/errors');

/**
 * Yeni görev oluştur (sadece admin)
 * POST /api/tasks
 * Body: {title, description, projectId, assignedTo}
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo } = req.body;

    // Request'i validasyon katmanında kontrol et
    const validation = taskValidator.validateCreateTaskRequest({
      title,
      description,
      projectId,
      assignedTo
    });

    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: validation.error
      });
    }

    // Servis katmanında görev oluştur
    const result = await taskService.createTask(req.user.id, {
      title,
      description,
      projectId,
      assignedTo
    });

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Görev başarıyla oluşturuldu' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Görev oluşturma hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Görev oluşturulurken bir hata oluştu'
    });
  }
};

/**
 * Mevcut kullanıcının görevlerini listele
 * GET /api/tasks/my-tasks
 */
exports.getMyTasks = async (req, res) => {
  try {
    // Çalışan sadece kendi görevlerini görebilir
    const result = await taskService.getTasksByEmployeeId(req.user.id);

    return res.status(result.statusCode).json({
      success: result.success,
      count: result.data ? result.data.length : 0,
      data: result.data || []
    });
  } catch (error) {
    console.error('Kendi görevleri listeleme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Görevler listelenirken bir hata oluştu'
    });
  }
};

/**
 * Görevleri listele (admin: tümü, employee: sadece kendi görevleri)
 * GET /api/tasks
 */
exports.getAllTasks = async (req, res) => {
  try {
    let result;

    // Admin ise tüm görevleri görebilir, employee ise sadece kendi görevlerini
    if (req.user.role === 'admin') {
      // Admin için tüm görevleri listele
      result = await taskService.getAllTasks();
    } else {
      // Employee sadece kendi görevlerini görebilir
      result = await taskService.getTasksByEmployeeId(req.user.id);
    }

    return res.status(result.statusCode).json({
      success: result.success,
      count: result.data ? result.data.length : 0,
      data: result.data || []
    });
  } catch (error) {
    console.error('Görev listeleme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Görevler listelenirken bir hata oluştu'
    });
  }
};

/**
 * ID ile görev getir
 * GET /api/tasks/:id
 */
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    // Servis katmanından görevi getir
    const result = await taskService.getTaskById(id);

    if (!result.success) {
      return res.status(result.statusCode).json({
        success: result.success,
        message: result.error
      });
    }

    // Employee ise sadece kendi görevlerini görebilir
    if (req.user.role === 'employee' && result.data.assigned_to !== req.user.id) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Bu görevi görüntüleme yetkiniz yok'
      });
    }

    return res.status(result.statusCode).json({
      success: result.success,
      data: result.data
    });
  } catch (error) {
    console.error('Görev getirme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Görev getirilirken bir hata oluştu'
    });
  }
};

/**
 * Görev güncelle
 * PUT /api/tasks/:id
 * Body: {title?, description?, status?, priority?, project_id?, assignee_id?}
 * Admin: tüm alanları güncelleyebilir
 * Employee: sadece kendi görevlerinin status'unu güncelleyebilir
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, project_id, assignee_id } = req.body;

    // Request'i validasyon katmanında kontrol et (strict validation)
    const validation = taskValidator.validateUpdateTaskRequestStrict({
      title,
      description,
      status,
      priority,
      project_id,
      assignee_id
    });

    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: validation.error
      });
    }

    // Önce görevi getir
    const getResult = await taskService.getTaskById(id);
    if (!getResult.success) {
      return res.status(getResult.statusCode).json({
        success: false,
        message: getResult.error
      });
    }

    // Employee kontrol: sadece kendi görevlerini güncelleyebilir ve sadece status
    if (req.user.role === 'employee') {
      if (getResult.data.assigned_to !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Bu görevi güncelleme yetkiniz yok'
        });
      }

      // Employee sadece status güncelleyebilir
      if (title !== undefined || description !== undefined || priority !== undefined || project_id || assignee_id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Sadece görev durumunu güncelleyebilirsiniz'
        });
      }
    }

    // Servis katmanında görev güncelle
    const result = await taskService.updateTask(id, {
      title,
      description,
      status,
      priority,
      project_id,
      assignee_id
    });

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Görev başarıyla güncellendi' : result.error,
      data: result.data || null
    });
  } catch (error) {
    console.error('Görev güncelleme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Görev güncellenirken bir hata oluştu'
    });
  }
};

/**
 * Görev sil (sadece admin)
 * DELETE /api/tasks/:id
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Servis katmanında görev sil
    const result = await taskService.deleteTask(id);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.success ? 'Görev başarıyla silindi' : result.error,
      data: null
    });
  } catch (error) {
    console.error('Görev silme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Görev silinirken bir hata oluştu'
    });
  }
};

/**
 * Projeye ait görevleri listele
 * GET /api/tasks/project/:projectId
 */
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Servis katmanından projeye ait görevleri getir
    const result = await taskService.getTasksByProjectId(projectId);

    if (!result.success) {
      return res.status(result.statusCode).json({
        success: result.success,
        message: result.error
      });
    }

    let tasks = result.data;

    // Employee ise sarece kendi görevlerini göster
    if (req.user.role === 'employee') {
      tasks = tasks.filter(task => task.assigned_to === req.user.id);
    }

    return res.status(result.statusCode).json({
      success: result.success,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Proje görevleri listeleme hata handler:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Görevler listelenirken bir hata oluştu'
    });
  }
};
