# 📤 دليل رفع المشروع على GitHub

## 🎯 طريقتان للرفع على GitHub

اختر الطريقة الأسهل بالنسبة لك:

---

## 🌐 الطريقة الأولى: من خلال الموقع (الأسهل - 5 دقائق)

### الخطوة 1: إنشاء Repository

1. **اذهب إلى GitHub**
   - افتح [https://github.com](https://github.com)
   - سجل دخول لحسابك

2. **إنشاء Repository جديد**
   - اضغط على زر **"+"** في أعلى اليمين
   - اختر **"New repository"**

3. **املأ البيانات**
   - **Repository name**: `tax-invoice-tracker` (أو أي اسم تريده)
   - **Description**: `نظام متابعة الفواتير الضريبية - Tax Invoice Tracking System`
   - اختر **Public** ✓
   - **لا تختار** "Add a README file" (عندنا readme جاهز)
   - اضغط **"Create repository"**

### الخطوة 2: رفع الملفات

بعد إنشاء الـ Repository، ستظهر لك صفحة فيها خيارات. اتبع هذه الخطوات:

1. **في الصفحة الجديدة**
   - اضغط على **"uploading an existing file"** أو
   - اضغط **"Add file"** → **"Upload files"**

2. **رفع الملفات**
   - اسحب كل الملفات التالية من مجلد المشروع:

   ```
   ✅ الملفات الأساسية (ضرورية):
   ├── index.html
   ├── style.css
   ├── app.js
   ├── config.js
   
   ✅ ملفات الاختبار:
   ├── test.html
   ├── simple-test.html
   
   ✅ ملفات التوثيق:
   ├── README.md
   ├── QUICKSTART.md
   ├── DEPLOYMENT-GUIDE.md
   ├── FILE-STRUCTURE.md
   ├── FIX-EXPLANATION.md
   ├── TROUBLESHOOTING.md
   
   ✅ ملفات قاعدة البيانات:
   └── database-setup.sql
   ```

3. **Commit التغييرات**
   - في حقل "Commit message" اكتب: `Initial commit - نظام متابعة الفواتير`
   - اضغط **"Commit changes"**

### الخطوة 3: تفعيل GitHub Pages

1. **اذهب إلى Settings**
   - من قائمة الـ Repository، اضغط على **"Settings"**

2. **تفعيل Pages**
   - من القائمة الجانبية، اضغط **"Pages"**
   - في قسم **"Source"**:
     - **Branch**: اختر `main`
     - **Folder**: اختر `/ (root)`
   - اضغط **"Save"**

3. **انتظر دقيقة**
   - سيظهر رابط أخضر في الأعلى مثل:
   ```
   Your site is live at https://username.github.io/tax-invoice-tracker/
   ```

4. **انسخ الرابط** وافتحه في متصفح جديد

---

## 💻 الطريقة الثانية: باستخدام Git (للمتقدمين)

### المتطلبات:
- Git مثبت على جهازك
- حساب GitHub جاهز

### الخطوات:

#### 1. إنشاء Repository على GitHub
اتبع الخطوة 1 من الطريقة الأولى أعلاه

#### 2. تهيئة Git محلياً

افتح Terminal/Command Prompt في مجلد المشروع:

```bash
# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# أول commit
git commit -m "Initial commit - نظام متابعة الفواتير الضريبية"

# ربط بـ GitHub (غير username و repository-name)
git remote add origin https://github.com/username/repository-name.git

# تعيين الـ branch
git branch -M main

# رفع الملفات
git push -u origin main
```

#### 3. تفعيل GitHub Pages
اتبع الخطوة 3 من الطريقة الأولى

---

## ⚠️ مهم جداً: قبل الرفع

### 🔐 تأمين المفاتيح

**⚠️ تحذير**: لا ترفع مفاتيح Supabase الحقيقية على GitHub!

**الحل**:

1. **قبل الرفع**، افتح `config.js` وتأكد أن المفاتيح كما هي:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

2. **بعد الرفع**، في نسختك المحلية فقط:
   - ضع المفاتيح الحقيقية
   - استخدم النظام
   - **لا تعمل push للتعديلات دي!**

### أو استخدم .gitignore (طريقة أفضل):

أنشئ ملف `.gitignore` في المجلد الرئيسي:
```
# Ignore local config with real keys
config.local.js
```

ثم:
1. انسخ `config.js` إلى `config.local.js`
2. ضع المفاتيح الحقيقية في `config.local.js`
3. عدّل `index.html` ليستخدم `config.local.js` بدلاً من `config.js`

---

## ✅ التحقق من نجاح الرفع

### 1. تحقق من GitHub
- افتح repository على GitHub
- يجب أن ترى جميع الملفات

### 2. تحقق من GitHub Pages
- افتح الرابط: `https://username.github.io/repository-name/`
- يجب أن يفتح موقعك

### 3. اختبر simple-test.html
- افتح: `https://username.github.io/repository-name/simple-test.html`
- تأكد من نجاح الاختبارات

---

## 🎯 بعد الرفع

### للاستخدام الشخصي:

1. **نزّل المشروع على جهازك**
   ```bash
   git clone https://github.com/username/repository-name.git
   ```

2. **عدّل config.js بالمفاتيح الحقيقية** (في النسخة المحلية فقط)

3. **افتح index.html محلياً** واستخدم النظام

### للنشر العام:

إذا أردت أن يستخدم الآخرون النظام:
- اترك المفاتيح كما هي (YOUR_SUPABASE_URL)
- كل واحد يحط مفاتيحه الخاصة
- أو استخدم Supabase Environment Variables

---

## 🔄 تحديث الملفات لاحقاً

### من الموقع:
1. افتح الملف على GitHub
2. اضغط أيقونة القلم (Edit)
3. عدّل الملف
4. اضغط "Commit changes"

### من Git:
```bash
# بعد التعديل
git add .
git commit -m "وصف التعديل"
git push
```

---

## 📱 مشاركة الرابط

بعد النشر، يمكنك مشاركة:

**رابط الموقع**:
```
https://username.github.io/repository-name/
```

**رابط الكود**:
```
https://github.com/username/repository-name
```

---

## ❓ استكشاف الأخطاء

### المشكلة: الموقع لا يفتح
**الحل**: 
- انتظر 2-3 دقائق
- تأكد من تفعيل Pages في Settings
- تحقق من اسم الـ branch (يجب أن يكون main)

### المشكلة: الموقع يفتح لكن به أخطاء
**الحل**:
- افتح simple-test.html للتشخيص
- تأكد من رفع جميع الملفات
- تحقق من Console (F12)

### المشكلة: لا يمكن الـ push
**الحل**:
- تأكد من أنك مسجل دخول في Git
- استخدم Personal Access Token بدلاً من كلمة المرور
- راجع [GitHub Docs](https://docs.github.com/en/authentication)

---

## 🎉 مبروك!

بعد اتباع الخطوات، سيكون لديك:

✅ Repository على GitHub  
✅ موقع حي على GitHub Pages  
✅ رابط يمكن مشاركته  
✅ نسخة احتياطية من المشروع  
✅ إمكانية التحديث في أي وقت  

---

## 📞 روابط مفيدة

- [GitHub Docs](https://docs.github.com)
- [GitHub Pages](https://pages.github.com)
- [Git Tutorial](https://git-scm.com/docs/gittutorial)

---

**تاريخ التحديث**: 14 يناير 2026  
**جاهز للرفع**: ✅ نعم  
**المفاتيح آمنة**: ✅ نعم (إذا اتبعت التحذيرات)
