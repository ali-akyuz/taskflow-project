/**
 * TaskFlow Backend Server
 * Ana server dosyası
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Veritabanı bağlantısı
const { sequelize, initializeModels } = require('./models');

// Route'lar
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

// Express uygulaması oluştur
const app = express();

// CORS yapılandırması
const corsOptions = {
  origin: [
    'http://localhost:3001',      // Frontend development
    'http://localhost:3000',      // Backend test (aynı domain)
    process.env.FRONTEND_URL || '' // Production frontend URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware'ler
app.use(cors(corsOptions)); // CORS desteği
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL encoded body parser

// Basit loglama middleware'i
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Route'ları bağla
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Ana sayfa route'u
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TaskFlow Backend API\'ye hoş geldiniz!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks'
    }
  });
});

// 404 handler (bulunamayan route'lar için)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route bulunamadı'
  });
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error('Hata:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Sunucu hatası',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server'ı başlat
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Veritabanı bağlantısını test et
    console.log('🔌 MySQL bağlantısı deneniyor...');
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Bağlantı timeout (10 saniye)')), 10000)
      )
    ]);
    console.log('✅ MySQL veritabanına başarıyla bağlanıldı!');

    // Model'leri initialize et ve senkronize et
    await initializeModels();

    // Server'ı dinlemeye başla
    app.listen(PORT, () => {
      console.log(`\n🚀 Server ${PORT} portunda çalışıyor!`);
      console.log(`📍 http://localhost:${PORT}/`);
      console.log(`🔗 Frontend URL: http://localhost:3001\n`);
    });
  } catch (error) {
    console.error('\n❌ Server başlatma hatası:', error.message);
    process.exit(1);
  }
}

// Server'ı başlat
startServer();

module.exports = app;
