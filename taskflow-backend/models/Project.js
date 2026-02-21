/**
 * Project Model
 * Sequelize ORM kullanarak proje tablosu tanımı
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define(
    'Project',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Proje adı boş olamaz'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by',
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: DataTypes.ENUM('active', 'completed', 'archived'),
        defaultValue: 'active',
        validate: {
          isIn: {
            args: [['active', 'completed', 'archived']],
            msg: 'Status sadece active, completed veya archived olabilir'
          }
        }
      }
    },
    {
      tableName: 'projects',
      timestamps: true
    }
  );

  return Project;
};
