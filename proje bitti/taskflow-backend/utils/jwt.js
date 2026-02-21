/**
 * JWT Token İşlemleri
 * Token oluşturma ve doğrulama fonksiyonları
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
const JWT_EXPIRES_IN = '7d'; // Token 7 gün geçerli

/**
 * JWT token oluştur
 * @param {Object} payload - Token içine eklenecek veriler (user id, role vb.)
 * @returns {String} JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * JWT token doğrula
 * @param {String} token - Doğrulanacak token
 * @returns {Object} Decoded token verisi
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Geçersiz veya süresi dolmuş token');
  }
}

module.exports = {
  generateToken,
  verifyToken
};
