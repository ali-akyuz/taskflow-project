/**
 * Model'leri merkezi olarak yönet
 * Tüm model'lerin tanımlanması ve ilişkilerinin kurulması burada yapılır
 */

const { sequelize } = require('../config/database');
const UserModel = require('./User');
const ProjectModel = require('./Project');
const TaskModel = require('./Task');

// Model'leri initialize et
const User = UserModel(sequelize);
const Project = ProjectModel(sequelize);
const Task = TaskModel(sequelize);

// İLİŞKİLER (Relationships)
// User - Project (1:N)
User.hasMany(Project, {
  foreignKey: 'createdBy',
  as: 'createdProjects'
});
Project.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Project - Task (1:N)
Project.hasMany(Task, {
  foreignKey: 'projectId',
  as: 'tasks'
});
Task.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});

// User - Task (1:N) - assigned tasks
User.hasMany(Task, {
  foreignKey: 'assignedTo',
  as: 'assignedTasks'
});
Task.belongsTo(User, {
  foreignKey: 'assignedTo',
  as: 'assignee'
});

// Database bağlantısını test etmek için
async function initializeModels() {
  try {
    // Tüm model'leri senkronize et
    await sequelize.sync({ alter: true });
    console.log('✅ Tüm model\'ler başarıyla senkronize edildi!');
    return true;
  } catch (error) {
    console.error('❌ Model senkronizasyonu hatası:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  initializeModels
};
