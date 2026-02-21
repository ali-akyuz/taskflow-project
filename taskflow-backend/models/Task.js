/**
 * Task Model
 * Sequelize ORM kullanarak görev tablosu tanımı
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define(
    'Task',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Görev başlığı boş olamaz'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'project_id',
        references: {
          model: 'projects',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'assigned_to',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'in_progress', 'completed']],
            msg: 'Status sadece pending, in_progress veya completed olabilir'
          }
        }
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
        validate: {
          isIn: {
            args: [['low', 'medium', 'high']],
            msg: 'Priority sadece low, medium veya high olabilir'
          }
        }
      }
    },
    {
      tableName: 'tasks',
      timestamps: true
    }
  );

  return Task;
};
