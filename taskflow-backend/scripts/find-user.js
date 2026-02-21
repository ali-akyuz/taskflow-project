const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taskflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute("SELECT id, username, email, name, role FROM users WHERE username = 'testuser_spec'");
    
    if (users.length > 0) {
      console.log('\n✅ testuser_spec Bulundu:');
      console.log('─────────────────────────');
      users.forEach(user => {
        console.log(`ID:       ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email:    ${user.email}`);
        console.log(`Ad Soyad: ${user.name}`);
        console.log(`Rol:      ${user.role}`);
      });
    } else {
      console.log('❌ testuser_spec bulunamadı!');
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error.message);
    process.exit(1);
  }
})();
