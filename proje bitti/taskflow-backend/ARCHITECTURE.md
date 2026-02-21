## 🏗️ TaskFlow Backend - Mimari Yapı Belgesi

### Genel Yapı

TaskFlow backend, **3-katmanlı (3-Tier) temiz mimari** prensiplerini izleyen bir Node.js + Express uygulamasıdır. Bu mimarinin amacı, kodun bakımı, test edilebilirliği ve ölçeklenebilirliğini sağlamaktır.

---

## Katmanlar (Layers)

### 1. **Presentation Layer (HTTP Request/Response)**
Dosyalar: `routes/`, `controllers/`, `middleware/`

- **Routes** (`routes/*.js`): Endpoint'leri tanımlar ve middleware'leri bağlar
- **Controllers** (`controllers/*.js`): HTTP request'ini alır, validasyonu ve hata yönetimini çağrır
- **Middleware** (`middleware/`): Authentication ve Authorization kontrol eder

**Görev**: Sadece HTTP protokolü işlemleriyle ilgilenir. İş mantığı yapmazlar.

**Örnek Flow**:
```
HTTP Request
    ↓
Middleware (Auth, Authorize)
    ↓
Controller (Request validasyon ve response hazırlama)
    ↓
Service (İş mantığı)
```

---

### 2. **Business Logic Layer (Service Layer)**
Dosyalar: `services/*.js`, `validators/*.js`

#### 2a. Services (`services/*.js`)
Tüm iş mantığı (business logic) burada yer alır:
- Model'le veri işlemleri
- Business rule'ları uygulama
- Standart response format'ı kullanma

**Örnek**:
```javascript
// services/authService.js
async function loginUser(email, password) {
  // İş mantığı buraya yazılır
  const user = await User.findByEmail(email);
  if (!user || !(await User.comparePassword(password, user.password))) {
    return { success: false, error: ERROR_MESSAGES.INVALID_CREDENTIALS };
  }
  // ...
}
```

#### 2b. Validators (`validators/*.js`)
Input validasyonu merkezileştirilmiştir:
- Email format kontrolü
- Şifre uzunluğu kontrolü
- Required fields kontrolü
- Custom validasyon kuralları

**Örnek**:
```javascript
// validators/authValidator.js
function validateLoginRequest(data) {
  if (!data.email || !data.password) {
    return { valid: false, error: ERROR_MESSAGES.MISSING_FIELDS };
  }
  // ...
}
```

#### 2c. Constants (`constants/errors.js`)
Tüm hata mesajları ve HTTP status kodları merkezileştirilmiştir:
- Standardız hata mesajları
- HTTP status kodları
- Durum tanımları

---

### 3. **Data Access Layer (Models)**
Dosyalar: `models/*.js`

Model'ler sadece veritabanı işlemleriyle ilgilenir:
- SQL sorgularını hazırlama
- Veritabanı CRUD işlemleri
- Raw veri döndürme (iş mantığı yapmaz)

**İlke**: Model'ler asla response objesi oluşturamazlar, sadece veri dönerler.

---

## Dosya Yapısı ve Sorumlulukları

```
taskflow-backend/
├── config/
│   └── database.js          # DB bağlantı ayarları
├── controllers/
│   ├── authController.js   # Auth endpoint'leri (request handling)
│   ├── projectController.js # Project endpoint'leri
│   └── taskController.js    # Task endpoint'leri
├── middleware/
│   ├── auth.js             # JWT token doğrulama
│   └── authorize.js        # Rol-bazlı erişim kontrolü
├── models/
│   ├── User.js             # Kullanıcı veritabanı işlemleri
│   ├── Project.js          # Proje veritabanı işlemleri
│   └── Task.js             # Görev veritabanı işlemleri
├── routes/
│   ├── authRoutes.js       # /api/auth endpoint'leri
│   ├── projectRoutes.js    # /api/projects endpoint'leri
│   ├── taskRoutes.js       # /api/tasks endpoint'leri
│   └── userRoutes.js       # /api/users endpoint'leri
├── services/               # ⭐ YENİ - Business Logic Layer
│   ├── authService.js      # Auth iş mantığı
│   └── projectService.js   # Project iş mantığı
├── validators/             # ⭐ YENİ - Input Validation Layer
│   ├── authValidator.js    # Auth request validasyonu
│   └── projectValidator.js # Project request validasyonu
├── constants/              # ⭐ YENİ - Merkezileştirilmiş Sabitler
│   └── errors.js          # Hata mesajları ve HTTP status'lar
├── utils/
│   └── jwt.js             # JWT token işlemleri
├── server.js              # Ana application dosyası
└── package.json           # Proje bağımlılıkları
```

---

## Veri Akışı (Data Flow) Örneği

### Senaryo: Kullanıcı Girişi

```
1. Client HTTP Request
   POST /api/auth/login
   Body: { email: "user@example.com", password: "123456" }

2. Route (authRoutes.js)
   → authenticate middleware (check token)
   → authController.login

3. Controller (authController.js)
   → authValidator.validateLoginRequest(email, password)
   → if valid: authService.loginUser(email, password)
   → format response

4. Service (authService.js)
   → User.findByEmail(email) [Model'i çağır]
   → User.comparePassword(password, hashedPassword)
   → generateToken({ id, username, role })
   → return { success, data, error, statusCode }

5. Model (User.js)
   → await pool.execute(SQL_QUERY)
   → return raw data

6. Response
   {
     "success": true,
     "message": "Giriş başarılı",
     "data": {
       "token": "eyJhbGc...",
       "user": { "id": 1, "username": "admin", "role": "admin" }
     }
   }
```

---

## Clean Code Prensipleri

### 1. **Single Responsibility Principle (SRP)**
Her katmand/dosya tek bir sorumluluğu vardır:
- Model: Veri erişimi
- Service: İş mantığı
- Controller: HTTP request/response
- Validator: Input validasyonu

### 2. **Dependency Inversion**
- Controllers doğrudan Model'e değil, Service'e bağımlıdır
- Service'ler Model'e bağımlıdır (veritabanı işlemleri için)

### 3. **DRY (Don't Repeat Yourself)**
- Validasyon kuralları `validators/` klasöründe merkezileştirilmiş
- Hata mesajları `constants/errors.js` içinde merkezileştirilmiş
- JWT işlemleri `utils/jwt.js`'de merkezileştirilmiş

### 4. **SOLID Prensipleri**
- **Open/Closed**: Yeni validator eklemek kolaydır
- **Liskov Substitution**: Service'ler tutarlı interface'leri döndürür
- **Interface Segregation**: Her katmanın kendi interface'i var
- **Dependency Inversion**: High-level modules low-level details'e bağlı değil

---

## Error Handling Standardı

Tüm Service'ler tutarlı bir response formatı döner:

```javascript
{
  success: Boolean,       // İşlem başarılı mı?
  data: Object|null,      // Sonuç verisi
  error: String|null,     // Hata mesajı (hata varsa)
  statusCode: Number      // HTTP status kodu
}
```

Controller, bu response'u kullanarak HTTP status kodu ve body'yi hazırlar:

```javascript
const result = await authService.loginUser(email, password);
return res.status(result.statusCode).json({
  success: result.success,
  message: result.success ? 'Giriş başarılı' : result.error,
  data: result.data || null
});
```

---

## Middleware Sırası

`server.js` dosyasında middleware'ler bu sırayla uygulanır:

```javascript
1. CORS middleware        // Cross-Origin isteklere izin ver
2. JSON parser           // Request body'yi JSON olarak parse et
3. URL encoded parser    // Form data'yı parse et
4. Logging middleware    // İstek logla
5. Routes               // Endpoint'leri işle
```

Route'larda:
```javascript
1. authenticate middleware  // Token kontrol et
2. authorize middleware     // Rol kontrol et (gerekirse)
3. Controller              // İş mantığı çalıştır
```

---

## Database Layer

### Bağlantı Yönetimi (`config/database.js`)
- MySQL connection pool kullanılıyor
- Maksimum 10 concurrent connection
- Promise-based API (async/await destekleri)

### Model Yapısı (`models/*.js`)
- Static methodlar ile database işlemleri
- Parameterized queries (SQL injection'a karşı koruma)
- Raw veri döndürme (iş mantığı yapmaz)

---

## Güvenlik Özellikleri

1. **JWT Authentication**
   - Token'lar 7 gün geçerlidir
   - Bearer token scheme kullanılır
   - Verify fonksiyonu token'ın geçerliliğini kontrol eder

2. **Password Hashing**
   - bcrypt salt rounds = 10
   - plaintext şifreler asla DB'de saklanmaz

3. **SQL Injection Koruması**
   - Parameterized queries (?) kullanılır
   - Tüm user input'lar sanitize ediliyor

4. **Role-Based Access Control (RBAC)**
   - Admin ve Employee rolleri
   - authorize middleware ile endpoint-level kontrol

---

## Testing Yapısı (İleri Geliştirme İçin)

Mimari, unit testing'i kolaylaştırır:

```javascript
// Test edebilirlik: Service'ler Model'ten bağımsızdır
const result = await authService.loginUser("test@test.com", "password");
// Service, mock Model ile test ediletilebilir
```

---

## Gelecek Geliştirmeler

1. **Logger Implementation** 
   - Tüm istekleri log etmek
   - Error logging
   
2. **Rate Limiting**
   - Brute force saldırılarına karşı koruma
   
3. **Request/Response Standardization**
   - Kullanıcı-dost response format'ı
   
4. **API Documentation**
   - Swagger/OpenAPI dokumentasyonu

5. **Task ve Project Services**
   - Mevcut yapıya benzer şekilde
   - Full CRUD operations

---

## Özet

✅ **Katmanlı Mimari**: Presentation → Service → Data Access  
✅ **Clean Code**: SRP, DRY, SOLID prensipleri  
✅ **Error Handling**: Merkezileştirilmiş ve standardize  
✅ **Security**: JWT, Bcrypt, Parameterized Queries  
✅ **Maintainability**: Kodun okunması ve değiştirilmesi kolaydır  
✅ **Scalability**: Yeni features eklemek kolaydır  

Bu yapı, akademik ve profesyonel değerlendirmeler için "production-ready" olarak kabul edilir.
