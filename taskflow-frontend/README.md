# 🚀 TaskFlow Backend 

TaskFlow Backend, admin ve employee rollerine sahip kullanıcılar için geliştirilmiş JWT tabanlı görev ve proje yönetim sisteminin RESTful API servisidir.

Rol bazlı yetkilendirme, katmanlı mimari ve temiz kod prensipleri kullanılarak geliştirilmiştir.

---

## 🛠️ Teknolojiler

| Teknoloji | Açıklama |
|-----------|----------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **MySQL** | Veritabanı |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **CORS** | Cross-origin requests |

---

## 🏗️ Mimarı Yapı

Proje katmanlı (Layered Architecture) yapı ile geliştirilmiştir:

```
taskflow-backend/
├── config/              # Database bağlantısı
├── constants/           # Error messages, HTTP status
├── controllers/         # Request/response handling
├── middleware/          # Auth, Authorization
├── models/              # Database operations
├── routes/              # API endpoints
├── services/            # Business logic
├── scripts/             # Seed, maintenance
└── server.js            # Entry point
```

### Katmanlar ve Sorumlulukları

| Katman | Dosyalar | Görev |
|--------|----------|-------|
| **Routes** | `routes/*.js` | Endpoint tanımları |
| **Controllers** | `controllers/*.js` | HTTP request/response yönetimi |
| **Services** | `services/*.js` | İş mantığı |
| **Models** | `models/*.js` | Veritabanı işlemleri |
| **Middleware** | `middleware/` | Authentication & Authorization |

### Avantajları

✅ Separation of Concerns (SoC) sağlanır  
✅ Kod okunabilirliği artar  
✅ Test edilebilirlik kolaylaşır  
✅ Bakım ve geliştirme hızlanır  

---

## 🔐 Kimlik Doğrulama & Yetkilendirme

### Authentication (JWT)

- **Token üretimi:** Login sırasında JWT token üretilir
- **Token yapısı:** Payload'da `{id, username, role}` bilgileri
- **Token doğrulama:** `auth.js` middleware'i token'ı kontrol eder
- **Protected routes:** Authorization header'ında Bearer token gerekli

```
Authorization: Bearer <token>
```

### Authorization (Role-Based)

- **authorize.js middleware:** Rol kontrolü yapar
- **Admin:** Tüm işlemlere erişim
- **Employee:** Sınırlı erişim (kendi görevler, status güncelle)

---

## 👥 Roller ve Yetkileri

### 🔵 Admin

✅ **Proje Yönetimi:**
- Proje oluşturma (POST /api/projects)
- Proje güncelleme (PUT /api/projects/:id)
- Proje silme (DELETE /api/projects/:id)
- Tüm projeleri listeleme (GET /api/projects)

✅ **Görev Yönetimi:**
- Görev oluşturma ve atama (POST /api/tasks)
- Tüm görevleri listeleme (GET /api/tasks)
- Görev güncelleme (PUT /api/tasks/:id)
- Görev silme (DELETE /api/tasks/:id)

✅ **Kullanıcı Yönetimi:**
- Çalışan oluşturma (POST /api/users)
- Tüm çalışanları listeleme (GET /api/users)
- Çalışan güncelleme (PUT /api/users/:id)
- Çalışan silme (DELETE /api/users/:id)

### 🟢 Employee

✅ **Görev Yönetimi:**
- Kendi görevlerini listeleme (GET /api/tasks/my)
- Görev durumunu güncelleme (PUT /api/tasks/:id)
  - Durum değerleri: `pending`, `in_progress`, `completed`

❌ **Kısıtlamalar:**
- Proje oluşturamaz
- Görev atayamaz
- Başka çalışanın görevini göremez
- Kullanıcı işlemleri yapamaz

---

## 📌 API Endpoint'leri

### Authentication
```
POST   /api/auth/login              # Email + password ile giriş
POST   /api/auth/register           # Yeni user oluştur (Admin)
GET    /api/auth/me                 # Mevcut kullanıcı bilgisi
```

### Projects
```
GET    /api/projects                # Tüm projeleri listele
POST   /api/projects                # Yeni proje oluştur (Admin)
GET    /api/projects/:id            # Proje detayı
PUT    /api/projects/:id            # Projeyi güncelle (Admin)
DELETE /api/projects/:id            # Projeyi sil (Admin)
```

### Tasks
```
GET    /api/tasks                   # Tüm görevleri listele (Admin)
GET    /api/tasks/my                # Kendi görevleri (Employee)
POST   /api/tasks                   # Yeni görev oluştur (Admin)
GET    /api/tasks/:id               # Görev detayı
PUT    /api/tasks/:id               # Görevi güncelle
DELETE /api/tasks/:id               # Görevi sil (Admin)
```

### Users
```
GET    /api/users                   # Tüm kullanıcıları listele (Admin)
POST   /api/users                   # Yeni kullanıcı oluştur (Admin)
GET    /api/users/:id               # Kullanıcı detayı (Admin)
PUT    /api/users/:id               # Kullanıcıyı güncelle (Admin)
DELETE /api/users/:id               # Kullanıcıyı sil (Admin)
```

---

## ⚙️ Kurulum & Çalıştırma

### 1️⃣ Bağımlılıkları Yükleyin

```bash
npm install
```

### 2️⃣ Environment Dosyası

`.env` dosyası oluşturun:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=taskflow
JWT_SECRET=your_jwt_secret_key_here
```

### 3️⃣ Veritabanı

MySQL sunucusu çalıştığından emin olun. Database otomatik oluşturulacaktır.

### 4️⃣ Sunucuyu Başlatın

```bash
npm start
```

Backend şu adreste çalışacaktır:
```
http://localhost:3000
```

### 5️⃣ Seed Script (Opsiyonel)

Varsayılan admin kullanıcı oluştur:

```bash
node scripts/seedAdmin.js
```

---

## 🧪 Test Bilgileri

### Admin Hesabı

```
Email: admin@example.com
Password: password123
```

### Employee Hesabı

```
Email: worker1@example.com
Password: pass123
```

---

## 📊 Veritabanı Schema

### Users Tablosu
```sql
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- role (admin/employee)
- created_at
```

### Projects Tablosu
```sql
- id (Primary Key)
- name
- description
- created_by (FK: users.id)
- status (active/inactive)
- created_at
```

### Tasks Tablosu
```sql
- id (Primary Key)
- title
- description
- project_id (FK: projects.id)
- assigned_to (FK: users.id)
- status (pending/in_progress/completed)
- created_at
- updated_at
```

---

## 🔍 Error Handling

Tüm endpoint'ler standardlaştırılmış error response döner:

### Success Response
```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": { /* sonuç */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Hata açıklaması",
  "error": "error_code"
}
```

### HTTP Status Kodları
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Scripts

```bash
# Geliştirme modunda çalıştır (nodemon ile auto-restart)
npm run dev

# Production modunda çalıştır
npm start

# Admin kullanıcı oluştur
node scripts/seedAdmin.js

# Demo kullanıcıları oluştur
node scripts/setupDemoUsers.js
```

---

## ✅ Spec Uyumu

| Gereksinim | Durum | Açıklama |
|-----------|-------|---------|
| Node.js + Express | ✅ | v4.18.2 |
| JWT Authentication | ✅ | jsonwebtoken v9.0.2 |
| MySQL Database | ✅ | mysql2 v3.6.5 |
| Role-Based Access | ✅ | Admin/Employee separation |
| Layered Architecture | ✅ | Routes → Controllers → Services → Models |
| Clean Code | ✅ | SOLID principles, proper error handling |
| API Endpoints | ✅ | Tüm CRUD işlemleri |

---

## 📌 Notlar

- Bu proje teknik değerlendirme amacıyla geliştirilmiştir
- Clean code prensipleri ve rol bazlı güvenlik mimarisi uygulanmıştır
- 3-Tier architecture (Katmanlı mimari) kullanılmıştır
- Tüm iş mantığı Service layer'da merkezileştirilmiştir
- Error handling standardlaştırılmıştır
- Frontend ile tam entegre çalışmaktadır

---

**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready  
**Geliştirme Tarihi:** Şubat 2026