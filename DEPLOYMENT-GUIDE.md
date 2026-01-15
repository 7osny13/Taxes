# 📘 دليل النشر الشامل - نظام متابعة الفواتير الضريبية

## 🎯 نظرة عامة

هذا الدليل سيساعدك على نشر نظام متابعة الفواتير الضريبية بشكل كامل ومجاني باستخدام:
- **Supabase** (قاعدة البيانات وتخزين الملفات)
- **GitHub Pages** (استضافة الموقع)

---

## 📋 المتطلبات

- حساب GitHub (مجاني)
- حساب Supabase (مجاني)
- متصفح حديث (Chrome, Firefox, Safari, Edge)
- محرر نصوص (VS Code, Notepad++، أو أي محرر)

---

## 🚀 الجزء الأول: إعداد Supabase

### الخطوة 1: إنشاء حساب وProject

1. **افتح موقع Supabase**
   - اذهب إلى: [https://supabase.com](https://supabase.com)
   - اضغط "Start your project"

2. **التسجيل**
   - سجل حساب جديد باستخدام:
     - GitHub (موصى به)
     - أو البريد الإلكتروني

3. **إنشاء مشروع جديد**
   - اضغط "New Project"
   - املأ البيانات:
     - **Name**: `tax-invoices` (أو أي اسم تختاره)
     - **Database Password**: اختر كلمة مرور قوية واحفظها
     - **Region**: اختر أقرب منطقة لك (مثل: Europe West)
     - **Pricing Plan**: Free
   - اضغط "Create new project"
   - انتظر 2-3 دقائق حتى يتم إنشاء المشروع

### الخطوة 2: إنشاء قاعدة البيانات

1. **افتح SQL Editor**
   - من القائمة الجانبية، اضغط على "SQL Editor"
   - اضغط "New query"

2. **نفذ سكريبت قاعدة البيانات**
   - انسخ محتوى ملف `database-setup.sql` بالكامل
   - الصقه في محرر SQL
   - اضغط "Run" أو `Ctrl+Enter`
   - يجب أن ترى رسالة "Success"

3. **التحقق من إنشاء الجداول**
   - اذهب إلى "Table Editor" من القائمة الجانبية
   - يجب أن ترى ثلاثة جداول:
     - `companies`
     - `invoices`
     - `settings`

### الخطوة 3: إعداد التخزين (Storage)

1. **إنشاء Bucket**
   - من القائمة الجانبية، اضغط "Storage"
   - اضغط "Create a new bucket"
   - املأ البيانات:
     - **Name**: `receipts`
     - **Public bucket**: نعم (✓)
   - اضغط "Create bucket"

2. **تكوين الصلاحيات**
   - اضغط على bucket `receipts`
   - اذهب إلى "Policies"
   - اضغط "New Policy"
   - اختر "Enable insert access for all users"
   - ثم "Enable read access for all users"
   - احفظ التغييرات

### الخطوة 4: الحصول على مفاتيح API

1. **افتح إعدادات API**
   - من القائمة الجانبية، اضغط "Settings"
   - اضغط "API"

2. **انسخ المفاتيح**
   - **Project URL**: انسخه (مثال: https://abcdefgh.supabase.co)
   - **anon public key**: انسخه (مفتاح طويل)
   
   ⚠️ **مهم جداً**: احفظ هذه المفاتيح في مكان آمن!

---

## 💻 الجزء الثاني: تجهيز الكود

### الخطوة 1: تحميل ملفات المشروع

إذا لم تكن قد حصلت على الملفات بعد:
- جميع الملفات موجودة في المجلد الحالي
- الملفات المطلوبة:
  - `index.html`
  - `style.css`
  - `app.js`
  - `config.js`
  - `README.md`
  - `database-setup.sql`

### الخطوة 2: تعديل ملف config.js

1. **افتح ملف `config.js`**

2. **عدّل السطور التالية**:
   ```javascript
   // قبل التعديل:
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

   // بعد التعديل (مثال):
   const SUPABASE_URL = 'https://abcdefgh.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

3. **احفظ الملف**

⚠️ **تحذير**: لا تشارك هذا الملف بعد التعديل مع أحد!

---

## 🌐 الجزء الثالث: النشر على GitHub Pages

### الخطوة 1: إنشاء Repository

1. **سجل دخول إلى GitHub**
   - اذهب إلى: [https://github.com](https://github.com)

2. **إنشاء Repository جديد**
   - اضغط زر "+" في الأعلى
   - اختر "New repository"
   - املأ البيانات:
     - **Repository name**: `tax-invoice-tracker` (أو أي اسم)
     - **Description**: نظام متابعة الفواتير الضريبية
     - **Public** (يجب أن يكون public)
     - ✓ Add a README file (اتركها)
   - اضغط "Create repository"

### الخطوة 2: رفع الملفات

#### الطريقة الأولى: باستخدام الواجهة (للمبتدئين)

1. **في صفحة الـ Repository**
   - اضغط "Add file" → "Upload files"

2. **رفع الملفات**
   - اسحب الملفات التالية:
     - `index.html`
     - `style.css`
     - `app.js`
     - `config.js` (المعدّل)
     - `README.md`
   - اكتب رسالة commit: "Initial commit"
   - اضغط "Commit changes"

#### الطريقة الثانية: باستخدام Git (للمتقدمين)

```bash
# 1. نسخ الـ Repository
git clone https://github.com/اسمك/tax-invoice-tracker.git

# 2. الدخول للمجلد
cd tax-invoice-tracker

# 3. نسخ ملفات المشروع إلى المجلد

# 4. إضافة الملفات
git add .

# 5. Commit
git commit -m "Initial commit"

# 6. رفع للـ GitHub
git push origin main
```

### الخطوة 3: تفعيل GitHub Pages

1. **في صفحة الـ Repository**
   - اضغط "Settings" (الإعدادات)

2. **تفعيل Pages**
   - من القائمة الجانبية، اضغط "Pages"
   - في "Source":
     - Branch: اختر `main`
     - Folder: اختر `/ (root)`
   - اضغط "Save"

3. **انتظر دقيقة واحدة**
   - سيظهر رابط الموقع في أعلى الصفحة
   - مثال: `https://username.github.io/tax-invoice-tracker`

4. **افتح الموقع**
   - اضغط على الرابط أو انسخه في متصفح جديد

---

## ✅ الجزء الرابع: التحقق من النشر

### الاختبارات الأساسية

1. **اختبار الصفحة الرئيسية**
   - افتح الموقع
   - يجب أن ترى لوحة التحكم

2. **اختبار إضافة شركة**
   - اذهب إلى "الإعدادات"
   - جرب إضافة شركة جديدة
   - إذا نجحت، الاتصال مع Supabase يعمل ✓

3. **اختبار إضافة فاتورة**
   - اذهب إلى "إضافة فاتورة"
   - املأ البيانات
   - احفظ الفاتورة
   - يجب أن تظهر في "كل الفواتير"

4. **اختبار رفع الملفات**
   - أضف فاتورة جديدة
   - اختر حالة "مستلم"
   - ارفع صورة
   - احفظ وتحقق من رفع الملف

---

## 🔧 الجزء الخامس: الإعدادات الإضافية (اختياري)

### إضافة Domain مخصص

إذا كنت تريد رابط مخصص (مثل: invoices.com):

1. **شراء Domain**
   - من Namecheap, GoDaddy، إلخ

2. **إعداد DNS**
   - أضف CNAME record:
     - Host: `www`
     - Value: `username.github.io`

3. **في GitHub Pages**
   - Settings → Pages
   - Custom domain: أدخل الدومين
   - احفظ

### تحسين الأمان

1. **في Supabase Dashboard**
   - Settings → API
   - "Allowed origins": أضف رابط موقعك فقط

2. **تفعيل RLS (Row Level Security)**
   - في SQL Editor، نفّذ:
   ```sql
   ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
   ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
   ```

---

## 📱 الجزء السادس: الاستخدام اليومي

### على الكمبيوتر
- افتح الرابط في المتصفح
- احفظه في Bookmarks للوصول السريع

### على الموبايل
- افتح الرابط في Safari/Chrome
- اضغط "Share" → "Add to Home Screen"
- سيظهر كتطبيق على الشاشة الرئيسية

---

## ❓ استكشاف الأخطاء

### الموقع يفتح لكن لا يعمل

**المشكلة**: صفحة بيضاء أو أخطاء في Console

**الحلول**:
1. افتح Console (F12)
2. ابحث عن أخطاء حمراء
3. تحقق من:
   - صحة مفاتيح Supabase في `config.js`
   - إنشاء الجداول بشكل صحيح
   - تفعيل Storage bucket

### لا يمكن إضافة فاتورة

**المشكلة**: خطأ عند الحفظ

**الحلول**:
1. تحقق من إنشاء جدول `companies` أولاً
2. أضف شركة واحدة على الأقل
3. تأكد من ملء كل الحقول المطلوبة

### لا يمكن رفع الملفات

**المشكلة**: خطأ عند رفع الإيصال

**الحلول**:
1. تأكد من إنشاء bucket `receipts`
2. تأكد من جعله Public
3. تحقق من حجم الملف (أقل من 50MB)

### الموقع بطيء

**الأسباب المحتملة**:
- اتصال الإنترنت ضعيف
- بيانات كثيرة جداً
- Region بعيد في Supabase

**الحلول**:
- جرب تحديث الصفحة
- نظف Cache المتصفح
- فكر في ترقية خطة Supabase للأداء الأفضل

---

## 📞 الدعم والمساعدة

### الموارد المفيدة

1. **توثيق Supabase**
   - [https://supabase.com/docs](https://supabase.com/docs)

2. **GitHub Pages**
   - [https://pages.github.com](https://pages.github.com)

3. **JavaScript MDN**
   - [https://developer.mozilla.org/ar](https://developer.mozilla.org/ar)

---

## 🎉 تهانينا!

إذا وصلت إلى هنا، فقد نجحت في نشر نظام متابعة الفواتير الضريبية! 🎊

الموقع الآن:
- ✅ يعمل بشكل كامل
- ✅ مستضاف مجاناً
- ✅ آمن ومشفر (HTTPS)
- ✅ متاح 24/7
- ✅ يعمل على جميع الأجهزة

---

## 📝 ملاحظات ختامية

### النسخ الاحتياطي
- احرص على تصدير البيانات من Supabase شهرياً
- احتفظ بنسخة من ملف `config.js`

### التحديثات المستقبلية
- تابع Updates على GitHub
- راجع توثيق Supabase للميزات الجديدة

### الأمان
- لا تشارك مفاتيح API مع أحد
- غيّر كلمة مرور Supabase دورياً
- راجع سجلات الوصول في Supabase

---

**صُنع بـ ❤️ لتسهيل إدارة الفواتير الضريبية**

تاريخ آخر تحديث: يناير 2026
