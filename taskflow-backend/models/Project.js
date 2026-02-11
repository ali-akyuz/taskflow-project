/**
 * Project Model
 * Proje veritabanı işlemleri
 */

const { pool } = require('../config/database');

class Project {
  /**
   * Yeni proje oluştur
   * @param {Object} projectData - Proje bilgileri {name, description, created_by, status}
   */
  static async create(projectData) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO projects (name, description, created_by, status) 
         VALUES (?, ?, ?, ?)`,
        [
          projectData.name,
          projectData.description || null,
          projectData.created_by,
          projectData.status || 'active'
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ID ile proje bul
   * @param {Number} id - Proje ID'si
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT p.*, u.username as creator_name 
         FROM projects p 
         LEFT JOIN users u ON p.created_by = u.id 
         WHERE p.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tüm projeleri listele
   */
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT p.*, u.username as creator_name 
         FROM projects p 
         LEFT JOIN users u ON p.created_by = u.id 
         ORDER BY p.created_at DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Proje güncelle
   * @param {Number} id - Proje ID'si
   * @param {Object} projectData - Güncellenecek proje bilgileri
   */
  static async update(id, projectData) {
    try {
      const updateFields = [];
      const values = [];

      if (projectData.name) {
        updateFields.push('name = ?');
        values.push(projectData.name);
      }
      if (projectData.description !== undefined) {
        updateFields.push('description = ?');
        values.push(projectData.description);
      }
      if (projectData.status) {
        updateFields.push('status = ?');
        values.push(projectData.status);
      }

      if (updateFields.length === 0) {
        throw new Error('Güncellenecek alan bulunamadı');
      }

      values.push(id);

      const [result] = await pool.execute(
        `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Proje sil
   * @param {Number} id - Proje ID'si
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Project;
