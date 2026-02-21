/**
 * Sequelize Veritabanı Yapılandırması
 * Bu dosya veritabanı bağlantısını Sequelize ORM ile yönetir
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize örneğini oluştur
const sequelize = new Sequelize(
  process.env.DB_NAME || 'taskflow_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // SQL loglarını devre dışı bırak (true yaparsanız tüm query'leri görebilirsiniz)
    define: {
      timestamps: true, // createdAt ve updatedAt otomatik ekle
      underscored: true, // snake_case kuralı uygula
      charset: 'utf8mb4'
    }
  }
);

/**
 * Veritabanı bağlantısını test et
 */
async function testConnection() {
  try {
    console.log('🔌 MySQL bağlantısı deneniyor...');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);
    
    await sequelize.authenticate();
    console.log('✅ MySQL veritabanına başarıyla bağlanıldı!');
    return true;
  } catch (error) {
    console.error('\n❌ Veritabanı bağlantı hatası:');
    console.error('   Hata mesajı:', error.message);
    console.error('\n💡 Kontrol edin:');
    console.error('   1. MySQL servisi çalışıyor mu? (XAMPP/WAMP kontrol panelinden başlatın)');
    console.error('   2. .env dosyasındaki şifre doğru mu?');
    console.error('   3. MySQL portu doğru mu? (varsayılan: 3306)');
    console.error(`\n   Şu anki ayarlar:`);
    console.error(`   DB_HOST=${process.env.DB_HOST || 'localhost'}`);
    console.error(`   DB_USER=${process.env.DB_USER || 'root'}`);
    console.error(`   DB_PASSWORD=${process.env.DB_PASSWORD ? '***' : '(boş)'}`);
    console.error(`   DB_PORT=${process.env.DB_PORT || 3306}\n`);
    return false;
  }
}

/**
 * Veritabanı tablolarını senkronize et (oluştur/güncelle)
 */
async function initializeDatabase() {
  try {
    // force: false - sadece eksik tabloları oluştur
    // force: true - tüm tabloları sil ve yeniden oluştur
    await sequelize.sync({ alter: true });
    console.log('✅ Veritabanı tabloları başarıyla senkronize edildi!');
  } catch (error) {
    console.error('❌ Veritabanı tablo senkronizasyonu hatası:', error.message);
  }
}

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};
