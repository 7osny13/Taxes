# ⚡ دليل البدء السريع

## 🎯 في 5 دقائق فقط!

### 1️⃣ إعداد Supabase (دقيقتان)

1. سجل في [Supabase.com](https://supabase.com)
2. أنشئ Project جديد
3. في SQL Editor، الصق كود ملف `database-setup.sql` واضغط Run
4. في Storage، أنشئ bucket اسمه `receipts` واجعله Public
5. من Settings → API، انسخ:
   - Project URL
   - anon public key

### 2️⃣ تعديل الكود (دقيقة واحدة)

افتح `config.js` وضع المفاتيح:
```javascript
const SUPABASE_URL = 'ضع_هنا_Project_URL';
const SUPABASE_ANON_KEY = 'ضع_هنا_anon_key';
```

### 3️⃣ رفع على GitHub (دقيقتان)

1. أنشئ Repository جديد في GitHub
2. ارفع الملفات (Upload files)
3. في Settings → Pages:
   - Source: main branch
   - Save

### 4️⃣ جاهز! 🎉

افتح الرابط: `https://username.github.io/repository-name`

---

## 🆘 مشكلة؟

### لا يعمل؟
1. افتح Console (F12)
2. تحقق من الأخطاء
3. تأكد من:
   - صحة مفاتيح Supabase
   - تنفيذ SQL بنجاح
   - إنشاء Storage bucket

### للمزيد من التفاصيل
راجع ملف `DEPLOYMENT-GUIDE.md`

---

## ✨ الخطوة الأولى بعد التشغيل

1. اذهب للإعدادات
2. أضف أول شركة
3. أضف أول فاتورة
4. استمتع! 🚀
