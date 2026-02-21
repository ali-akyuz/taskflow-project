const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTasksEnum() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taskflow'
  });

  try {
    const conn = await pool.getConnection();
    
    console.log('🔧 Database schema düzeltiliyor...\n');
    
    // Tasks tablosunun enum'unu güncelle
    await conn.execute(`
      ALTER TABLE tasks 
      MODIFY status ENUM('pending', 'in_progress', 'completed') 
      DEFAULT 'pending'
    `);
    
    console.log('✅ Tasks tablosu status enum\'u güncellendi!');
    console.log('   Yeni değerler: pending, in_progress, completed');
    
    // Eski değerleri yeni değerlere çevir
    console.log('\n🔄 Eski değerler dönüştürülüyor...');
    
    // todo -> pending
    await conn.execute("UPDATE tasks SET status = 'pending' WHERE status IS NULL OR status = 'todo'");
    const [todoResult] = await conn.execute("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'");
    console.log(`   ✅ 'pending' değerine sahip görev sayısı: ${todoResult[0].count}`);
    
    // done -> completed
    await conn.execute("UPDATE tasks SET status = 'completed' WHERE status = 'done'");
    const [doneResult] = await conn.execute("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
    console.log(`   ✅ 'completed' değerine sahip görev sayısı: ${doneResult[0].count}`);
    
    // in_progress kalır aynı
    const [progressResult] = await conn.execute("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'");
    console.log(`   ✅ 'in_progress' değerine sahip görev sayısı: ${progressResult[0].count}`);
    
    console.log('\n✨ Tüm güncellemeler tamamlandı!');
    
    conn.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

fixTasksEnum();
