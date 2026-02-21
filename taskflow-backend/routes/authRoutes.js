/**
 * Authentication Routes
 * Kullanıcı kayıt ve giriş endpoint'leri
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Auth endpoint bilgileri (GET)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication endpoints',
    endpoints: {
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register (geçici olarak authentication yok - ilk admin için)',
      me: 'GET /api/auth/me (authenticated)'
    }
  });
});

// Kullanıcı kaydı (sadece admin yapabilir)
router.post('/register', authenticate, authorize('admin'), authController.register);


// Kullanıcı girişi (herkes)
router.post('/login', authController.login);

// Mevcut kullanıcı bilgilerini getir
router.get('/me', authenticate, authController.getMe);

module.exports = router;
