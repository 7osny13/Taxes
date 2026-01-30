// =========================
// REPORTS FUNCTIONS
// =========================

async function generateMonthlyReport() {
    const month = document.getElementById('reportMonth').value;
    const year = document.getElementById('reportYear').value;

    if (!month) {
        showNotification('يرجى اختيار الشهر', 'error');
        return;
    }

    showLoading();

    try {
        // Filter invoices for selected month
        const monthInvoices = currentInvoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getMonth() + 1 === parseInt(month) && 
                   invDate.getFullYear() === parseInt(year);
        });

        if (monthInvoices.length === 0) {
            showNotification('لا توجد فواتير في هذا الشهر', 'error');
            hideLoading();
            return;
        }

        // Calculate statistics
        const stats = calculateMonthlyStats(monthInvoices);

        // Display report
        displayMonthlyReport(month, year, monthInvoices, stats);

        hideLoading();
    } catch (error) {
        console.error('Error generating report:', error);
        showNotification('خطأ في إنشاء التقرير', 'error');
        hideLoading();
    }
}

function calculateMonthlyStats(invoices) {
    const total = invoices.length;
    const received = invoices.filter(inv => getInvoiceStatus(inv) === STATUS.RECEIVED).length;
    const pending = invoices.filter(inv => getInvoiceStatus(inv) === STATUS.PENDING).length;
    const overdue = invoices.filter(inv => getInvoiceStatus(inv) === STATUS.OVERDUE).length;

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalTax = invoices.reduce((sum, inv) => sum + inv.tax_amount, 0);
    
    const receivedTax = invoices
        .filter(inv => getInvoiceStatus(inv) === STATUS.RECEIVED)
        .reduce((sum, inv) => sum + inv.tax_amount, 0);
    
    const pendingTax = invoices
        .filter(inv => getInvoiceStatus(inv) !== STATUS.RECEIVED)
        .reduce((sum, inv) => sum + inv.tax_amount, 0);

    return {
        total,
        received,
        pending,
        overdue,
        totalAmount,
        totalTax,
        receivedTax,
        pendingTax,
        receivedPercentage: total > 0 ? ((received / total) * 100).toFixed(1) : 0
    };
}

function displayMonthlyReport(month, year, invoices, stats) {
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    // Summary section
    const summaryHTML = `
        <h3>تقرير شهر ${monthNames[month - 1]} ${year}</h3>
        <div class="report-stats">
            <div class="report-stat">
                <span class="report-stat-label">إجمالي الفواتير</span>
                <span class="report-stat-value">${stats.total}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">مستلمة</span>
                <span class="report-stat-value">${stats.received}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">معلقة</span>
                <span class="report-stat-value">${stats.pending}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">متأخرة</span>
                <span class="report-stat-value">${stats.overdue}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">نسبة الاستلام</span>
                <span class="report-stat-value">${stats.receivedPercentage}%</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">إجمالي المبالغ</span>
                <span class="report-stat-value">${formatCurrency(stats.totalAmount)}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">إجمالي 1%</span>
                <span class="report-stat-value">${formatCurrency(stats.totalTax)}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">1% مستلمة</span>
                <span class="report-stat-value">${formatCurrency(stats.receivedTax)}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">1% معلقة</span>
                <span class="report-stat-value">${formatCurrency(stats.pendingTax)}</span>
            </div>
        </div>
    `;

    document.getElementById('reportSummary').innerHTML = summaryHTML;

    // Detailed sections
    const receivedInvoices = invoices.filter(inv => getInvoiceStatus(inv) === STATUS.RECEIVED);
    const pendingInvoices = invoices.filter(inv => getInvoiceStatus(inv) === STATUS.PENDING);
    const overdueInvoices = invoices.filter(inv => getInvoiceStatus(inv) === STATUS.OVERDUE);

    let contentHTML = '';

    // Received invoices
    if (receivedInvoices.length > 0) {
        contentHTML += `
            <div class="report-section">
                <h4>✅ الفواتير المستلمة (${receivedInvoices.length})</h4>
                ${generateInvoiceTable(receivedInvoices)}
            </div>
        `;
    }

    // Pending invoices
    if (pendingInvoices.length > 0) {
        contentHTML += `
            <div class="report-section">
                <h4>⏳ الفواتير المعلقة (${pendingInvoices.length})</h4>
                ${generateInvoiceTable(pendingInvoices)}
            </div>
        `;
    }

    // Overdue invoices
    if (overdueInvoices.length > 0) {
        contentHTML += `
            <div class="report-section">
                <h4>⚠️ الفواتير المتأخرة (${overdueInvoices.length})</h4>
                ${generateInvoiceTable(overdueInvoices)}
            </div>
        `;
    }

    // Company summary
    contentHTML += `
        <div class="report-section">
            <h4>📊 ملخص الشركات</h4>
            ${generateCompanySummary(invoices)}
        </div>
    `;

    // Print button
    contentHTML += `
        <div style="text-align: center; margin-top: 30px;">
            <button class="btn-primary" onclick="printReport()">🖨️ طباعة التقرير</button>
        </div>
    `;

    document.getElementById('reportContent').innerHTML = contentHTML;
}

function generateInvoiceTable(invoices) {
    return `
        <table style="width: 100%; margin-top: 15px;">
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
                ${invoices.map(inv => `
                    <tr>
                        <td>${inv.number}</td>
                        <td>${formatDate(inv.date)}</td>
                        <td>${inv.company?.name || 'غير محدد'}</td>
                        <td>${formatCurrency(inv.amount)}</td>
                        <td>${formatCurrency(inv.tax_amount)}</td>
                        <td><span class="status-badge status-${getInvoiceStatus(inv)}">${getStatusText(getInvoiceStatus(inv))}</span></td>
                    </tr>
                `).join('')}
                <tr style="font-weight: bold; background: #f0f0f0;">
                    <td colspan="3">الإجمالي</td>
                    <td>${formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}</td>
                    <td>${formatCurrency(invoices.reduce((sum, inv) => sum + inv.tax_amount, 0))}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    `;
}

function generateCompanySummary(invoices) {
    // Group invoices by company
    const companyStats = {};
    
    invoices.forEach(inv => {
        const companyId = inv.company_id;
        const companyName = inv.company?.name || 'غير محدد';
        
        if (!companyStats[companyId]) {
            companyStats[companyId] = {
                name: companyName,
                total: 0,
                received: 0,
                pending: 0,
                overdue: 0,
                totalTax: 0,
                receivedTax: 0,
                pendingTax: 0
            };
        }
        
        const status = getInvoiceStatus(inv);
        companyStats[companyId].total++;
        companyStats[companyId].totalTax += inv.tax_amount;
        
        if (status === STATUS.RECEIVED) {
            companyStats[companyId].received++;
            companyStats[companyId].receivedTax += inv.tax_amount;
        } else if (status === STATUS.PENDING) {
            companyStats[companyId].pending++;
            companyStats[companyId].pendingTax += inv.tax_amount;
        } else if (status === STATUS.OVERDUE) {
            companyStats[companyId].overdue++;
            companyStats[companyId].pendingTax += inv.tax_amount;
        }
    });

    return `
        <table style="width: 100%; margin-top: 15px;">
            <thead>
                <tr>
                    <th>الشركة</th>
                    <th>عدد الفواتير</th>
                    <th>مستلمة</th>
                    <th>معلقة</th>
                    <th>متأخرة</th>
                    <th>إجمالي 1%</th>
                    <th>1% مستلمة</th>
                    <th>1% معلقة</th>
                </tr>
            </thead>
            <tbody>
                ${Object.values(companyStats).map(company => `
                    <tr>
                        <td>${company.name}</td>
                        <td>${company.total}</td>
                        <td>${company.received}</td>
                        <td>${company.pending}</td>
                        <td>${company.overdue}</td>
                        <td>${formatCurrency(company.totalTax)}</td>
                        <td>${formatCurrency(company.receivedTax)}</td>
                        <td>${formatCurrency(company.pendingTax)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function printReport() {
    window.print();
}

// Export functions for annual reports
async function generateAnnualReport() {
    const year = document.getElementById('reportYear').value;
    
    showLoading();

    try {
        // Filter invoices for selected year
        const yearInvoices = currentInvoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getFullYear() === parseInt(year);
        });

        if (yearInvoices.length === 0) {
            showNotification('لا توجد فواتير في هذا العام', 'error');
            hideLoading();
            return;
        }

        // Generate monthly breakdown
        const monthlyBreakdown = {};
        for (let month = 1; month <= 12; month++) {
            const monthInvoices = yearInvoices.filter(inv => {
                const invDate = new Date(inv.date);
                return invDate.getMonth() + 1 === month;
            });
            
            if (monthInvoices.length > 0) {
                monthlyBreakdown[month] = calculateMonthlyStats(monthInvoices);
            }
        }

        // Display annual report
        displayAnnualReport(year, yearInvoices, monthlyBreakdown);

        hideLoading();
    } catch (error) {
        console.error('Error generating annual report:', error);
        showNotification('خطأ في إنشاء التقرير السنوي', 'error');
        hideLoading();
    }
}

function displayAnnualReport(year, invoices, monthlyBreakdown) {
    const stats = calculateMonthlyStats(invoices);
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    // Summary section
    const summaryHTML = `
        <h3>التقرير السنوي ${year}</h3>
        <div class="report-stats">
            <div class="report-stat">
                <span class="report-stat-label">إجمالي الفواتير</span>
                <span class="report-stat-value">${stats.total}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">مستلمة</span>
                <span class="report-stat-value">${stats.received}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">معلقة</span>
                <span class="report-stat-value">${stats.pending}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">متأخرة</span>
                <span class="report-stat-value">${stats.overdue}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">نسبة الاستلام</span>
                <span class="report-stat-value">${stats.receivedPercentage}%</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">إجمالي المبالغ</span>
                <span class="report-stat-value">${formatCurrency(stats.totalAmount)}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">إجمالي 1%</span>
                <span class="report-stat-value">${formatCurrency(stats.totalTax)}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">1% مستلمة</span>
                <span class="report-stat-value">${formatCurrency(stats.receivedTax)}</span>
            </div>
            <div class="report-stat">
                <span class="report-stat-label">1% معلقة</span>
                <span class="report-stat-value">${formatCurrency(stats.pendingTax)}</span>
            </div>
        </div>
    `;

    document.getElementById('reportSummary').innerHTML = summaryHTML;

    // Monthly breakdown
    let contentHTML = `
        <div class="report-section">
            <h4>📅 التفصيل الشهري</h4>
            <table style="width: 100%; margin-top: 15px;">
                <thead>
                    <tr>
                        <th>الشهر</th>
                        <th>الفواتير</th>
                        <th>مستلمة</th>
                        <th>معلقة</th>
                        <th>متأخرة</th>
                        <th>إجمالي 1%</th>
                        <th>1% مستلمة</th>
                    </tr>
                </thead>
                <tbody>
    `;

    for (let month = 1; month <= 12; month++) {
        if (monthlyBreakdown[month]) {
            const mStats = monthlyBreakdown[month];
            contentHTML += `
                <tr>
                    <td>${monthNames[month - 1]}</td>
                    <td>${mStats.total}</td>
                    <td>${mStats.received}</td>
                    <td>${mStats.pending}</td>
                    <td>${mStats.overdue}</td>
                    <td>${formatCurrency(mStats.totalTax)}</td>
                    <td>${formatCurrency(mStats.receivedTax)}</td>
                </tr>
            `;
        }
    }

    contentHTML += `
                    <tr style="font-weight: bold; background: #f0f0f0;">
                        <td>الإجمالي</td>
                        <td>${stats.total}</td>
                        <td>${stats.received}</td>
                        <td>${stats.pending}</td>
                        <td>${stats.overdue}</td>
                        <td>${formatCurrency(stats.totalTax)}</td>
                        <td>${formatCurrency(stats.receivedTax)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // Print button
    contentHTML += `
        <div style="text-align: center; margin-top: 30px;">
            <button class="btn-primary" onclick="printReport()">🖨️ طباعة التقرير</button>
        </div>
    `;

    document.getElementById('reportContent').innerHTML = contentHTML;
}

// Export report data to CSV
function exportToCSV() {
    const month = document.getElementById('reportMonth').value;
    const year = document.getElementById('reportYear').value;

    if (!month) {
        showNotification('يرجى اختيار الشهر أولاً', 'error');
        return;
    }

    const monthInvoices = currentInvoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.getMonth() + 1 === parseInt(month) && 
               invDate.getFullYear() === parseInt(year);
    });

    if (monthInvoices.length === 0) {
        showNotification('لا توجد بيانات للتصدير', 'error');
        return;
    }

    // Prepare CSV data
    let csv = 'رقم الفاتورة,التاريخ,الشركة,المبلغ,قيمة 1%,الحالة\n';
    
    monthInvoices.forEach(inv => {
        csv += `"${inv.number}","${formatDate(inv.date)}","${inv.company?.name || 'غير محدد'}",${inv.amount},${inv.tax_amount},"${getStatusText(getInvoiceStatus(inv))}"\n`;
    });

    // Download CSV
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tax-report-${year}-${month}.csv`;
    link.click();

    showNotification('تم تصدير التقرير بنجاح', 'success');
}
