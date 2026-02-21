# 🚀 TaskFlow Frontend

Modern ve kullanıcı dostu bir proje ve görev yönetim uygulamasının frontend katmanı. Admin ve çalışan rollerine göre özelleştirilmiş paneller sunar.

## 📋 Özellikler

- **Rol Bazlı Erişim**: Admin ve Employee panelleri
- **JWT Kimlik Doğrulama**: Güvenli token tabanlı oturum yönetimi
- **Proje Yönetimi**: Proje oluşturma, düzenleme ve silme
- **Görev Yönetimi**: Görev atama, durum takibi ve güncelleme
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz
- **Modern UI**: Ant Design ve TailwindCSS ile şık tasarım

## 🛠️ Teknolojiler

- **React** - UI framework
- **Ant Design** - Component library (Layout, Table, Form, Modal)
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router** - Sayfa yönlendirme
- **JWT** - Kimlik doğrulama

## 👥 Kullanıcı Rolleri

### 🔵 Admin Paneli

- Proje oluşturma, düzenleme ve silme
- Çalışan listesi görüntüleme ve yönetimi
- Görev atama (çoklu çalışan desteği)
- Tüm görevleri görüntüleme ve düzenleme
- Görev durumu takibi

### 🟢 Çalışan Paneli

- Atanan görevleri görüntüleme
- Görev durumunu güncelleme:
  - ⏳ Yapılacak (`pending`)
  - 🔄 Devam ediyor (`in_progress`)
  - ✅ Tamamlandı (`completed`)

## 🏗️ Proje Yapısı

```
src/
├── api/
│   └── axios.js              # Axios instance ve interceptors
├── auth/
│   └── ProtectedRoute.js     # Route koruma bileşeni
├── components/
│   └── DeveloperFooter.js    # Footer bileşeni
├── pages/
│   ├── Landing.js            # Landing sayfası
│   ├── Login.js               # Giriş sayfası
│   ├── AdminDashboard.js      # Admin paneli
│   └── EmployeeDashboard.js   # Çalışan paneli
└── App.js                     # Ana uygulama ve routing
```

## ⚙️ Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**

```bash
npm install
```

2. **Environment değişkenlerini ayarlayın:**

`.env` dosyası oluşturun ve backend API URL'ini ekleyin:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Geliştirme sunucusunu başlatın:**

```bash
npm start
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🔗 Backend Entegrasyonu

Frontend, backend API ile şu şekilde iletişim kurar:

- **Base URL**: `REACT_APP_API_URL` environment variable'ından alınır
- **Kimlik Doğrulama**: JWT token her istekte `Authorization` header'ında gönderilir
- **Hata Yönetimi**: 401 durumunda otomatik logout ve login sayfasına yönlendirme

### API Endpoints

- `POST /auth/login` - Kullanıcı girişi
- `GET /projects` - Proje listesi
- `POST /projects` - Yeni proje oluşturma
- `PUT /projects/:id` - Proje güncelleme
- `DELETE /projects/:id` - Proje silme
- `GET /users` - Kullanıcı listesi
- `GET /tasks` - Tüm görevler (Admin)
- `GET /tasks/my` - Kullanıcının görevleri (Employee)
- `POST /tasks` - Yeni görev oluşturma
- `PUT /tasks/:id` - Görev güncelleme
- `DELETE /tasks/:id` - Görev silme

## 🔐 Kimlik Doğrulama

- JWT token `localStorage` içinde saklanır
- Token her API isteğinde otomatik olarak header'a eklenir
- Token süresi dolduğunda veya geçersiz olduğunda otomatik logout
- Rol bazlı route koruması (`ProtectedRoute`)

## 📝 Görev Durumları

Backend tarafından kabul edilen görev durumları:

- `pending` - Yapılacak
- `in_progress` - Devam ediyor
- `completed` - Tamamlandı

## 🎨 Stil ve Tasarım

- **Ant Design**: Form elemanları, tablolar, modaller
- **TailwindCSS**: Spacing, renkler, responsive breakpoints
- **CSS Variables**: Tema renkleri ve radius değerleri için

## 📌 Notlar

- Bu proje teknik değerlendirme amacıyla geliştirilmiştir
- Clean code prensiplerine uygun şekilde yapılandırılmıştır
- Backend API'nin çalışır durumda olması gerekmektedir

## 🐛 Bilinen Sorunlar

- Backend tarafında `completed` durumunun düzgün kaydedilmesi için backend ekibinin kontrolü gerekmektedir
- Proje silme işlemi için backend'de cascade delete veya manuel görev temizleme mantığı olmalıdır
