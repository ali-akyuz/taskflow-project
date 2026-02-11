/**
 * User Model
 * Kullanıcı veritabanı işlemleri
 */

const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  /**
   * Yeni kullanıcı oluştur
   * @param {Object} userData - Kullanıcı bilgileri {username, email, password, name (opsiyonel), role}
   */
  static async create(userData) {
    try {
      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const [result] = await pool.execute(
        `INSERT INTO users (username, email, password, name, role) 
         VALUES (?, ?, ?, ?, ?)`,
        [userData.username, userData.email, hashedPassword, userData.name || null, userData.role || 'employee']
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Email ile kullanıcı bul
   * @param {String} email - Kullanıcı email'i
   */
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ID ile kullanıcı bul
   * @param {Number} id - Kullanıcı ID'si
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, name, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tüm kullanıcıları listele (admin için)
   */
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, name, role, created_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Şifre karşılaştır
   * @param {String} plainPassword - Düz metin şifre
   * @param {String} hashedPassword - Hashlenmiş şifre
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
