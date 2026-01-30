-- =====================================================
-- نظام متابعة إيصالات الـ 1% الضريبية
-- SQL Setup Script for Supabase
-- =====================================================

-- =====================================================
-- 1. إنشاء الجداول (Tables)
-- =====================================================

-- جدول الشركات (Companies)
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    tax_id TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الفواتير (Invoices)
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    date DATE NOT NULL,
    company_id BIGINT REFERENCES companies(id) ON DELETE RESTRICT,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    tax_amount DECIMAL(15,2) NOT NULL CHECK (tax_amount > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الإيصالات (Receipts)
CREATE TABLE IF NOT EXISTS receipts (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT REFERENCES invoices(id) ON DELETE CASCADE,
    receipt_date DATE NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_data TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(invoice_id)
);

-- =====================================================
-- 2. إنشاء الفهارس (Indexes)
-- =====================================================

-- فهرس على company_id في جدول الفواتير
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);

-- فهرس على تاريخ الفاتورة
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);

-- فهرس على رقم الفاتورة
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);

-- فهرس على invoice_id في جدول الإيصالات
CREATE INDEX IF NOT EXISTS idx_receipts_invoice_id ON receipts(invoice_id);

-- فهرس على تاريخ الإيصال
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(receipt_date);

-- فهرس على اسم الشركة
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- فهرس على الرقم الضريبي
CREATE INDEX IF NOT EXISTS idx_companies_tax_id ON companies(tax_id);

-- =====================================================
-- 3. إنشاء الـ Triggers لتحديث updated_at
-- =====================================================

-- Function لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger للشركات
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger للفواتير
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger للإيصالات
DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. تفعيل Row Level Security (RLS)
-- =====================================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. إنشاء Policies للسماح بجميع العمليات
-- =====================================================

-- حذف Policies القديمة إن وجدت
DROP POLICY IF EXISTS "Enable all operations for companies" ON companies;
DROP POLICY IF EXISTS "Enable all operations for invoices" ON invoices;
DROP POLICY IF EXISTS "Enable all operations for receipts" ON receipts;

-- Policy للشركات
CREATE POLICY "Enable all operations for companies" ON companies
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Policy للفواتير
CREATE POLICY "Enable all operations for invoices" ON invoices
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Policy للإيصالات
CREATE POLICY "Enable all operations for receipts" ON receipts
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- =====================================================
-- 6. Views مفيدة للتقارير
-- =====================================================

-- View لعرض الفواتير مع معلومات الشركات
CREATE OR REPLACE VIEW invoices_with_companies AS
SELECT 
    i.id,
    i.number,
    i.date,
    i.amount,
    i.tax_amount,
    i.notes,
    i.created_at,
    c.id as company_id,
    c.name as company_name,
    c.tax_id as company_tax_id,
    c.phone as company_phone,
    c.email as company_email,
    CASE 
        WHEN r.id IS NOT NULL THEN 'received'
        WHEN (CURRENT_DATE - i.date) > 50 THEN 'overdue'
        ELSE 'pending'
    END as status,
    50 - (CURRENT_DATE - i.date) as days_remaining,
    r.id IS NOT NULL as has_receipt
FROM invoices i
LEFT JOIN companies c ON i.company_id = c.id
LEFT JOIN receipts r ON i.id = r.invoice_id;

-- View للإحصائيات الشهرية
CREATE OR REPLACE VIEW monthly_statistics AS
SELECT 
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    COUNT(*) as total_invoices,
    COUNT(r.id) as received_invoices,
    COUNT(*) - COUNT(r.id) as pending_invoices,
    SUM(i.amount) as total_amount,
    SUM(i.tax_amount) as total_tax,
    SUM(CASE WHEN r.id IS NOT NULL THEN i.tax_amount ELSE 0 END) as received_tax,
    SUM(CASE WHEN r.id IS NULL THEN i.tax_amount ELSE 0 END) as pending_tax
FROM invoices i
LEFT JOIN receipts r ON i.id = r.invoice_id
GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
ORDER BY year DESC, month DESC;

-- View لإحصائيات الشركات
CREATE OR REPLACE VIEW company_statistics AS
SELECT 
    c.id,
    c.name,
    c.tax_id,
    COUNT(i.id) as total_invoices,
    COUNT(r.id) as received_invoices,
    COUNT(i.id) - COUNT(r.id) as pending_invoices,
    SUM(i.amount) as total_amount,
    SUM(i.tax_amount) as total_tax,
    SUM(CASE WHEN r.id IS NOT NULL THEN i.tax_amount ELSE 0 END) as received_tax,
    SUM(CASE WHEN r.id IS NULL THEN i.tax_amount ELSE 0 END) as pending_tax
FROM companies c
LEFT JOIN invoices i ON c.id = i.company_id
LEFT JOIN receipts r ON i.id = r.invoice_id
GROUP BY c.id, c.name, c.tax_id
ORDER BY c.name;

-- =====================================================
-- 7. إضافة بيانات تجريبية (اختياري)
-- =====================================================

-- إضافة شركات تجريبية
INSERT INTO companies (name, tax_id, phone, email) VALUES
('شركة النيل للمقاولات', '123456789', '01012345678', 'nile@example.com'),
('شركة الأهرام للتجارة', '987654321', '01098765432', 'ahram@example.com'),
('شركة المستقبل للصناعة', '456789123', '01056789123', 'future@example.com')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. Functions مساعدة
-- =====================================================

-- Function لحساب الأيام المتبقية
CREATE OR REPLACE FUNCTION get_days_remaining(invoice_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN 50 - (CURRENT_DATE - invoice_date);
END;
$$ LANGUAGE plpgsql;

-- Function لحساب حالة الفاتورة
CREATE OR REPLACE FUNCTION get_invoice_status(invoice_id BIGINT)
RETURNS TEXT AS $$
DECLARE
    receipt_exists BOOLEAN;
    invoice_date DATE;
    days_passed INTEGER;
BEGIN
    -- Check if receipt exists
    SELECT EXISTS(SELECT 1 FROM receipts WHERE receipts.invoice_id = get_invoice_status.invoice_id) 
    INTO receipt_exists;
    
    IF receipt_exists THEN
        RETURN 'received';
    END IF;
    
    -- Get invoice date
    SELECT date INTO invoice_date FROM invoices WHERE id = get_invoice_status.invoice_id;
    
    -- Calculate days passed
    days_passed := CURRENT_DATE - invoice_date;
    
    IF days_passed > 50 THEN
        RETURN 'overdue';
    ELSE
        RETURN 'pending';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. تعليقات على الجداول والأعمدة
-- =====================================================

COMMENT ON TABLE companies IS 'جدول الشركات التي نتعامل معها';
COMMENT ON TABLE invoices IS 'جدول الفواتير الضريبية الصادرة';
COMMENT ON TABLE receipts IS 'جدول إيصالات استلام ضريبة الـ 1%';

COMMENT ON COLUMN companies.tax_id IS 'رقم التسجيل الضريبي للشركة';
COMMENT ON COLUMN invoices.tax_amount IS 'قيمة ضريبة 1% من المبلغ';
COMMENT ON COLUMN receipts.file_data IS 'البيانات الخاصة بملف الإيصال بصيغة Base64';

-- =====================================================
-- انتهى السكريبت
-- =====================================================

-- للتحقق من نجاح التنفيذ، قم بتشغيل:
-- SELECT * FROM companies LIMIT 5;
-- SELECT * FROM invoices_with_companies LIMIT 5;
-- SELECT * FROM monthly_statistics;
