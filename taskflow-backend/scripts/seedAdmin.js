const { sequelize, User } = require('../models');

async function seed() {
  try {
    console.log('🔌 MySQL bağlantısı deneniyor...');
    await sequelize.authenticate();
    console.log('✅ MySQL veritabanına başarıyla bağlanıldı!');

    const email = 'admin@example.com';
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log(`✅ Admin zaten var: ${email}`);
      return process.exit(0);
    }

    const admin = await User.create({
      username: 'admin',
      email,
      password: 'password123',
      role: 'admin'
    });

    console.log(`\n✅ Admin kullanıcı başarıyla oluşturuldu!`);
    console.log(`   Email: ${email}`);
    console.log(`   Şifre: password123`);
    console.log(`   Rol: admin\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding hatası:', err.message || err);
    process.exit(1);
  }
}

seed();
