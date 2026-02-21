/**
 * Setup Script - Demo Kullanıcıları Oluştur
 * Admin: admin@example.com / password123
 * Çalışan: employee@example.com / password123
 */

require('dotenv').config();
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

async function setupUsers() {
  try {
    console.log('\n🚀 Demo Kullanıcıları Oluşturuluyor...\n');

    // Admin kontrolü
    const [adminCheck] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
    
    if (adminCheck.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.query(
        `INSERT INTO users (username, email, password, name, role) VALUES (?, ?, ?, ?, ?)`,
        ['admin', 'admin@example.com', hashedPassword, 'Admin User', 'admin']
      );
      console.log('✅ Admin Oluşturuldu:');
      console.log('   📧 Email: admin@example.com');
      console.log('   🔑 Şifre: password123');
      console.log('   👤 Rol: admin\n');
    } else {
      console.log('ℹ️  Admin zaten var (admin@example.com)\n');
    }

    // Çalışan kontrolü
    const [employeeCheck] = await pool.query('SELECT id FROM users WHERE email = ?', ['employee@example.com']);
    
    if (employeeCheck.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await pool.query(
        `INSERT INTO users (username, email, password, name, role) VALUES (?, ?, ?, ?, ?)`,
        ['employee', 'employee@example.com', hashedPassword, 'Çalışan User', 'employee']
      );
      console.log('✅ Çalışan Oluşturuldu:');
      console.log('   📧 Email: employee@example.com');
      console.log('   🔑 Şifre: password123');
      console.log('   👤 Rol: employee\n');
    } else {
      console.log('ℹ️  Çalışan zaten var (employee@example.com)\n');
    }

    console.log('═════════════════════════════════════════');
    console.log('✅ Setup Tamamlandı!');
    console.log('═════════════════════════════════════════\n');

    console.log('🎯 Giriş Bilgileri:\n');
    console.log('👨‍💼 Yönetici Sürümü:');
    console.log('   Email: admin@example.com');
    console.log('   Şifre: password123\n');

    console.log('👨‍💻 Çalışan Sürümü:');
    console.log('   Email: employee@example.com');
    console.log('   Şifre: password123\n');

    console.log('🔗 Backend URL: http://localhost:3000/api');
    console.log('🌐 Frontend URL: http://localhost:3001\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

setupUsers();
