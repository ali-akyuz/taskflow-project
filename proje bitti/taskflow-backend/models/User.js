/**
 * User Model
 * Sequelize ORM kullanarak kullanıcı tablosu tanımı
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          msg: 'Bu username zaten kullanılmıştır',
          name: 'username'
        }
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          msg: 'Bu email zaten kaydedilmiştir',
          name: 'email'
        },
        validate: {
          isEmail: {
            msg: 'Lütfen geçerli bir email girin'
          }
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: {
            args: [6, 255],
            msg: 'Şifre en az 6 karakter olmalıdır'
          }
        }
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      role: {
        type: DataTypes.ENUM('admin', 'employee'),
        defaultValue: 'employee',
        validate: {
          isIn: {
            args: [['admin', 'employee']],
            msg: 'Role sadece admin veya employee olabilir'
          }
        }
      }
    },
    {
      tableName: 'users',
      timestamps: true,
      hooks: {
        /**
         * Şifreyi hashle (kullanıcı oluşturma/güncelleme öncesinde)
         */
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          // Şifre değiştiriliyorsa hashle
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        }
      }
    }
  );

  /**
   * Şifre karşılaştırması (login için)
   */
  User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  /**
   * Genel bilgiler (şifre hariç)
   */
  User.prototype.toPublic = function() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt
    };
  };

  return User;
};
