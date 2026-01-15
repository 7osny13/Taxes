# 📁 هيكل الملفات - نظام متابعة الفواتير الضريبية

## 📂 ملفات المشروع

```
tax-invoice-tracker/
│
├── 📄 index.html              # الصفحة الرئيسية (HTML)
│   └── جميع صفحات النظام في ملف واحد
│
├── 🎨 style.css               # التنسيقات (CSS)
│   └── التصميم الكامل + دعم RTL + Responsive
│
├── ⚙️ app.js                  # منطق التطبيق (JavaScript)
│   └── جميع الوظائف والتفاعلات
│
├── 🔐 config.js               # الإعدادات
│   └── مفاتيح Supabase API
│
├── 🗄️ database-setup.sql     # سكريبت قاعدة البيانات
│   └── لإنشاء الجداول في Supabase
│
├── 📖 README.md               # التوثيق الأساسي
│   └── شرح المشروع والمميزات
│
├── 🚀 DEPLOYMENT-GUIDE.md     # دليل النشر الشامل
│   └── شرح تفصيلي خطوة بخطوة
│
├── ⚡ QUICKSTART.md           # دليل البدء السريع
│   └── الإعداد في 5 دقائق
│
├── 📝 FILE-STRUCTURE.md       # هذا الملف
│   └── شرح هيكل المشروع
│
└── 🚫 .gitignore             # استبعاد ملفات غير مطلوبة
    └── لـ Git version control
```

---

## 📄 تفاصيل الملفات

### 1. index.html
**الحجم**: ~18 KB
**الوصف**: 
- يحتوي على كل صفحات النظام (SPA)
- الصفحات الرئيسية:
  - Dashboard (لوحة التحكم)
  - إضافة فاتورة
  - كل الفواتير
  - متابعة الشركات
  - التقارير
  - الإعدادات
- Modals (نوافذ منبثقة):
  - إضافة شركة
  - تفاصيل الفاتورة
  - تعديل الفاتورة

### 2. style.css
**الحجم**: ~12 KB
**الوصف**:
- تنسيقات حديثة وعصرية
- دعم كامل للغة العربية (RTL)
- Responsive Design (موبايل/تابلت/كمبيوتر)
- ألوان متناسقة
- Animations وتأثيرات
- Print styles

**المتغيرات الرئيسية**:
```css
--primary-color: #2563eb    (أزرق)
--success-color: #10b981    (أخضر)
--warning-color: #f59e0b    (برتقالي)
--danger-color: #ef4444     (أحمر)
```

### 3. app.js
**الحجم**: ~38 KB
**الوصف**: قلب التطبيق، يحتوي على:

**الوظائف الرئيسية**:
- `loadDashboard()` - تحميل لوحة التحكم
- `handleInvoiceSubmit()` - إضافة فاتورة
- `loadInvoices()` - تحميل الفواتير
- `applyFilters()` - تطبيق الفلاتر
- `generateMonthlyReport()` - تقرير شهري
- `generateAnnualReport()` - تقرير سنوي
- `checkOverdueInvoices()` - فحص الفواتير المتأخرة

**التكامل مع Supabase**:
- CRUD operations للفواتير
- CRUD operations للشركات
- رفع الملفات (receipts)
- قراءة/تحديث الإعدادات

### 4. config.js
**الحجم**: ~0.5 KB
**الوصف**:
- بسيط جداً
- يحتوي فقط على:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - أسماء الجداول
  - الإعدادات الافتراضية

**⚠️ مهم**: هذا الملف الوحيد الذي تحتاج تعديله!

### 5. database-setup.sql
**الحجم**: ~9.5 KB
**الوصف**: سكريبت SQL كامل يحتوي على:
- إنشاء 3 جداول (companies, invoices, settings)
- Indexes للأداء
- Triggers للتحديث التلقائي
- Views مفيدة
- Functions مساعدة
- Comments توضيحية بالعربي

**الجداول**:
1. **companies**: الشركات
2. **invoices**: الفواتير
3. **settings**: الإعدادات

### 6. README.md
**الحجم**: ~7.6 KB
**الوصف**:
- نظرة عامة على المشروع
- المميزات
- خطوات التثبيت
- كيفية الاستخدام
- حل المشاكل

### 7. DEPLOYMENT-GUIDE.md
**الحجم**: ~10.8 KB
**الوصف**:
- دليل شامل خطوة بخطوة
- مقسم لـ 6 أجزاء:
  1. إعداد Supabase
  2. تجهيز الكود
  3. النشر على GitHub
  4. التحقق
  5. إعدادات إضافية
  6. الاستخدام اليومي
- استكشاف الأخطاء
- صور توضيحية

### 8. QUICKSTART.md
**الحجم**: ~1.4 KB
**الوصف**:
- نسخة مختصرة للإعداد السريع
- 4 خطوات فقط
- مثالي للمستخدمين المتقدمين

### 9. .gitignore
**الحجم**: ~0.5 KB
**الوصف**:
- يستبعد الملفات غير المطلوبة
- node_modules
- .env files
- OS files
- IDE files

---

## 🗄️ قاعدة البيانات (Supabase)

### الجداول (Tables)

#### 1. companies
```
id (UUID, PK)
name (TEXT, UNIQUE)
created_at (TIMESTAMP)
```

#### 2. invoices
```
id (UUID, PK)
invoice_number (TEXT)
invoice_date (DATE)
company_id (UUID, FK → companies)
total_amount (DECIMAL)
tax_amount (DECIMAL)
receipt_status (TEXT: pending/received)
receipt_file_url (TEXT)
notes (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 3. settings
```
id (INTEGER, PK = 1)
alert_days (INTEGER, default 30)
user_name (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Storage

#### receipts (Bucket)
- Public bucket
- يحفظ صور/ملفات الإيصالات
- مرتبط مع `invoices.receipt_file_url`

---

## 🔄 تدفق البيانات

```
User Input (الواجهة)
    ↓
app.js (JavaScript)
    ↓
Supabase Client
    ↓
Supabase Server (Cloud)
    ↓
PostgreSQL Database
    ↓
Storage (للملفات)
```

---

## 📦 الحجم الإجمالي

- **إجمالي حجم الملفات**: ~100 KB
- **بعد الاستضافة**: يعمل بسرعة عالية
- **قاعدة البيانات**: تبدأ من 0 وتنمو حسب الاستخدام
- **Storage**: حسب عدد الإيصالات المرفوعة

---

## 🌐 استضافة الملفات

### على GitHub Pages:
```
https://username.github.io/tax-invoice-tracker/
├── index.html         (يتم تحميله أولاً)
├── style.css          (يُحمّل من index.html)
├── app.js             (يُحمّل من index.html)
├── config.js          (يُحمّل من index.html)
└── [ملفات التوثيق]
```

### على Supabase:
```
Supabase Project
├── Database
│   ├── companies (table)
│   ├── invoices (table)
│   └── settings (table)
└── Storage
    └── receipts (bucket)
        └── [ملفات PDF/صور]
```

---

## 🔐 الأمان

### الملفات العامة (Public):
- index.html
- style.css
- app.js
- config.js (⚠️ يحتوي على API keys)

### نصائح الأمان:
1. لا تشارك `config.js` بعد التعديل
2. استخدم `.gitignore` إذا استخدمت Git
3. يمكنك تفعيل RLS في Supabase لحماية إضافية
4. غيّر كلمات المرور دورياً

---

## 🚀 للتطوير المستقبلي

إذا أردت إضافة ميزات:

### ملفات جديدة محتملة:
- `auth.js` - نظام تسجيل دخول
- `reports.js` - تقارير متقدمة
- `exports.js` - تصدير Excel/PDF
- `notifications.js` - إشعارات Push

### مجلدات محتملة:
```
src/
├── components/
├── utils/
└── services/

assets/
├── images/
└── icons/
```

---

## ✅ Checklist قبل النشر

- [ ] تعديل `config.js` بمفاتيح Supabase
- [ ] تنفيذ `database-setup.sql` في Supabase
- [ ] إنشاء bucket `receipts` في Storage
- [ ] رفع الملفات على GitHub
- [ ] تفعيل GitHub Pages
- [ ] اختبار إضافة شركة
- [ ] اختبار إضافة فاتورة
- [ ] اختبار رفع ملف

---

## 📞 المساعدة

إذا كنت محتاراً في أي ملف:
1. راجع التعليقات داخل الكود (بالعربي)
2. راجع `DEPLOYMENT-GUIDE.md`
3. راجع `QUICKSTART.md` للإعداد السريع

---

**تحديث**: يناير 2026
**النسخة**: 1.0
