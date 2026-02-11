/**
 * Task Model
 * Görev veritabanı işlemleri
 */

const { pool } = require('../config/database');

class Task {
  /**
   * Yeni görev oluştur
   * @param {Object} taskData - Görev bilgileri {title, description, project_id, assigned_to, status, priority}
   */
  static async create(taskData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO tasks (title, description, project_id, assigned_to, status, priority) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          taskData.title,
          taskData.description || null,
          taskData.project_id,
          taskData.assigned_to,
          taskData.status || 'todo',
          taskData.priority || 'medium'
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ID ile görev bul
   * @param {Number} id - Görev ID'si
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT t.*, 
                p.name as project_name,
                u.name as assigned_to_name
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN users u ON t.assigned_to = u.id
         WHERE t.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tüm görevleri listele (admin için)
   */
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT t.*, 
                p.name as project_name,
                u.name as assigned_to_name
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN users u ON t.assigned_to = u.id
         ORDER BY t.created_at DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kullanıcıya atanmış görevleri listele (employee için)
   * @param {Number} userId - Kullanıcı ID'si
   */
  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT t.*, 
                p.name as project_name,
                u.name as assigned_to_name
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN users u ON t.assigned_to = u.id
         WHERE t.assigned_to = ?
         ORDER BY t.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kullanıcıya atanmış görevleri listele (assigned_to ile)
   * @param {Number} assignedTo - Atanan kullanıcı ID'si
   */
  static async findByAssignedTo(assignedTo) {
    return this.findByUserId(assignedTo);
  }

  /**
   * Projeye ait görevleri listele
   * @param {Number} projectId - Proje ID'si
   */
  static async findByProjectId(projectId) {
    try {
      const [rows] = await pool.execute(
        `SELECT t.*, 
                p.name as project_name,
                u.name as assigned_to_name
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN users u ON t.assigned_to = u.id
         WHERE t.project_id = ?
         ORDER BY t.created_at DESC`,
        [projectId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Görev güncelle
   * @param {Number} id - Görev ID'si
   * @param {Object} taskData - Güncellenecek görev bilgileri {title, description, status, priority, project_id, assigned_to}
   */
  static async update(id, taskData) {
    try {
      const updateFields = [];
      const values = [];

      if (taskData.title) {
        updateFields.push('title = ?');
        values.push(taskData.title);
      }
      if (taskData.description !== undefined) {
        updateFields.push('description = ?');
        values.push(taskData.description);
      }
      if (taskData.status !== undefined && taskData.status !== null) {
        updateFields.push('status = ?');
        values.push(taskData.status);
      }
      if (taskData.priority) {
        updateFields.push('priority = ?');
        values.push(taskData.priority);
      }
      if (taskData.project_id) {
        updateFields.push('project_id = ?');
        values.push(taskData.project_id);
      }
      if (taskData.assigned_to) {
        updateFields.push('assigned_to = ?');
        values.push(taskData.assigned_to);
      }

      if (updateFields.length === 0) {
        throw new Error('Güncellenecek alan bulunamadı');
      }

      values.push(id);

      const [result] = await pool.execute(
        `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(`[ERROR] Task.update hatası:`, error);
      throw error;
    }
  }

  /**
   * Görev sil
   * @param {Number} id - Görev ID'si
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Task;
