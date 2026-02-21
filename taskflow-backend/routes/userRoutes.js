/**
 * User Routes
 * Kullanıcı listesi ve yönetim endpoint'leri
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Tüm route'lar authentication gerektirir ve sadece admin erişebilir
router.use(authenticate, authorize('admin'));

// Tüm kullanıcıları listele
router.get('/', userController.getAllUsers);

// Sadece çalışanları listele
router.get('/employees', userController.getEmployees);

// Belirli bir kullanıcıyı getir
router.get('/:id', userController.getUser);

// Yeni çalışan oluştur
router.post('/', userController.createUser);

// Kullanıcı güncelle
router.put('/:id', userController.updateUser);

// Kullanıcı sil
router.delete('/:id', userController.deleteUser);

module.exports = router;
