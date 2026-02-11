# TaskFlow Backend

TaskFlow Proje ve Görev Yönetim Sistemi için backend servisi.

## Özellikler

- **Node.js & Express:** Hızlı ve ölçeklenebilir REST API.
- **MySQL Veritabanı:** İlişkisel veri saklama.
- **JWT Kimlik Doğrulama:** Güvenli kullanıcı girişi ve yetkilendirme.
- **Rol Tabanlı Erişim:** Admin ve Çalışan rolleri için özelleştirilmiş erişim.

## Kurulum

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Çevresel Değişkenleri Ayarlayın:**
   Kök dizinde `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin (kendi ayarlarınıza göre düzenleyin):
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sifreniz
   DB_NAME=taskflow
   JWT_SECRET=gizli_anahtariniz
   PORT=5000
   ```

3. **Veritabanını Hazırlayın:**
   MySQL sunucunuzda `taskflow` adında bir veritabanı oluşturun ve gerekli tabloları kurun (schema scriptini çalıştırın).

## Çalıştırma

- **Geliştirme Modu (Nodemon ile):**
  ```bash
  npm run dev
  ```

- **Prodüksiyon Modu:**
  ```bash
  npm start
  ```

## Teknoloji Yığını

- **Backend Framework:** Express.js
- **Veritabanı Sürücüsü:** mysql2
- **Güvenlik:** bcrypt (şifreleme), jsonwebtoken (auth), cors
- **Geliştirme Araçları:** nodemon, eslint
