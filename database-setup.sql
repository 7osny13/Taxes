-- =========================================
-- نظام متابعة الفواتير الضريبية
-- SQL Schema for Supabase
-- =========================================

-- ==================
-- 1. جدول الشركات
-- ==================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- تعليق على الجدول
COMMENT ON TABLE companies IS 'جدول الشركات التي يتم التعامل معها';
COMMENT ON COLUMN companies.id IS 'المعرف الفريد للشركة';
COMMENT ON COLUMN companies.name IS 'اسم الشركة';
COMMENT ON COLUMN companies.created_at IS 'تاريخ إضافة الشركة';

-- ==================
-- 2. جدول الفواتير
-- ==================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount > 0),
    tax_amount DECIMAL(15,2) NOT NULL CHECK (tax_amount > 0),
    receipt_status TEXT NOT NULL CHECK (receipt_status IN ('pending', 'received')),
    receipt_file_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- تعليقات على الجدول
COMMENT ON TABLE invoices IS 'جدول الفواتير الضريبية';
COMMENT ON COLUMN invoices.id IS 'المعرف الفريد للفاتورة';
COMMENT ON COLUMN invoices.invoice_number IS 'رقم الفاتورة';
COMMENT ON COLUMN invoices.invoice_date IS 'تاريخ إصدار الفاتورة';
COMMENT ON COLUMN invoices.company_id IS 'معرف الشركة المرتبطة';
COMMENT ON COLUMN invoices.total_amount IS 'المبلغ الإجمالي للفاتورة';
COMMENT ON COLUMN invoices.tax_amount IS 'قيمة 1% المستحقة';
COMMENT ON COLUMN invoices.receipt_status IS 'حالة استلام الإيصال (pending/received)';
COMMENT ON COLUMN invoices.receipt_file_url IS 'رابط ملف الإيصال المرفوع';
COMMENT ON COLUMN invoices.notes IS 'ملاحظات إضافية';

-- ==================
-- 3. جدول الإعدادات
-- ==================
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    alert_days INTEGER NOT NULL DEFAULT 30 CHECK (alert_days > 0),
    user_name TEXT NOT NULL DEFAULT 'عمر',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- تعليقات على الجدول
COMMENT ON TABLE settings IS 'جدول إعدادات النظام (سجل واحد فقط)';
COMMENT ON COLUMN settings.alert_days IS 'عدد الأيام قبل التنبيه للفواتير المتأخرة';
COMMENT ON COLUMN settings.user_name IS 'اسم المستخدم';

-- إدراج السجل الافتراضي للإعدادات
INSERT INTO settings (id, alert_days, user_name) 
VALUES (1, 30, 'عمر')
ON CONFLICT (id) DO NOTHING;

-- ==================
-- 4. الفهارس (Indexes)
-- ==================

-- فهرس على company_id لتسريع الاستعلامات المرتبطة بالشركات
CREATE INDEX IF NOT EXISTS idx_invoices_company 
ON invoices(company_id);

-- فهرس على تاريخ الفاتورة لتسريع الفلترة حسب التاريخ
CREATE INDEX IF NOT EXISTS idx_invoices_date 
ON invoices(invoice_date DESC);

-- فهرس على حالة الإيصال لتسريع الفلترة حسب الحالة
CREATE INDEX IF NOT EXISTS idx_invoices_status 
ON invoices(receipt_status);

-- فهرس مركب للبحث السريع
CREATE INDEX IF NOT EXISTS idx_invoices_company_status 
ON invoices(company_id, receipt_status);

-- فهرس على رقم الفاتورة للبحث السريع
CREATE INDEX IF NOT EXISTS idx_invoices_number 
ON invoices(invoice_number);

-- ==================
-- 5. المشغلات (Triggers)
-- ==================

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- مشغل لجدول الفواتير
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- مشغل لجدول الإعدادات
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================
-- 6. Views مفيدة
-- ==================

-- عرض شامل للفواتير مع تفاصيل الشركات
CREATE OR REPLACE VIEW v_invoices_full AS
SELECT 
    i.id,
    i.invoice_number,
    i.invoice_date,
    i.total_amount,
    i.tax_amount,
    i.receipt_status,
    i.receipt_file_url,
    i.notes,
    i.created_at,
    i.updated_at,
    c.id as company_id,
    c.name as company_name,
    CURRENT_DATE - i.invoice_date as days_since_invoice
FROM invoices i
LEFT JOIN companies c ON i.company_id = c.id;

-- عرض للفواتير المتأخرة
CREATE OR REPLACE VIEW v_overdue_invoices AS
SELECT 
    i.*,
    c.name as company_name,
    CURRENT_DATE - i.invoice_date as days_overdue,
    s.alert_days
FROM invoices i
LEFT JOIN companies c ON i.company_id = c.id
CROSS JOIN settings s
WHERE i.receipt_status = 'pending'
AND (CURRENT_DATE - i.invoice_date) > s.alert_days;

-- عرض إحصائيات الشركات
CREATE OR REPLACE VIEW v_company_stats AS
SELECT 
    c.id,
    c.name,
    COUNT(i.id) as total_invoices,
    COUNT(CASE WHEN i.receipt_status = 'received' THEN 1 END) as received_invoices,
    COUNT(CASE WHEN i.receipt_status = 'pending' THEN 1 END) as pending_invoices,
    COALESCE(SUM(CASE WHEN i.receipt_status = 'pending' THEN i.tax_amount ELSE 0 END), 0) as pending_tax_amount,
    COALESCE(SUM(i.total_amount), 0) as total_amount,
    COALESCE(SUM(i.tax_amount), 0) as total_tax_amount
FROM companies c
LEFT JOIN invoices i ON c.id = i.company_id
GROUP BY c.id, c.name;

-- ==================
-- 7. دوال مساعدة
-- ==================

-- دالة للحصول على إحصائيات سريعة
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_invoices BIGINT,
    received_invoices BIGINT,
    pending_invoices BIGINT,
    total_pending_amount NUMERIC,
    overdue_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_invoices,
        COUNT(CASE WHEN receipt_status = 'received' THEN 1 END)::BIGINT as received_invoices,
        COUNT(CASE WHEN receipt_status = 'pending' THEN 1 END)::BIGINT as pending_invoices,
        COALESCE(SUM(CASE WHEN receipt_status = 'pending' THEN tax_amount ELSE 0 END), 0)::NUMERIC as total_pending_amount,
        COUNT(CASE 
            WHEN receipt_status = 'pending' 
            AND (CURRENT_DATE - invoice_date) > (SELECT alert_days FROM settings LIMIT 1)
            THEN 1 
        END)::BIGINT as overdue_count
    FROM invoices;
END;
$$ LANGUAGE plpgsql;

-- ==================
-- 8. Row Level Security (RLS)
-- ==================
-- ملاحظة: يمكن تفعيل هذا لاحقاً للحماية الإضافية

-- تفعيل RLS على الجداول
-- ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول (مثال - معطل حالياً)
-- CREATE POLICY "Enable read access for all users" ON companies FOR SELECT USING (true);
-- CREATE POLICY "Enable all access for authenticated users" ON companies FOR ALL USING (auth.role() = 'authenticated');

-- ==================
-- 9. بيانات تجريبية (اختياري)
-- ==================

-- إضافة بعض الشركات التجريبية (احذف هذا القسم في الإنتاج)
-- INSERT INTO companies (name) VALUES 
-- ('شركة المقاولون العرب'),
-- ('شركة النصر للتصدير والاستيراد'),
-- ('شركة الأهرام للتجارة')
-- ON CONFLICT (name) DO NOTHING;

-- ==================
-- 10. الصلاحيات
-- ==================

-- منح صلاحيات القراءة والكتابة للمستخدم العام (anon)
GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO anon;
GRANT SELECT, UPDATE ON settings TO anon;

-- منح صلاحيات على الـ Views
GRANT SELECT ON v_invoices_full TO anon;
GRANT SELECT ON v_overdue_invoices TO anon;
GRANT SELECT ON v_company_stats TO anon;

-- منح صلاحيات على الدوال
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO anon;

-- ==================
-- نهاية السكريبت
-- ==================

-- للتحقق من إنشاء الجداول بنجاح:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- للتحقق من الفهارس:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- للتحقق من الـ Views:
-- SELECT table_name FROM information_schema.views WHERE table_schema = 'public';
