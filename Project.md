# 🚀 TaskFlow – Görev & Proje Yönetim Sistemi

Bu depo, Yönetici ve Çalışan rolleri için tasarlanmış bir görev ve proje yönetim sistemi olan **TaskFlow**'un Backend ve Web Yönetim Paneli bileşenlerini içerir.

Proje, backend geliştirme, JWT tabanlı kimlik doğrulama, rol yönetimi ve modern UI kütüphanelerinin efektif kullanımı yeteneklerini ölçmek amacıyla hazırlanmıştır.

## 1. 🎯 Genel Konsept ve Mimarisi

TaskFlow, yöneticilerin projeler oluşturup görev atadığı ve çalışanların web paneli üzerinden görev durumlarını güncelleyebildiği iki ana parçadan oluşan bir sistemdir.

### 1.1. Proje Parçaları

| Parça | Açıklama | Teknolojiler (Zorunlu) |
| :--- | :--- | :--- |
| **Backend API** | JWT tabanlı kimlik doğrulama ve rol yönetimi içeren ana servis. | **Node.js, Express, JWT, MySQL/PostgreSQL** |
| **Web Yönetim Paneli** | Yöneticilerin ve çalışanların proje ve görevleri yönettiği modern arayüz. | **React, Ant Design, TailwindCSS** |

## 2. 👥 Kullanıcı Rolleri ve Senaryoları

### Yönetici (Web Panel)

* **Giriş:** JWT ile sisteme giriş (email + password).
* **Proje Yönetimi:** Yeni proje oluşturma.
* **Kullanıcı Yönetimi:** Sistemdeki çalışanları görüntüleme.
* **Görev Atama:** Çalışanlara görev atama.
* **Takip:** Görevlerin ve projelerin durumlarını listeleme/takip etme.
* **Arayüz:** Temiz, düzenli, modern ve profesyonel bir arayüz beklenmektedir. **Responsive tasarım** ek puan getirir.

### Çalışan (Web Panel)

* **Giriş:** JWT ile sisteme giriş.
* **Görevler:** Üzerine atanmış görevlerin görüntülenmesi.
* **Durum Güncelleme:** Görev durumlarının değiştirilmesi: Bekliyor, Devam Ediyor, Tamamlandı
* **Arayüz:** Modern, sade ve okunabilir arayüz.

## 3. 💻 Teknik Gereksinimler ve UI Kütüphaneleri

### 🔵 Web Arayüzü (React + Ant Design + TailwindCSS)

* Ant Design (AntD), ana layout, menüler, tablolar, modal/drawer gibi bileşenler için kullanılmalıdır.
    * *Örnek Bileşenler:* `Antd Table`, `Antd Modal / Drawer`, `Antd Form`, `Antd Layout`.
* TailwindCSS, renkler, spacing, typography ve görsel düzenlemeler için kullanılmalıdır.
* Tailwind ile **spacing** ve **responsive** ayarlamalar yapılmalıdır.
* Arayüzün modern ve profesyonel görünümü önemlidir.

### Backend (Node.js + Express)

* **Zorunlu:** Node.js, Express, JWT Authentication.
* **Veritabanı:** MySQL
* **Yapı:** Login endpoint, Protected routes ve Rol kontrolü (`admin` & `employee`) zorunludur.
* **Kalite:** Clean code prensipleri ve iyi bir klasör yapısı (örneğin katmanlı mimari) ile hazırlanması beklenir.
