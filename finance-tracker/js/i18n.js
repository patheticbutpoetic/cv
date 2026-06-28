/* Internationalization — English / Arabic / Hebrew */
const I18N = (() => {
  const translations = {
    en: {
      appTitle: 'Business Finance Tracker - Maghar',
      repairShop: 'Repair Shop', convenienceStore: 'Convenience Store',
      location: 'Maghar',
      dashboard: 'Dashboard', repairJobs: 'Repair Jobs', productSales: 'Product Sales',
      inventory: 'Inventory', dailySales: 'Daily Sales', customerCredit: 'Customer Credit',
      expenses: 'Expenses', reports: 'Reports',
      quickAdd: 'Quick Add', repairJob: 'Repair Job', sale: 'Sale', expense: 'Expense',
      dailySale: 'Daily Sale', customerTab: 'Customer Tab',
      export: 'Export', exportPDF: 'Export PDF', exportExcel: 'Export Excel',
      exportJSON: 'Backup JSON', importJSON: 'Import JSON',
      todaySummary: "Today's Summary", weeklyRevenue: 'Weekly Revenue',
      categoryBreakdown: 'Category Breakdown', recentTransactions: 'Recent Transactions',
      newJob: 'New Job', newSale: 'New Sale', addItem: 'Add Item',
      addDay: 'Add Day', newCustomer: 'New Customer', addExpense: 'Add Expense',
      date: 'Date', customer: 'Customer', customerName: 'Customer Name',
      device: 'Device', charge: 'Charge', profit: 'Profit', status: 'Status',
      actions: 'Actions', notes: 'Notes', amount: 'Amount', currency: 'Currency',
      category: 'Category', product: 'Product', qty: 'Qty', costPrice: 'Cost Price',
      sellingPrice: 'Selling Price', item: 'Item', costPerUnit: 'Cost / Unit',
      totalValue: 'Total Value', cash: 'Cash', visa: 'Visa / Card', total: 'Total',
      parts: 'Parts', consoles: 'Consoles', phones: 'Phones', accessories: 'Accessories',
      other: 'Other', rent: 'Rent', utilities: 'Utilities', tools: 'Tools',
      supplies: 'Supplies', wages: 'Wages', supplier: 'Supplier',
      pending: 'Pending', completed: 'Completed', paid: 'Paid',
      activeTab: 'Active Tab', settled: 'Settled',
      allStatuses: 'All Statuses', allCategories: 'All Categories',
      laborHours: 'Labor Hours', laborRate: 'Labor Rate (ILS/hr)',
      customerCharge: 'Customer Charge (ILS)',
      addPart: 'Add Part', productSale: 'Product Sale', inventoryItem: 'Inventory Item',
      type: 'Type', purchase: 'Purchase', payment: 'Payment',
      addEntry: 'Add Entry', settleTab: 'Mark Settled', createTab: 'Create Tab',
      cancel: 'Cancel', save: 'Save', generate: 'Generate',
      daily: 'Daily', monthly: 'Monthly', yearly: 'Yearly',
      selectReportType: 'Select a report type and date to generate',
      totalRevenue: 'Total Revenue', totalExpenses: 'Total Expenses',
      netProfit: 'Net Profit', outstandingCredit: 'Outstanding Credit',
      repairRevenue: 'Repair Revenue', salesRevenue: 'Sales Revenue',
      dailySummary: 'Daily Summary', monthlySummary: 'Monthly Summary',
      yearlySummary: 'Yearly Summary', currencyBreakdown: 'Currency Breakdown',
      bestDay: 'Best Day', worstDay: 'Worst Day', avgDaily: 'Avg Daily',
      noData: 'No data for this period',
      deleteConfirm: 'Are you sure you want to delete this?',
      saved: 'Saved successfully', deleted: 'Deleted', importSuccess: 'Data imported successfully',
      importError: 'Import failed — invalid file',
      searchJobs: 'Search jobs...', searchSales: 'Search sales...', searchCustomers: 'Search customers...',
      inventoryValue: 'Inventory Value', totalJobs: 'Total Jobs', totalSales: 'Total Sales',
      repairJobsCount: 'Repair Jobs', productSalesCount: 'Sales',
    },
    ar: {
      appTitle: 'متتبع المالية - مغار',
      repairShop: 'ورشة الإصلاح', convenienceStore: 'دكان البقالة',
      location: 'مغار',
      dashboard: 'لوحة التحكم', repairJobs: 'أعمال الإصلاح', productSales: 'مبيعات المنتجات',
      inventory: 'المخزون', dailySales: 'المبيعات اليومية', customerCredit: 'ائتمان العملاء',
      expenses: 'المصروفات', reports: 'التقارير',
      quickAdd: 'إضافة سريعة', repairJob: 'عمل إصلاح', sale: 'بيع', expense: 'مصروف',
      dailySale: 'مبيعات اليوم', customerTab: 'حساب عميل',
      export: 'تصدير', exportPDF: 'تصدير PDF', exportExcel: 'تصدير Excel',
      exportJSON: 'نسخ احتياطي', importJSON: 'استيراد',
      todaySummary: 'ملخص اليوم', weeklyRevenue: 'إيرادات الأسبوع',
      categoryBreakdown: 'تفصيل الفئات', recentTransactions: 'آخر المعاملات',
      newJob: 'عمل جديد', newSale: 'بيع جديد', addItem: 'إضافة صنف',
      addDay: 'إضافة يوم', newCustomer: 'عميل جديد', addExpense: 'إضافة مصروف',
      date: 'التاريخ', customer: 'العميل', customerName: 'اسم العميل',
      device: 'الجهاز', charge: 'الفاتورة', profit: 'الربح', status: 'الحالة',
      actions: 'إجراءات', notes: 'ملاحظات', amount: 'المبلغ', currency: 'العملة',
      category: 'الفئة', product: 'المنتج', qty: 'الكمية', costPrice: 'سعر التكلفة',
      sellingPrice: 'سعر البيع', item: 'الصنف', costPerUnit: 'التكلفة / وحدة',
      totalValue: 'إجمالي القيمة', cash: 'نقد', visa: 'بطاقة', total: 'الإجمالي',
      parts: 'قطع الغيار', consoles: 'أجهزة الألعاب', phones: 'هواتف', accessories: 'ملحقات',
      other: 'أخرى', rent: 'إيجار', utilities: 'مرافق', tools: 'أدوات',
      supplies: 'مستلزمات', wages: 'رواتب', supplier: 'مورّد',
      pending: 'معلّق', completed: 'مكتمل', paid: 'مدفوع',
      activeTab: 'حساب نشط', settled: 'مسدّد',
      allStatuses: 'كل الحالات', allCategories: 'كل الفئات',
      laborHours: 'ساعات العمل', laborRate: 'أجر الساعة (₪)',
      customerCharge: 'فاتورة العميل (₪)',
      addPart: 'أضف قطعة', productSale: 'بيع منتج', inventoryItem: 'صنف مخزون',
      type: 'النوع', purchase: 'شراء', payment: 'دفعة',
      addEntry: 'إضافة قيد', settleTab: 'تسوية الحساب', createTab: 'فتح حساب',
      cancel: 'إلغاء', save: 'حفظ', generate: 'توليد',
      daily: 'يومي', monthly: 'شهري', yearly: 'سنوي',
      selectReportType: 'اختر نوع التقرير والتاريخ لتوليده',
      totalRevenue: 'إجمالي الإيرادات', totalExpenses: 'إجمالي المصروفات',
      netProfit: 'صافي الربح', outstandingCredit: 'الرصيد المستحق',
      repairRevenue: 'إيرادات الإصلاح', salesRevenue: 'إيرادات المبيعات',
      dailySummary: 'الملخص اليومي', monthlySummary: 'الملخص الشهري',
      yearlySummary: 'الملخص السنوي', currencyBreakdown: 'تفصيل العملات',
      bestDay: 'أفضل يوم', worstDay: 'أسوأ يوم', avgDaily: 'المتوسط اليومي',
      noData: 'لا توجد بيانات لهذه الفترة',
      deleteConfirm: 'هل أنت متأكد من الحذف؟',
      saved: 'تم الحفظ', deleted: 'تم الحذف', importSuccess: 'تم الاستيراد بنجاح',
      importError: 'فشل الاستيراد — ملف غير صالح',
      searchJobs: 'بحث في الأعمال...', searchSales: 'بحث في المبيعات...', searchCustomers: 'بحث في العملاء...',
      inventoryValue: 'قيمة المخزون', totalJobs: 'إجمالي الأعمال', totalSales: 'إجمالي المبيعات',
      repairJobsCount: 'أعمال الإصلاح', productSalesCount: 'مبيعات',
    },
    he: {
      appTitle: 'מעקב פיננסי - מגאר',
      repairShop: 'חנות תיקונים', convenienceStore: 'מכולת',
      location: 'מגאר',
      dashboard: 'לוח בקרה', repairJobs: 'עבודות תיקון', productSales: 'מכירות מוצרים',
      inventory: 'מלאי', dailySales: 'מכירות יומיות', customerCredit: 'אשראי לקוחות',
      expenses: 'הוצאות', reports: 'דוחות',
      quickAdd: 'הוסף מהיר', repairJob: 'עבודת תיקון', sale: 'מכירה', expense: 'הוצאה',
      dailySale: 'מכירת יום', customerTab: 'חשבון לקוח',
      export: 'ייצוא', exportPDF: 'ייצוא PDF', exportExcel: 'ייצוא Excel',
      exportJSON: 'גיבוי JSON', importJSON: 'ייבוא JSON',
      todaySummary: 'סיכום היום', weeklyRevenue: 'הכנסות שבועיות',
      categoryBreakdown: 'פירוט קטגוריות', recentTransactions: 'עסקאות אחרונות',
      newJob: 'עבודה חדשה', newSale: 'מכירה חדשה', addItem: 'הוסף פריט',
      addDay: 'הוסף יום', newCustomer: 'לקוח חדש', addExpense: 'הוסף הוצאה',
      date: 'תאריך', customer: 'לקוח', customerName: 'שם הלקוח',
      device: 'מכשיר', charge: 'חיוב', profit: 'רווח', status: 'סטטוס',
      actions: 'פעולות', notes: 'הערות', amount: 'סכום', currency: 'מטבע',
      category: 'קטגוריה', product: 'מוצר', qty: "כמות", costPrice: 'מחיר עלות',
      sellingPrice: 'מחיר מכירה', item: 'פריט', costPerUnit: 'עלות / יחידה',
      totalValue: 'שווי כולל', cash: 'מזומן', visa: 'כרטיס', total: 'סה"כ',
      parts: 'חלקים', consoles: 'קונסולות', phones: 'טלפונים', accessories: 'אביזרים',
      other: 'אחר', rent: 'שכירות', utilities: 'שירותים', tools: 'כלים',
      supplies: 'ציוד', wages: 'שכר', supplier: 'ספק',
      pending: 'ממתין', completed: 'הושלם', paid: 'שולם',
      activeTab: 'חשבון פתוח', settled: 'סגור',
      allStatuses: 'כל הסטטוסים', allCategories: 'כל הקטגוריות',
      laborHours: 'שעות עבודה', laborRate: 'תעריף שעתי (₪)',
      customerCharge: 'חיוב לקוח (₪)',
      addPart: 'הוסף חלק', productSale: 'מכירת מוצר', inventoryItem: 'פריט מלאי',
      type: 'סוג', purchase: 'רכישה', payment: 'תשלום',
      addEntry: 'הוסף רשומה', settleTab: 'סגור חשבון', createTab: 'פתח חשבון',
      cancel: 'ביטול', save: 'שמור', generate: 'ייצר',
      daily: 'יומי', monthly: 'חודשי', yearly: 'שנתי',
      selectReportType: 'בחר סוג דוח ותאריך',
      totalRevenue: 'סה"כ הכנסות', totalExpenses: 'סה"כ הוצאות',
      netProfit: 'רווח נקי', outstandingCredit: 'חוב פתוח',
      repairRevenue: 'הכנסות תיקונים', salesRevenue: 'הכנסות מכירות',
      dailySummary: 'סיכום יומי', monthlySummary: 'סיכום חודשי',
      yearlySummary: 'סיכום שנתי', currencyBreakdown: 'פירוט מטבע',
      bestDay: 'יום הכי טוב', worstDay: 'יום הכי גרוע', avgDaily: 'ממוצע יומי',
      noData: 'אין נתונים לתקופה זו',
      deleteConfirm: 'האם אתה בטוח שברצונך למחוק?',
      saved: 'נשמר בהצלחה', deleted: 'נמחק', importSuccess: 'הנתונים יובאו בהצלחה',
      importError: 'ייבוא נכשל - קובץ לא תקין',
      searchJobs: 'חפש עבודות...', searchSales: 'חפש מכירות...', searchCustomers: 'חפש לקוחות...',
      inventoryValue: 'שווי מלאי', totalJobs: 'סה"כ עבודות', totalSales: 'סה"כ מכירות',
      repairJobsCount: 'עבודות תיקון', productSalesCount: 'מכירות',
    }
  };

  let current = 'en';

  function t(key) {
    return (translations[current] || translations.en)[key] || key;
  }

  function apply(lang) {
    current = lang;
    const html = document.documentElement;
    html.lang = lang;
    html.dir = (lang === 'ar' || lang === 'he') ? 'rtl' : 'ltr';

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = t(key);
    });
    // Placeholder
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPh);
    });
    // Title
    document.title = t('appTitle');

    // Update active lang button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Store preference
    localStorage.setItem('lang', lang);
  }

  function init() {
    const saved = localStorage.getItem('lang') || 'en';
    apply(saved);
  }

  return { t, apply, init, current: () => current };
})();
