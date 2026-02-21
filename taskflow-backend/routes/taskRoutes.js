/**
 * Task Routes
 * Görev CRUD endpoint'leri
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Tüm route'lar authentication gerektirir
router.use(authenticate);

// Kendi görevlerini listele (her kullanıcı) - BEFORE :id
router.get('/my', taskController.getMyTasks);

// Projeye ait görevleri listele - BEFORE :id
router.get('/project/:projectId', taskController.getTasksByProject);

// ID ile görev getir
router.get('/:id', taskController.getTaskById);

// Tüm görevleri listele (admin: tümü, employee: sadece kendi görevleri)
router.get('/', taskController.getAllTasks);

// Yeni görev oluştur (sadece admin)
router.post('/', authorize('admin'), taskController.createTask);

// Görev güncelle (admin: tüm alanlar, employee: sadece status)
router.put('/:id', taskController.updateTask);

// Görev sil (sadece admin)
router.delete('/:id', authorize('admin'), taskController.deleteTask);

module.exports = router;
