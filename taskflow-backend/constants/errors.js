/**
 * Error ve HTTP Status Kodları
 * Uygulamada kullanılan standart hata mesajları ve durum kodları
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
  // Kimlik Doğrulama Hataları
  MISSING_TOKEN: 'Token bulunamadı. Lütfen giriş yapın.',
  INVALID_TOKEN: 'Geçersiz veya süresi dolmuş token',
  UNAUTHORIZED: 'Kimlik doğrulama başarısız',
  
  // Yetkilendirme Hataları
  FORBIDDEN: 'Bu işlem için yetkiniz yok',
  ADMIN_REQUIRED: 'Bu işlem için admin yetkisi gereklidir',
  
  // Validasyon Hataları
  MISSING_FIELDS: 'Lütfen tüm zorunlu alanları doldurun',
  INVALID_EMAIL: 'Geçerli bir email adresi girin',
  INVALID_PASSWORD: 'Şifre en az 6 karakter olmalıdır',
  INVALID_USERNAME: 'Kullanıcı adı en az 3 karakter olmalıdır',
  
  // Kayıt Hataları
  EMAIL_ALREADY_EXISTS: 'Bu email adresi zaten kullanılıyor',
  USERNAME_ALREADY_EXISTS: 'Bu kullanıcı adı zaten kullanılıyor',
  INVALID_CREDENTIALS: 'Email veya şifre hatalı',
  
  // Kaynak Hataları
  USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  PROJECT_NOT_FOUND: 'Proje bulunamadı',
  TASK_NOT_FOUND: 'Görev bulunamadı',
  
  // Sunucu Hataları
  INTERNAL_ERROR: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz'
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES
};
