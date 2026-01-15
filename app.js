// ===== Global Variables =====
let currentInvoices = [];
let currentCompanies = [];
let currentSettings = DEFAULT_SETTINGS;

// ===== Page Navigation =====
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // Update nav active state
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load page data
    switch(pageId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'invoices':
            loadInvoices();
            break;
        case 'companies':
            loadCompaniesPage();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', async function() {
    showLoading(true);
    
    // Initialize Supabase client using the function from config.js
    const supabaseInitialized = initializeSupabaseClient();
    
    if (!supabaseInitialized) {
        showLoading(false);
        alert('⚠️ تنبيه: يجب تعديل ملف config.js بمفاتيح Supabase الخاصة بك\n\nالخطوات:\n1. افتح ملف config.js\n2. ضع Project URL\n3. ضع anon public key\n\nللمساعدة: راجع ملف DEPLOYMENT-GUIDE.md');
        return;
    }
    
    // Initialize database tables if needed
    await initializeDatabase();
    
    // Load initial data
    await loadCompanies();
    await loadSettings();
    await loadDashboard();
    
    // Setup form handlers
    setupFormHandlers();
    
    showLoading(false);
});

// ===== Database Initialization =====
async function initializeDatabase() {
    try {
        // Check if tables exist and create if needed
        // Note: In production, you should create these tables in Supabase dashboard
        
        // Test connection
        const { data, error } = await supabase.from(TABLES.COMPANIES).select('id').limit(1);
        
        if (error && error.code === '42P01') {
            // Tables don't exist - guide user to create them
            console.log('Tables need to be created in Supabase dashboard');
            showSetupGuide();
        }
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

function showSetupGuide() {
    const guide = `
        يرجى إنشاء الجداول التالية في Supabase:

        1. جدول companies:
        CREATE TABLE companies (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT NOW()
        );

        2. جدول invoices:
        CREATE TABLE invoices (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            invoice_number TEXT NOT NULL,
            invoice_date DATE NOT NULL,
            company_id UUID REFERENCES companies(id),
            total_amount DECIMAL(15,2) NOT NULL,
            tax_amount DECIMAL(15,2) NOT NULL,
            receipt_status TEXT NOT NULL,
            receipt_file_url TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );

        3. جدول settings:
        CREATE TABLE settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            alert_days INTEGER DEFAULT 30,
            user_name TEXT DEFAULT 'عمر',
            created_at TIMESTAMP DEFAULT NOW()
        );
    `;
    
    console.log(guide);
    alert('يرجى إنشاء الجداول في Supabase. راجع Console للتفاصيل.');
}

// ===== Load Companies =====
async function loadCompanies() {
    try {
        const { data, error } = await supabase
            .from(TABLES.COMPANIES)
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        currentCompanies = data || [];
        updateCompanySelects();
    } catch (error) {
        console.error('Error loading companies:', error);
        currentCompanies = [];
    }
}

function updateCompanySelects() {
    const selects = [
        document.getElementById('companyName'),
        document.getElementById('editCompanyName'),
        document.getElementById('filterCompany')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        const isFilter = select.id === 'filterCompany';
        
        select.innerHTML = isFilter ? '<option value="">الكل</option>' : '<option value="">اختر شركة...</option>';
        
        currentCompanies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// ===== Load Settings =====
async function loadSettings() {
    try {
        const { data, error } = await supabase
            .from(TABLES.SETTINGS)
            .select('*')
            .limit(1)
            .single();
        
        if (data) {
            currentSettings = {
                alertDays: data.alert_days,
                userName: data.user_name
            };
        }
        
        document.getElementById('alertDays').value = currentSettings.alertDays;
        document.getElementById('userName').textContent = currentSettings.userName;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ===== Dashboard =====
async function loadDashboard() {
    try {
        // Load invoices
        const { data: invoices, error } = await supabase
            .from(TABLES.INVOICES)
            .select(`
                *,
                companies (name)
            `)
            .order('invoice_date', { ascending: false });
        
        if (error) throw error;
        
        currentInvoices = invoices || [];
        
        // Calculate statistics
        const totalInvoices = currentInvoices.length;
        const receivedInvoices = currentInvoices.filter(inv => inv.receipt_status === 'received').length;
        const pendingInvoices = currentInvoices.filter(inv => inv.receipt_status === 'pending').length;
        const totalPendingAmount = currentInvoices
            .filter(inv => inv.receipt_status === 'pending')
            .reduce((sum, inv) => sum + parseFloat(inv.tax_amount), 0);
        
        // Update statistics
        document.getElementById('totalInvoices').textContent = totalInvoices;
        document.getElementById('receivedInvoices').textContent = receivedInvoices;
        document.getElementById('pendingInvoices').textContent = pendingInvoices;
        document.getElementById('totalPendingAmount').textContent = totalPendingAmount.toFixed(2) + ' جنيه';
        
        // Check for overdue invoices
        checkOverdueInvoices();
        
        // Display recent invoices
        displayRecentInvoices();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function checkOverdueInvoices() {
    const today = new Date();
    const alertDays = currentSettings.alertDays;
    
    const overdueInvoices = currentInvoices.filter(invoice => {
        if (invoice.receipt_status !== 'pending') return false;
        
        const invoiceDate = new Date(invoice.invoice_date);
        const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
        
        return daysDiff > alertDays;
    });
    
    const alertSection = document.getElementById('alertSection');
    const alertContent = document.getElementById('alertContent');
    
    if (overdueInvoices.length > 0) {
        alertSection.style.display = 'block';
        
        let html = '<div class="alert-list">';
        overdueInvoices.forEach(invoice => {
            const invoiceDate = new Date(invoice.invoice_date);
            const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
            
            html += `
                <div class="alert-item">
                    <div>
                        <strong>${invoice.companies?.name || 'شركة غير معروفة'}</strong> - 
                        فاتورة رقم ${invoice.invoice_number} - 
                        متأخرة ${daysDiff} يوم
                    </div>
                    <span class="text-danger">${invoice.tax_amount} جنيه</span>
                </div>
            `;
        });
        html += '</div>';
        
        alertContent.innerHTML = html;
    } else {
        alertSection.style.display = 'none';
    }
}

function displayRecentInvoices() {
    const container = document.getElementById('recentInvoicesList');
    const recentInvoices = currentInvoices.slice(0, 5);
    
    if (recentInvoices.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد فواتير بعد</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>التاريخ</th>
                    <th>الشركة</th>
                    <th>المبلغ</th>
                    <th>قيمة 1%</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    recentInvoices.forEach(invoice => {
        const statusClass = invoice.receipt_status === 'received' ? 'status-received' : 'status-pending';
        const statusText = invoice.receipt_status === 'received' ? '✅ مستلم' : '❌ لم يستلم';
        
        html += `
            <tr>
                <td>${invoice.invoice_number}</td>
                <td>${formatDate(invoice.invoice_date)}</td>
                <td>${invoice.companies?.name || 'غير معروف'}</td>
                <td>${parseFloat(invoice.total_amount).toFixed(2)} جنيه</td>
                <td>${parseFloat(invoice.tax_amount).toFixed(2)} جنيه</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== Form Handlers =====
function setupFormHandlers() {
    // Invoice Form
    const invoiceForm = document.getElementById('invoiceForm');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', handleInvoiceSubmit);
    }
    
    // Calculate tax on amount change
    const totalAmountInput = document.getElementById('totalAmount');
    if (totalAmountInput) {
        totalAmountInput.addEventListener('input', calculateTax);
    }
    
    // Show/hide receipt upload based on status
    const receiptStatusSelect = document.getElementById('receiptStatus');
    if (receiptStatusSelect) {
        receiptStatusSelect.addEventListener('change', toggleReceiptUpload);
    }
    
    // Edit form handlers
    const editTotalAmount = document.getElementById('editTotalAmount');
    if (editTotalAmount) {
        editTotalAmount.addEventListener('input', calculateEditTax);
    }
    
    const editReceiptStatus = document.getElementById('editReceiptStatus');
    if (editReceiptStatus) {
        editReceiptStatus.addEventListener('change', toggleEditReceiptUpload);
    }
    
    // Add company form
    const addCompanyForm = document.getElementById('addCompanyForm');
    if (addCompanyForm) {
        addCompanyForm.addEventListener('submit', handleAddCompany);
    }
    
    // Edit invoice form
    const editInvoiceForm = document.getElementById('editInvoiceForm');
    if (editInvoiceForm) {
        editInvoiceForm.addEventListener('submit', handleEditInvoice);
    }
}

function calculateTax() {
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
    const taxAmount = totalAmount * 0.01;
    document.getElementById('taxAmount').value = taxAmount.toFixed(2);
}

function calculateEditTax() {
    const totalAmount = parseFloat(document.getElementById('editTotalAmount').value) || 0;
    const taxAmount = totalAmount * 0.01;
    document.getElementById('editTaxAmount').value = taxAmount.toFixed(2);
}

function toggleReceiptUpload() {
    const status = document.getElementById('receiptStatus').value;
    const uploadSection = document.getElementById('receiptUploadSection');
    uploadSection.style.display = status === 'received' ? 'block' : 'none';
}

function toggleEditReceiptUpload() {
    const status = document.getElementById('editReceiptStatus').value;
    const uploadSection = document.getElementById('editReceiptUploadSection');
    uploadSection.style.display = status === 'received' ? 'block' : 'none';
}

// ===== Add Invoice =====
async function handleInvoiceSubmit(e) {
    e.preventDefault();
    showLoading(true);
    
    try {
        const formData = {
            invoice_number: document.getElementById('invoiceNumber').value,
            invoice_date: document.getElementById('invoiceDate').value,
            company_id: document.getElementById('companyName').value,
            total_amount: parseFloat(document.getElementById('totalAmount').value),
            tax_amount: parseFloat(document.getElementById('taxAmount').value),
            receipt_status: document.getElementById('receiptStatus').value,
            notes: document.getElementById('notes').value
        };
        
        // Handle file upload if present
        const fileInput = document.getElementById('receiptFile');
        if (fileInput.files.length > 0 && formData.receipt_status === 'received') {
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${formData.invoice_number}_${Date.now()}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, file);
            
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage
                .from('receipts')
                .getPublicUrl(fileName);
            
            formData.receipt_file_url = urlData.publicUrl;
        }
        
        const { data, error } = await supabase
            .from(TABLES.INVOICES)
            .insert([formData]);
        
        if (error) throw error;
        
        alert('✅ تم حفظ الفاتورة بنجاح!');
        document.getElementById('invoiceForm').reset();
        await loadDashboard();
        showPage('dashboard');
        
    } catch (error) {
        console.error('Error adding invoice:', error);
        alert('❌ حدث خطأ أثناء حفظ الفاتورة: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ===== Load Invoices Page =====
async function loadInvoices() {
    showLoading(true);
    
    try {
        const { data, error } = await supabase
            .from(TABLES.INVOICES)
            .select(`
                *,
                companies (name)
            `)
            .order('invoice_date', { ascending: false });
        
        if (error) throw error;
        
        currentInvoices = data || [];
        displayInvoicesTable(currentInvoices);
        
    } catch (error) {
        console.error('Error loading invoices:', error);
    } finally {
        showLoading(false);
    }
}

function displayInvoicesTable(invoices) {
    const container = document.getElementById('invoicesTable');
    
    if (invoices.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد فواتير</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>التاريخ</th>
                    <th>الشركة</th>
                    <th>المبلغ</th>
                    <th>قيمة 1%</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    invoices.forEach(invoice => {
        const statusClass = invoice.receipt_status === 'received' ? 'status-received' : 'status-pending';
        const statusText = invoice.receipt_status === 'received' ? '✅ مستلم' : '❌ لم يستلم';
        
        // Check if overdue
        const today = new Date();
        const invoiceDate = new Date(invoice.invoice_date);
        const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
        const isOverdue = invoice.receipt_status === 'pending' && daysDiff > currentSettings.alertDays;
        
        html += `
            <tr ${isOverdue ? 'style="background: #fff7ed;"' : ''}>
                <td>${invoice.invoice_number}</td>
                <td>${formatDate(invoice.invoice_date)}</td>
                <td>${invoice.companies?.name || 'غير معروف'}</td>
                <td>${parseFloat(invoice.total_amount).toFixed(2)} جنيه</td>
                <td>${parseFloat(invoice.tax_amount).toFixed(2)} جنيه</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-action btn-view" onclick="viewInvoice('${invoice.id}')">👁️ عرض</button>
                        <button class="btn-action btn-edit" onclick="editInvoice('${invoice.id}')">✏️ تعديل</button>
                        <button class="btn-action btn-delete" onclick="deleteInvoice('${invoice.id}')">🗑️ حذف</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ===== Apply Filters =====
function applyFilters() {
    const companyFilter = document.getElementById('filterCompany').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const searchText = document.getElementById('searchInvoice').value.toLowerCase();
    
    let filtered = [...currentInvoices];
    
    if (companyFilter) {
        filtered = filtered.filter(inv => inv.company_id === companyFilter);
    }
    
    if (statusFilter) {
        filtered = filtered.filter(inv => inv.receipt_status === statusFilter);
    }
    
    if (dateFrom) {
        filtered = filtered.filter(inv => new Date(inv.invoice_date) >= new Date(dateFrom));
    }
    
    if (dateTo) {
        filtered = filtered.filter(inv => new Date(inv.invoice_date) <= new Date(dateTo));
    }
    
    if (searchText) {
        filtered = filtered.filter(inv => 
            inv.invoice_number.toLowerCase().includes(searchText) ||
            (inv.companies?.name || '').toLowerCase().includes(searchText)
        );
    }
    
    displayInvoicesTable(filtered);
}

function resetFilters() {
    document.getElementById('filterCompany').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    document.getElementById('searchInvoice').value = '';
    
    displayInvoicesTable(currentInvoices);
}

// ===== Invoice Actions =====
function viewInvoice(invoiceId) {
    const invoice = currentInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    const modal = document.getElementById('invoiceDetailsModal');
    const content = document.getElementById('invoiceDetailsContent');
    
    const statusText = invoice.receipt_status === 'received' ? '✅ مستلم' : '❌ لم يستلم';
    
    let html = `
        <div class="invoice-details">
            <p><strong>رقم الفاتورة:</strong> ${invoice.invoice_number}</p>
            <p><strong>التاريخ:</strong> ${formatDate(invoice.invoice_date)}</p>
            <p><strong>الشركة:</strong> ${invoice.companies?.name || 'غير معروف'}</p>
            <p><strong>المبلغ الإجمالي:</strong> ${parseFloat(invoice.total_amount).toFixed(2)} جنيه</p>
            <p><strong>قيمة 1%:</strong> ${parseFloat(invoice.tax_amount).toFixed(2)} جنيه</p>
            <p><strong>حالة الإيصال:</strong> ${statusText}</p>
    `;
    
    if (invoice.receipt_file_url) {
        html += `<p><strong>الإيصال:</strong> <a href="${invoice.receipt_file_url}" target="_blank">عرض الملف</a></p>`;
    }
    
    if (invoice.notes) {
        html += `<p><strong>ملاحظات:</strong> ${invoice.notes}</p>`;
    }
    
    html += '</div>';
    
    content.innerHTML = html;
    modal.style.display = 'block';
}

function editInvoice(invoiceId) {
    const invoice = currentInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    document.getElementById('editInvoiceId').value = invoice.id;
    document.getElementById('editInvoiceNumber').value = invoice.invoice_number;
    document.getElementById('editInvoiceDate').value = invoice.invoice_date;
    document.getElementById('editCompanyName').value = invoice.company_id;
    document.getElementById('editTotalAmount').value = invoice.total_amount;
    document.getElementById('editTaxAmount').value = invoice.tax_amount;
    document.getElementById('editReceiptStatus').value = invoice.receipt_status;
    document.getElementById('editNotes').value = invoice.notes || '';
    
    if (invoice.receipt_file_url) {
        document.getElementById('currentReceiptPreview').innerHTML = `
            <p>الإيصال الحالي: <a href="${invoice.receipt_file_url}" target="_blank">عرض الملف</a></p>
        `;
    }
    
    toggleEditReceiptUpload();
    
    document.getElementById('editInvoiceModal').style.display = 'block';
}

async function handleEditInvoice(e) {
    e.preventDefault();
    showLoading(true);
    
    try {
        const invoiceId = document.getElementById('editInvoiceId').value;
        const formData = {
            invoice_number: document.getElementById('editInvoiceNumber').value,
            invoice_date: document.getElementById('editInvoiceDate').value,
            company_id: document.getElementById('editCompanyName').value,
            total_amount: parseFloat(document.getElementById('editTotalAmount').value),
            tax_amount: parseFloat(document.getElementById('editTaxAmount').value),
            receipt_status: document.getElementById('editReceiptStatus').value,
            notes: document.getElementById('editNotes').value
        };
        
        // Handle new file upload if present
        const fileInput = document.getElementById('editReceiptFile');
        if (fileInput.files.length > 0 && formData.receipt_status === 'received') {
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${formData.invoice_number}_${Date.now()}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, file);
            
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage
                .from('receipts')
                .getPublicUrl(fileName);
            
            formData.receipt_file_url = urlData.publicUrl;
        }
        
        const { data, error } = await supabase
            .from(TABLES.INVOICES)
            .update(formData)
            .eq('id', invoiceId);
        
        if (error) throw error;
        
        alert('✅ تم تحديث الفاتورة بنجاح!');
        closeEditInvoiceModal();
        await loadInvoices();
        
    } catch (error) {
        console.error('Error updating invoice:', error);
        alert('❌ حدث خطأ أثناء تحديث الفاتورة: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function deleteInvoice(invoiceId) {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    
    showLoading(true);
    
    try {
        const { error } = await supabase
            .from(TABLES.INVOICES)
            .delete()
            .eq('id', invoiceId);
        
        if (error) throw error;
        
        alert('✅ تم حذف الفاتورة بنجاح!');
        await loadInvoices();
        
    } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('❌ حدث خطأ أثناء حذف الفاتورة: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ===== Companies Page =====
async function loadCompaniesPage() {
    showLoading(true);
    
    try {
        // Get companies with invoice stats
        const { data: companies, error: companiesError } = await supabase
            .from(TABLES.COMPANIES)
            .select('*')
            .order('name');
        
        if (companiesError) throw companiesError;
        
        const { data: invoices, error: invoicesError } = await supabase
            .from(TABLES.INVOICES)
            .select('*');
        
        if (invoicesError) throw invoicesError;
        
        const container = document.getElementById('companiesTable');
        
        if (companies.length === 0) {
            container.innerHTML = '<p class="no-data">لا توجد شركات مسجلة</p>';
            return;
        }
        
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>اسم الشركة</th>
                        <th>عدد الفواتير</th>
                        <th>فواتير مستلمة</th>
                        <th>فواتير منتظرة</th>
                        <th>إجمالي 1% المنتظر</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        companies.forEach(company => {
            const companyInvoices = invoices.filter(inv => inv.company_id === company.id);
            const total = companyInvoices.length;
            const received = companyInvoices.filter(inv => inv.receipt_status === 'received').length;
            const pending = companyInvoices.filter(inv => inv.receipt_status === 'pending').length;
            const pendingAmount = companyInvoices
                .filter(inv => inv.receipt_status === 'pending')
                .reduce((sum, inv) => sum + parseFloat(inv.tax_amount), 0);
            
            html += `
                <tr>
                    <td><strong>${company.name}</strong></td>
                    <td>${total}</td>
                    <td class="text-success">${received}</td>
                    <td class="text-warning">${pending}</td>
                    <td class="text-danger">${pendingAmount.toFixed(2)} جنيه</td>
                    <td>
                        <button class="btn-action btn-view" onclick="viewCompanyInvoices('${company.id}')">عرض الفواتير</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading companies page:', error);
    } finally {
        showLoading(false);
    }
}

function viewCompanyInvoices(companyId) {
    // Filter invoices by company and show in invoices page
    document.getElementById('filterCompany').value = companyId;
    showPage('invoices');
    applyFilters();
}

// ===== Reports =====
async function loadReports() {
    generateOverdueReport();
}

async function generateMonthlyReport() {
    const month = parseInt(document.getElementById('reportMonth').value);
    const year = parseInt(document.getElementById('reportYear').value);
    
    const filtered = currentInvoices.filter(inv => {
        const date = new Date(inv.invoice_date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
    
    const container = document.getElementById('monthlyReportContent');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد فواتير في هذا الشهر</p>';
        return;
    }
    
    const total = filtered.length;
    const received = filtered.filter(inv => inv.receipt_status === 'received').length;
    const pending = filtered.filter(inv => inv.receipt_status === 'pending').length;
    const totalAmount = filtered.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
    const totalTax = filtered.reduce((sum, inv) => sum + parseFloat(inv.tax_amount), 0);
    
    let html = `
        <div style="margin-top: 1rem;">
            <p><strong>إجمالي الفواتير:</strong> ${total}</p>
            <p><strong>فواتير مستلمة:</strong> <span class="text-success">${received}</span></p>
            <p><strong>فواتير منتظرة:</strong> <span class="text-warning">${pending}</span></p>
            <p><strong>إجمالي المبالغ:</strong> ${totalAmount.toFixed(2)} جنيه</p>
            <p><strong>إجمالي 1%:</strong> ${totalTax.toFixed(2)} جنيه</p>
        </div>
    `;
    
    container.innerHTML = html;
}

function generateOverdueReport() {
    const today = new Date();
    const alertDays = currentSettings.alertDays;
    
    const overdueInvoices = currentInvoices.filter(invoice => {
        if (invoice.receipt_status !== 'pending') return false;
        
        const invoiceDate = new Date(invoice.invoice_date);
        const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
        
        return daysDiff > alertDays;
    });
    
    const container = document.getElementById('overdueReportContent');
    
    if (overdueInvoices.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد فواتير متأخرة</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>الشركة</th>
                    <th>التاريخ</th>
                    <th>الأيام المتأخرة</th>
                    <th>قيمة 1%</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    overdueInvoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.invoice_date);
        const daysDiff = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));
        
        html += `
            <tr>
                <td>${invoice.invoice_number}</td>
                <td>${invoice.companies?.name || 'غير معروف'}</td>
                <td>${formatDate(invoice.invoice_date)}</td>
                <td class="text-danger">${daysDiff} يوم</td>
                <td class="text-danger">${parseFloat(invoice.tax_amount).toFixed(2)} جنيه</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function generateAnnualReport() {
    const year = parseInt(document.getElementById('annualReportYear').value);
    
    const filtered = currentInvoices.filter(inv => {
        const date = new Date(inv.invoice_date);
        return date.getFullYear() === year;
    });
    
    const container = document.getElementById('annualReportContent');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد فواتير في هذا العام</p>';
        return;
    }
    
    const total = filtered.length;
    const received = filtered.filter(inv => inv.receipt_status === 'received').length;
    const pending = filtered.filter(inv => inv.receipt_status === 'pending').length;
    const totalAmount = filtered.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
    const totalTax = filtered.reduce((sum, inv) => sum + parseFloat(inv.tax_amount), 0);
    const pendingTax = filtered
        .filter(inv => inv.receipt_status === 'pending')
        .reduce((sum, inv) => sum + parseFloat(inv.tax_amount), 0);
    
    let html = `
        <div style="margin-top: 1rem;">
            <p><strong>إجمالي الفواتير:</strong> ${total}</p>
            <p><strong>فواتير مستلمة:</strong> <span class="text-success">${received}</span></p>
            <p><strong>فواتير منتظرة:</strong> <span class="text-warning">${pending}</span></p>
            <p><strong>إجمالي المبالغ:</strong> ${totalAmount.toFixed(2)} جنيه</p>
            <p><strong>إجمالي 1%:</strong> ${totalTax.toFixed(2)} جنيه</p>
            <p><strong>1% المعرض للدفع:</strong> <span class="text-danger">${pendingTax.toFixed(2)} جنيه</span></p>
        </div>
    `;
    
    container.innerHTML = html;
}

// ===== Settings =====
async function loadSettings() {
    try {
        const { data, error } = await supabase
            .from(TABLES.SETTINGS)
            .select('*')
            .limit(1)
            .single();
        
        if (data) {
            currentSettings = {
                alertDays: data.alert_days,
                userName: data.user_name
            };
            
            document.getElementById('alertDays').value = currentSettings.alertDays;
        }
        
        // Load companies list
        loadCompaniesList();
        
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function loadCompaniesList() {
    const container = document.getElementById('companiesList');
    
    if (currentCompanies.length === 0) {
        container.innerHTML = '<p class="no-data">لا توجد شركات مسجلة</p>';
        return;
    }
    
    let html = '';
    currentCompanies.forEach(company => {
        html += `
            <div class="company-item">
                <span>${company.name}</span>
                <div class="company-item-actions">
                    <button class="btn-action btn-delete" onclick="deleteCompany('${company.id}')">🗑️ حذف</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

async function saveSettings() {
    showLoading(true);
    
    try {
        const alertDays = parseInt(document.getElementById('alertDays').value);
        
        const { data, error } = await supabase
            .from(TABLES.SETTINGS)
            .upsert({
                id: 1,
                alert_days: alertDays,
                user_name: currentSettings.userName
            });
        
        if (error) throw error;
        
        currentSettings.alertDays = alertDays;
        alert('✅ تم حفظ الإعدادات بنجاح!');
        
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('❌ حدث خطأ أثناء حفظ الإعدادات: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ===== Company Management =====
function showAddCompanyModal() {
    document.getElementById('addCompanyModal').style.display = 'block';
}

function closeAddCompanyModal() {
    document.getElementById('addCompanyModal').style.display = 'none';
    document.getElementById('addCompanyForm').reset();
}

async function handleAddCompany(e) {
    e.preventDefault();
    showLoading(true);
    
    try {
        const companyName = document.getElementById('newCompanyName').value.trim();
        
        const { data, error } = await supabase
            .from(TABLES.COMPANIES)
            .insert([{ name: companyName }]);
        
        if (error) throw error;
        
        alert('✅ تم إضافة الشركة بنجاح!');
        closeAddCompanyModal();
        await loadCompanies();
        loadCompaniesList();
        
    } catch (error) {
        console.error('Error adding company:', error);
        alert('❌ حدث خطأ أثناء إضافة الشركة: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function deleteCompany(companyId) {
    // Check if company has invoices
    const companyInvoices = currentInvoices.filter(inv => inv.company_id === companyId);
    
    if (companyInvoices.length > 0) {
        alert('❌ لا يمكن حذف هذه الشركة لأنها مرتبطة بفواتير موجودة');
        return;
    }
    
    if (!confirm('هل أنت متأكد من حذف هذه الشركة؟')) return;
    
    showLoading(true);
    
    try {
        const { error } = await supabase
            .from(TABLES.COMPANIES)
            .delete()
            .eq('id', companyId);
        
        if (error) throw error;
        
        alert('✅ تم حذف الشركة بنجاح!');
        await loadCompanies();
        loadCompaniesList();
        
    } catch (error) {
        console.error('Error deleting company:', error);
        alert('❌ حدث خطأ أثناء حذف الشركة: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ===== Modal Controls =====
function closeInvoiceDetailsModal() {
    document.getElementById('invoiceDetailsModal').style.display = 'none';
}

function closeEditInvoiceModal() {
    document.getElementById('editInvoiceModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ===== Utility Functions =====
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
}

function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        // Clear any session data if needed
        window.location.reload();
    }
}
