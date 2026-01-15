# 🧾 نظام متابعة الفواتير الضريبية

نظام ويب متكامل لمتابعة الفواتير الضريبية واستلام إيصالات الـ 1% من الشركات، مبني باستخدام HTML, CSS, JavaScript, وSupabase.

## ✨ المميزات

- 📊 لوحة تحكم شاملة مع إحصائيات مباشرة
- ➕ إضافة وتعديل الفواتير بسهولة
- 🏢 إدارة الشركات والعملاء
- 🔍 فلترة وبحث متقدم في الفواتير
- 📁 رفع وحفظ إيصالات الدفع
- ⚠️ تنبيهات تلقائية للفواتير المتأخرة
- 📈 تقارير شهرية وسنوية
- 📱 تصميم متجاوب يعمل على جميع الأجهزة
- 🌙 واجهة عربية كاملة مع دعم RTL

## 🚀 خطوات التثبيت

### 1. إعداد Supabase

#### أ. إنشاء حساب Supabase
1. اذهب إلى [https://supabase.com](https://supabase.com)
2. سجل حساب جديد مجاناً
3. أنشئ مشروع جديد (Project)

#### ب. إنشاء الجداول
افتح SQL Editor في Supabase وقم بتنفيذ الأوامر التالية:

```sql
-- جدول الشركات
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الفواتير
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE RESTRICT,
    total_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    receipt_status TEXT NOT NULL CHECK (receipt_status IN ('pending', 'received')),
    receipt_file_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الإعدادات
CREATE TABLE settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    alert_days INTEGER DEFAULT 30,
    user_name TEXT DEFAULT 'عمر',
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- إضافة سجل افتراضي للإعدادات
INSERT INTO settings (id, alert_days, user_name) VALUES (1, 30, 'عمر');

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(receipt_status);
```

#### ج. إعداد Storage للملفات
1. اذهب إلى Storage في لوحة تحكم Supabase
2. أنشئ Bucket جديد باسم `receipts`
3. اجعله Public (لإمكانية عرض الإيصالات)

#### د. الحصول على مفاتيح API
1. اذهب إلى Settings → API
2. انسخ:
   - `Project URL` (سيكون شبيه بـ https://xxxxx.supabase.co)
   - `anon public key` (المفتاح العام)

### 2. إعداد المشروع

#### أ. تعديل ملف config.js
افتح ملف `config.js` واستبدل القيم التالية:

```javascript
const SUPABASE_URL = 'ضع_هنا_Project_URL'; 
const SUPABASE_ANON_KEY = 'ضع_هنا_anon_public_key';
```

### 3. النشر على GitHub Pages

#### أ. إنشاء Repository
1. اذهب إلى [https://github.com](https://github.com)
2. اضغط على "New Repository"
3. سمّ المشروع مثلاً: `tax-invoice-tracker`
4. اجعله Public
5. اضغط "Create Repository"

#### ب. رفع الملفات
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/اسمك/tax-invoice-tracker.git
git push -u origin main
```

#### ج. تفعيل GitHub Pages
1. اذهب إلى Settings → Pages
2. في Source اختر `main` branch
3. احفظ التغييرات
4. الموقع سيكون متاح على: `https://اسمك.github.io/tax-invoice-tracker`

### 4. إضافة Supabase JS Library

أضف هذا السطر في `<head>` في ملف `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## 📖 كيفية الاستخدام

### إضافة فاتورة جديدة
1. اذهب إلى "إضافة فاتورة"
2. املأ البيانات المطلوبة
3. النظام سيحسب 1% تلقائياً
4. اختر حالة الإيصال (مستلم/لم يستلم)
5. ارفع صورة الإيصال إن وجد
6. اضغط "حفظ"

### متابعة الفواتير
1. اذهب إلى "كل الفواتير"
2. استخدم الفلاتر للبحث:
   - حسب الشركة
   - حسب الحالة
   - حسب التاريخ
3. يمكنك عرض، تعديل، أو حذف أي فاتورة

### إدارة الشركات
1. اذهب إلى "متابعة الشركات"
2. شاهد ملخص كل شركة وفواتيرها
3. اضغط "عرض الفواتير" لرؤية التفاصيل

### التقارير
1. اذهب إلى "التقارير"
2. تقرير شهري: اختر الشهر والسنة
3. تقرير سنوي: اختر السنة
4. الفواتير المتأخرة: تظهر تلقائياً

### الإعدادات
1. اذهب إلى "الإعدادات"
2. عدّل مدة التنبيه (الافتراضي 30 يوم)
3. أضف أو احذف الشركات

## 🔧 التخصيص

### تغيير الألوان
عدّل المتغيرات في `:root` في ملف `style.css`:

```css
:root {
    --primary-color: #2563eb;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
}
```

### تغيير مدة التنبيه الافتراضية
عدّل في ملف `config.js`:

```javascript
const DEFAULT_SETTINGS = {
    alertDays: 30, // غيّر هذا الرقم
    userName: 'عمر'
};
```

## 📱 الاستخدام على الموبايل

النظام متجاوب بالكامل ويعمل بكفاءة على:
- الهواتف الذكية
- التابلت
- أجهزة الكمبيوتر

## 🔒 الأمان

- جميع البيانات محفوظة في Supabase Cloud
- الاتصال مشفر (HTTPS)
- لا تشارك مفاتيح API مع أحد
- يمكنك إضافة Row Level Security في Supabase لحماية إضافية

## ⚠️ ملاحظات مهمة

1. **النسخ الاحتياطي**: احرص على عمل backup دوري من Supabase
2. **الحدود المجانية**: Supabase المجاني يدعم:
   - 500 MB تخزين
   - 2 GB نقل بيانات/شهر
   - 50,000 مستخدم نشط
3. **Storage**: ملفات الإيصالات تُحسب ضمن سعة التخزين

## 🆘 حل المشاكل

### الموقع لا يعمل
- تأكد من صحة مفاتيح Supabase في `config.js`
- تأكد من إنشاء الجداول بشكل صحيح
- افتح Console في المتصفح (F12) لرؤية الأخطاء

### لا يمكن رفع الملفات
- تأكد من إنشاء Bucket باسم `receipts`
- تأكد من جعله Public
- تحقق من حجم الملف (أقل من 50 MB)

### الفلاتر لا تعمل
- تأكد من وجود بيانات في الجداول
- جرّب تحديث الصفحة

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع التوثيق أعلاه
2. افحص Console في المتصفح
3. راجع [توثيق Supabase](https://supabase.com/docs)

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الشخصي والتجاري.

---

**صُنع بـ ❤️ لتسهيل إدارة الفواتير الضريبية في مصر**
