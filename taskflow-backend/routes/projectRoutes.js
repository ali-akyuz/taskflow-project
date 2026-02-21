/**
 * Project Routes
 * Proje CRUD endpoint'leri
 */

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Tüm projeleri listele (herkes görebilir)
router.get('/', projectController.getAllProjects);

// ID ile proje getir (herkes görebilir)
router.get('/:id', projectController.getProjectById);

// Yeni proje oluştur (sadece admin)
router.post('/', authorize('admin'), projectController.createProject);

// Proje güncelle (sadece admin)
router.put('/:id', authorize('admin'), projectController.updateProject);

// Proje sil (sadece admin)
router.delete('/:id', authorize('admin'), projectController.deleteProject);

module.exports = router;
