/**
 * MySQL Veritabanı Bağlantı Yapılandırması
 * Bu dosya veritabanı bağlantısını yönetir
 */

const mysql = require('mysql2');
require('dotenv').config();

// Veritabanı bağlantı ayarları (veritabanı adı olmadan - önce veritabanını oluşturmak için)
const dbConfigWithoutDatabase = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Veritabanı bağlantı ayarları (veritabanı adı ile)
const dbConfig = {
  ...dbConfigWithoutDatabase,
  database: process.env.DB_NAME || 'taskflow_db'
};

// Connection pool oluştur (performans için)
const pool = mysql.createPool(dbConfig);

// Promise tabanlı kullanım için
const promisePool = pool.promise();

/**
 * Veritabanını oluştur (yoksa)
 */
async function createDatabaseIfNotExists() {
  const dbName = process.env.DB_NAME || 'taskflow_db';
  
  try {
    console.log('🔌 MySQL bağlantısı deneniyor...');
    console.log(`   Host: ${dbConfigWithoutDatabase.host}`);
    console.log(`   User: ${dbConfigWithoutDatabase.user}`);
    console.log(`   Port: ${dbConfigWithoutDatabase.port}`);
    
    // Önce veritabanı olmadan bağlan
    const tempPool = mysql.createPool(dbConfigWithoutDatabase).promise();
    
    // Bağlantıyı test et
    await tempPool.query('SELECT 1');
    console.log('✅ MySQL sunucusuna bağlanıldı!');
    
    // Veritabanını oluştur
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Veritabanı '${dbName}' hazır!`);
    
    // Geçici bağlantıyı kapat
    await tempPool.end();
    
    return true;
  } catch (error) {
    console.error('\n❌ Veritabanı bağlantı hatası detayları:');
    console.error('   Hata mesajı:', error.message);
    console.error('   Hata kodu:', error.code);
    console.error('\n💡 Kontrol edin:');
    console.error('   1. MySQL servisi çalışıyor mu? (XAMPP/WAMP kontrol panelinden başlatın)');
    console.error('   2. .env dosyasındaki şifre doğru mu?');
    console.error('   3. MySQL portu doğru mu? (varsayılan: 3306)');
    console.error(`\n   Şu anki ayarlar:`);
    console.error(`   DB_HOST=${dbConfigWithoutDatabase.host}`);
    console.error(`   DB_USER=${dbConfigWithoutDatabase.user}`);
    console.error(`   DB_PASSWORD=${dbConfigWithoutDatabase.password ? '***' : '(boş)'}`);
    console.error(`   DB_PORT=${dbConfigWithoutDatabase.port}\n`);
    return false;
  }
}

/**
 * Veritabanı bağlantısını test et
 */
async function testConnection() {
  try {
    // Önce veritabanının var olduğundan emin ol
    const dbCreated = await createDatabaseIfNotExists();
    if (!dbCreated) {
      return false;
    }

    // Bağlantıyı test et
    const [rows] = await promisePool.query('SELECT 1 as test');
    console.log('✅ MySQL veritabanına başarıyla bağlanıldı!');
    return true;
  } catch (error) {
    console.error('\n❌ Veritabanı bağlantı hatası:', error.message);
    console.error('   Hata kodu:', error.code);
    console.error('\n💡 İpucu: MySQL servisinin çalıştığından ve .env dosyasındaki bilgilerin doğru olduğundan emin olun.\n');
    return false;
  }
}

/**
 * Veritabanı tablolarını oluştur (ilk kurulum için)
 */
async function initializeDatabase() {
  try {
    // Users tablosu
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role ENUM('admin', 'employee') DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Projects tablosu
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by INT NOT NULL,
        status ENUM('active', 'completed', 'archived') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tasks tablosu
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        project_id INT NOT NULL,
        assigned_to INT NOT NULL,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Veritabanı tabloları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('❌ Veritabanı tablo oluşturma hatası:', error.message);
  }
}

module.exports = {
  pool: promisePool,
  testConnection,
  initializeDatabase
};
