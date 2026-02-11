const User = require('../models/User');
const { testConnection } = require('../config/database');

async function seed() {
  try {
    const ok = await testConnection();
    if (!ok) return console.error('Database connection failed.');

    const email = 'admin@example.com';
    const existing = await User.findByEmail(email);
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      return process.exit(0);
    }

    const id = await User.create({
      username: 'admin',
      email,
      password: 'password123',
      role: 'admin'
    });

    console.log(`Created admin (id=${id}) -> ${email} / password123`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
}

seed();
