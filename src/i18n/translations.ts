export type Language = "bn" | "en";

export const translations = {
  bn: {
    // Brand & App
    appName: "দোকানম্যান",
    appTagline: "টং ও দোকান বাকির খাতা ও দ্রুত ক্যাশ কাউন্টার",
    live: "লাইভ",
    logout: "লগআউট",
    shop: "দোকান",

    // Tabs
    tabPos: "POS কাউন্টার",
    tabLedger: "বাকির খাতা",
    tabExpenses: "দোকানের খরচ",
    tabReports: "হিসাব ও ব্যাকআপ",

    // Header Metrics
    todayCash: "আজকের ক্যাশ",
    todayDue: "আজকের বাকি",
    totalStoreDue: "মোট বকেয়া বাকি",
    todayExpense: "আজকের খরচ",
    todayNetProfit: "আজকের লাভ (ক্যাশ - খরচ)",

    // Universal Search
    searchCustomerPlaceholder: "কাস্টমার খুঁজুন (নাম বা মোবাইল নম্বর)...",
    newCustomerBtn: "নতুন (+)",
    changeCustomer: "পরিবর্তন",
    customerList: "কাস্টমার তালিকা",
    noCustomerFound: "নামে কোনো কাস্টমার পাওয়া যায়নি",
    createNamedCustomer: "নামে নতুন কাস্টমার তৈরি করুন",
    dueBadge: "বাকি",
    totalDueLabel: "খাতার মোট বাকি:",

    // Quick Item Grid
    quickMenuTitle: "টং স্পেশাল মেন্যু (Quick Items)",
    tapToAddHint: "ট্যাপ করলেই কার্টে যোগ হবে",

    // Cart Panel
    activeCart: "সক্রিয় ক্যাশ কার্ট",
    emptyCartTitle: "কার্ট সম্পূর্ণ খালি",
    emptyCartDesc: "বাম পাশের মেন্যু থেকে চা, টোস্ট বা সিগারেটের উপর ট্যাপ করুন অথবা কাস্টম আইটেম লিখুন।",
    clearCart: "খালি করুন",
    customProductBtn: "অন্যান্য পণ্য যোগ করুন (+)",
    customProductName: "পণ্যের নাম (যেমন: পান)",
    customProductPrice: "মূল্য ৳",
    addCustomItem: "যোগ করুন",
    cancel: "বাতিল",
    orderTotal: "বর্তমান অর্ডার মূল্য:",
    prevDue: "খাতার পূর্বের বকেয়া:",
    newGrandBalance: "মোট বকেয়া দাঁড়াবে:",
    paymentType: "পরিশোধের ধরণ:",
    payCash: "নগদ পরিশোধ",
    payDue: "সম্পূর্ণ বাকি",
    payPartial: "আংশিক জমা",
    partialPaidAmount: "ক্যাশ কত জমা দিয়েছে?",
    partialDueRemains: "বাকি থাকবে:",
    allPaid: "পুরোটাই",
    confirmOrder: "অর্ডার সম্পন্ন করুন",
    savingOrder: "অর্ডার সেভ হচ্ছে...",
    selectCustomerForDueAlert: "বাকি অর্ডারের জন্য অবশ্যই কাস্টমার সিলেক্ট করতে হবে!",

    // Bakhi Khata (Ledger)
    ledgerTitle: "ডিজিটাল বাকির খাতা",
    ledgerSubtitle: "সকল কাস্টমারের বাকি, পেমেন্ট হিসাব ও দ্রুত হোয়াটসঅ্যাপ তাগাদা",
    addCustomer: "নতুন কাস্টমার যোগ করুন",
    searchLedgerPlaceholder: "খাতায় নাম বা মোবাইল নম্বর দিয়ে খুঁজুন...",
    filterDueOnly: "শুধুমাত্র যাদের বাকি আছে",
    settleDueBtn: "টাকা জমা",
    takeOrderBtn: "অর্ডার নিন",
    whatsappReminder: "হোয়াটসঅ্যাপ",
    smsReminder: "SMS",
    noCustomersFound: "কোনো কাস্টমার পাওয়া যায়নি",

    // Modals
    newCustomerTitle: "নতুন কাস্টমার যোগ করুন",
    customerName: "কাস্টমারের নাম",
    customerPhone: "মোবাইল নম্বর (ঐচ্ছিক)",
    customerOpeningDue: "পূর্বে কোনো বাকি থাকলে (টাকা ৳)",
    saveAndSelectCustomer: "সেভ ও কার্টে যুক্ত করুন",
    settleDueTitle: "বকেয়া বাকি জমা নিন",
    settleAmount: "জমা গ্রহণের পরিমাণ (টাকা ৳)",
    fullDue: "পুরো বাকি",
    paymentNote: "পেমেন্ট মাধ্যম / নোট (ঐচ্ছিক)",
    confirmSettle: "জমা নিশ্চিত করুন",

    // Expenses
    expenseTitle: "দৈনিক খরচের হিসাব (Expense Tracker)",
    expenseSubtitle: "দুধ, চিনি, চা পাতা, গ্যাস ও দোকান সামগ্রী খরচের হিসাব",
    addExpenseBtn: "নতুন খরচ যোগ করুন",
    expenseCategory: "খরচের খাত",
    expenseAmount: "টাকার পরিমাণ (৳)",
    expenseNote: "নোট / বিবরণ",
    saveExpense: "খরচ সেভ করুন",
    categoryMilk: "দুধ (Milk)",
    categoryTea: "চা পাতা (Tea Leaves)",
    categorySugar: "চিনি (Sugar)",
    categoryGas: "গ্যাস সিলিন্ডার (LPG Gas)",
    categoryCigaretteCarton: "সিগারেট হোলসেল (Cigarettes)",
    categoryBakery: "বেকারি/বিস্কুট/কেক",
    categoryRentUtility: "দোকান ভাড়া/বিদ্যুৎ",
    categoryMisc: "অন্যান্য খরচ (Misc)",
    noExpensesYet: "আজকের কোনো খরচ এন্ট্রি করা হয়নি।",

    // Backup & Export
    backupTitle: "ডেটা ব্যাকআপ ও এক্সপোর্ট-ইমপোর্ট",
    backupSubtitle: "আপনার দোকানের সকল হিসাব নিরাপদে সংরক্ষণ ও রিস্টোর করুন",
    exportJsonBackup: "সম্পূর্ণ ডেটা ব্যাকআপ ডাউনলোড (JSON)",
    exportJsonDesc: "দোকানের সকল পণ্য, কাস্টমার, অর্ডার ও ট্রানজাকশন ১-ক্লিকে ব্যাকআপ ফাইল হিসেবে সেভ করুন।",
    exportCustomersCsv: "কাস্টমার ও বাকির তালিকা (CSV)",
    exportTransactionsCsv: "সকল ট্রানজাকশন লেজার (CSV)",
    exportOrdersCsv: "বিক্রি ও অর্ডারের হিসাব (CSV)",
    restoreBackupTitle: "ব্যাকআপ ফাইল রিস্টোর করুন",
    restoreBackupDesc: "পূর্বে ডাউনলোড করা JSON ব্যাকআপ ফাইল নির্বাচন করুন",
    uploadAndRestore: "ব্যাকআপ রিস্টোর করুন",
    dailySummarySlip: "আজকের হিসাব স্লিপ (Daily Summary)",
    printSlip: "প্রিন্ট করুন",
    shareWhatsApp: "WhatsApp-এ হিসাব শেয়ার করুন",
    cashInDrawer: "ক্যাশ বাক্সে থাকা টাকা",

    // Product Catalog
    productCatalogTitle: "পণ্য তালিকা ও দাম (মেন্যু ম্যানেজার)",
    addProductBtn: "নতুন পণ্য যোগ করুন",
    productNamePlaceholder: "পণ্যের নাম (যেমন: পান)",
    productPricePlaceholder: "দাম ৳",
    saveProduct: "সেভ",
    editPrice: "দাম পরিবর্তন করুন",
    toggleQuickAccess: "কুইক মেন্যুতে দেখান / লুকান",
    deleteProduct: "পণ্য মুছে ফেলুন",
    quickMenuBadge: "কুইক",
    noProductsYet: "এখনো কোনো পণ্য যোগ করা হয়নি।",

    // Navigation buttons & footer
    navProducts: "পণ্য",
    navSlip: "হিসাব স্লিপ",
    navBackup: "ব্যাকআপ",
    footerTagline: "লোকাল টং ও মুদি দোকানের দ্রুততম ডিজিটাল বাকির খাতা ও সেলস পিওএস।",
    historyBtn: "ইতিহাস",
    customerHistoryTitle: "কাস্টমারের লেনদেন ইতিহাস",
    noHistoryYet: "এই কাস্টমারের এখনো কোনো লেনদেন নেই।",
    purchaseType: "বাকি বিক্রি",
    paymentTypeLabel: "জমা গ্রহণ",

    // Daily closing slip labels
    slipCashSales: "আজকের ক্যাশ আদায়:",
    slipCreditSales: "আজকের বাকি বিক্রি:",
    slipOrders: "মোট সম্পন্ন অর্ডার:",
    slipExpenses: "আজকের দোকানের খরচ:",
    slipNetCash: "ক্যাশ বাক্সে থাকা টাকা:",
    slipTotalDue: "খাতায় মোট দেনা পাওনা:",
    slipFooter: "দোকানম্যান (Dokanman) — হিসাব সোজা, মন চাঙ্গা",
    slipHeading: "★ দৈনিক ক্লোজিং হিসাব স্লিপ ★",
    itemsUnit: "টি",

    // Expenses
    totalExpensesAll: "মোট খরচ:",
    expensesTodayOnly: "আজকের খরচ",
    deleteExpenseConfirm: "এই খরচ এন্ট্রিটি মুছে ফেলতে চান?",

    // Cart extras
    orderNoteLabel: "অর্ডার নোট (ঐচ্ছিক)",
    orderNotePlaceholder: "উদা: ২ কাপ চা বাকি, বিকেলে দিবে",

    // Backup modal action labels
    downloadJsonBtn: "ব্যাকআপ ফাইল ডাউনলোড করুন (.json)",
    csvExportHeading: "এক্সেল ও স্প্রেডশিট এক্সপোর্ট (CSV)",
    csvExpenses: "খরচের হিসাব (CSV)",
    csvExpensesSub: "দৈনিক খরচের রিপোর্ট",
    customersCsvSub: "নাম ও বকেয়ার তালিকা",
    transactionsCsvSub: "বাকি ও জমা লেনদেন",
    ordersCsvSub: "বিক্রির মোট হিসেব",
    downloading: "ডাউনলোড হচ্ছে...",
    restoringNow: "রিস্টোর হচ্ছে...",
    importingNow: "ইমপোর্ট হচ্ছে...",

    // Settings & profile
    settingsTitle: "দোকান প্রোফাইল ও সেটিংস",
    settingsProfileSection: "দোকানের তথ্য",
    settingsPinSection: "পিন কোড পরিবর্তন",
    settingsShopName: "দোকানের নাম",
    currentPin: "বর্তমান পিন কোড",
    newPin: "নতুন পিন কোড (৪-৬ ডিজিট)",
    saveProfile: "তথ্য সেভ করুন",
    changePinBtn: "পিন পরিবর্তন করুন",
    profileSaved: "দোকানের তথ্য সেভ হয়েছে!",
    pinChanged: "পিন কোড পরিবর্তন হয়েছে!",
    pinMismatch: "বর্তমান পিন কোড সঠিক নয়",
    viewCart: "কার্ট দেখুন",

    // CSV Import & Restore Modes
    importCustomersCsvTitle: "কাস্টমার তালিকা ইমপোর্ট (CSV)",
    importCustomersCsvDesc: "নাম, মোবাইল নম্বর ও পূর্বের বাকি কলামসহ CSV ফাইল আপলোড করুন।",
    importCustomersCsvBtn: "কাস্টমার CSV আপলোড করুন",
    importModeLabel: "রিস্টোর করার ধরন:",
    importModeMerge: "মার্জ (নতুন ডেটা যোগ হবে)",
    importModeReplace: "রিপ্লেস (পুরোনো ডেটা মুছে যাবে)",
  },
  en: {
    // Brand & App
    appName: "Dokanman",
    appTagline: "Tong Stall POS & Digital Credit Ledger",
    live: "Live",
    logout: "Logout",
    shop: "Shop",

    // Tabs
    tabPos: "POS Counter",
    tabLedger: "Bakhi Khata (Ledger)",
    tabExpenses: "Expenses",
    tabReports: "Reports & Backup",

    // Header Metrics
    todayCash: "Today's Cash",
    todayDue: "Today's Due",
    totalStoreDue: "Total Credit Due",
    todayExpense: "Today's Expense",
    todayNetProfit: "Net Cash (Cash - Expense)",

    // Universal Search
    searchCustomerPlaceholder: "Search customer by name or phone...",
    newCustomerBtn: "New (+)",
    changeCustomer: "Change",
    customerList: "Customer List",
    noCustomerFound: "No customer found with name",
    createNamedCustomer: "Create new customer named",
    dueBadge: "Due",
    totalDueLabel: "Total ledger due:",

    // Quick Item Grid
    quickMenuTitle: "Tong Quick Menu Items",
    tapToAddHint: "Tap any item to add to active cart",

    // Cart Panel
    activeCart: "Active POS Cart",
    emptyCartTitle: "Cart is empty",
    emptyCartDesc: "Tap items on the left menu (Tea, Coffee, Toast, Cigarettes) or add custom item.",
    clearCart: "Clear Cart",
    customProductBtn: "Add custom product (+)",
    customProductName: "Product name (e.g. Betel Leaf)",
    customProductPrice: "Price ৳",
    addCustomItem: "Add Item",
    cancel: "Cancel",
    orderTotal: "Current Order Total:",
    prevDue: "Customer Previous Due:",
    newGrandBalance: "New Total Due Balance:",
    paymentType: "Payment Type:",
    payCash: "Paid (Cash/bKash)",
    payDue: "Full Credit (Bakhi)",
    payPartial: "Partial Paid",
    partialPaidAmount: "Amount Paid in Cash?",
    partialDueRemains: "Due Remaining:",
    allPaid: "Full Amount",
    confirmOrder: "Confirm Order",
    savingOrder: "Saving Order...",
    selectCustomerForDueAlert: "Customer must be selected for Credit (Bakhi) orders!",

    // Bakhi Khata (Ledger)
    ledgerTitle: "Digital Bakhi Khata (Credit Ledger)",
    ledgerSubtitle: "Track customer balances, settlements & instant WhatsApp reminders",
    addCustomer: "Add New Customer",
    searchLedgerPlaceholder: "Search ledger by name or phone...",
    filterDueOnly: "Filter: Has Active Due Only",
    settleDueBtn: "Settle Payment",
    takeOrderBtn: "New Order",
    whatsappReminder: "WhatsApp",
    smsReminder: "SMS",
    noCustomersFound: "No customers found",

    // Modals
    newCustomerTitle: "Add New Customer",
    customerName: "Customer Name",
    customerPhone: "Mobile Phone (Optional)",
    customerOpeningDue: "Opening Due Balance (৳)",
    saveAndSelectCustomer: "Save & Select to Cart",
    settleDueTitle: "Settle Due Payment",
    settleAmount: "Payment Received Amount (৳)",
    fullDue: "Full Due",
    paymentNote: "Payment Method / Note (Optional)",
    confirmSettle: "Confirm Payment",

    // Expenses
    expenseTitle: "Daily Store Expense Tracker",
    expenseSubtitle: "Record milk, sugar, tea powder, gas & shop expenditures",
    addExpenseBtn: "Add New Expense",
    expenseCategory: "Expense Category",
    expenseAmount: "Amount (৳)",
    expenseNote: "Note / Description",
    saveExpense: "Save Expense",
    categoryMilk: "Milk",
    categoryTea: "Tea Leaves / Powder",
    categorySugar: "Sugar",
    categoryGas: "LPG Gas Cylinder",
    categoryCigaretteCarton: "Cigarette Wholesale",
    categoryBakery: "Bakery / Biscuits / Cake",
    categoryRentUtility: "Shop Rent / Electricity",
    categoryMisc: "Miscellaneous",
    noExpensesYet: "No expenses recorded today.",

    // Backup & Export
    backupTitle: "Data Backup & Import / Export",
    backupSubtitle: "Safely download, export or restore your store's entire ledger",
    exportJsonBackup: "Download Complete Store Backup (JSON)",
    exportJsonDesc: "Export all products, customers, orders, transactions & expenses in 1-click.",
    exportCustomersCsv: "Export Customers & Due List (CSV)",
    exportTransactionsCsv: "Export Transaction Ledger (CSV)",
    exportOrdersCsv: "Export Sales & Orders (CSV)",
    restoreBackupTitle: "Restore from Backup File",
    restoreBackupDesc: "Select a previously exported JSON backup file",
    uploadAndRestore: "Restore Backup Data",
    dailySummarySlip: "Daily Closing Slip (হিসাব স্লিপ)",
    printSlip: "Print Slip",
    shareWhatsApp: "Share Summary via WhatsApp",
    cashInDrawer: "Net Cash in Drawer",

    // Product Catalog
    productCatalogTitle: "Product Catalog & Prices",
    addProductBtn: "Add New Product",
    productNamePlaceholder: "Product name (e.g. Betel Leaf)",
    productPricePlaceholder: "Price ৳",
    saveProduct: "Save",
    editPrice: "Edit price",
    toggleQuickAccess: "Show / hide in quick menu",
    deleteProduct: "Delete product",
    quickMenuBadge: "Quick",
    noProductsYet: "No products added yet.",

    // Navigation buttons & footer
    navProducts: "Products",
    navSlip: "Day Slip",
    navBackup: "Backup",
    footerTagline: "The fastest digital credit ledger & POS for local Tong and grocery shops.",
    historyBtn: "History",
    customerHistoryTitle: "Customer Transaction History",
    noHistoryYet: "No transactions for this customer yet.",
    purchaseType: "Credit Sale",
    paymentTypeLabel: "Payment Received",

    // Daily closing slip labels
    slipCashSales: "Today's Cash Collected:",
    slipCreditSales: "Today's Credit Sales:",
    slipOrders: "Completed Orders:",
    slipExpenses: "Today's Shop Expenses:",
    slipNetCash: "Cash in Drawer:",
    slipTotalDue: "Total Ledger Due:",
    slipFooter: "Dokanman — accounts made simple",
    slipHeading: "★ DAILY CLOSING SLIP ★",
    itemsUnit: "pcs",

    // Expenses
    totalExpensesAll: "Total Expenses:",
    expensesTodayOnly: "Today's Expenses",
    deleteExpenseConfirm: "Delete this expense entry?",

    // Cart extras
    orderNoteLabel: "Order note (optional)",
    orderNotePlaceholder: "e.g. 2 cups tea on credit, pays in the evening",

    // Backup modal action labels
    downloadJsonBtn: "Download Backup File (.json)",
    csvExportHeading: "Excel & Spreadsheet Export (CSV)",
    csvExpenses: "Expense Report (CSV)",
    csvExpensesSub: "Daily expense report",
    customersCsvSub: "Names and due balances",
    transactionsCsvSub: "Credit & payment ledger",
    ordersCsvSub: "Sales totals",
    downloading: "Downloading...",
    restoringNow: "Restoring...",
    importingNow: "Importing...",

    // Settings & profile
    settingsTitle: "Shop Profile & Settings",
    settingsProfileSection: "Shop Details",
    settingsPinSection: "Change PIN Code",
    settingsShopName: "Shop Name",
    currentPin: "Current PIN Code",
    newPin: "New PIN Code (4-6 digits)",
    saveProfile: "Save Details",
    changePinBtn: "Change PIN",
    profileSaved: "Shop details saved!",
    pinChanged: "PIN code changed!",
    pinMismatch: "Current PIN code is incorrect",
    viewCart: "View Cart",

    // CSV Import & Restore Modes
    importCustomersCsvTitle: "Import Customers (CSV)",
    importCustomersCsvDesc: "Upload a CSV with Name, Phone and Starting Due columns.",
    importCustomersCsvBtn: "Upload Customers CSV",
    importModeLabel: "Restore mode:",
    importModeMerge: "Merge (add new records)",
    importModeReplace: "Replace (delete existing data)",
  },
};

export function toBengaliDigits(num: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

export function formatCurrency(amount: number | string, lang: Language = "bn"): string {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  const formatted = Math.round(num).toLocaleString("en-US");
  if (lang === "bn") {
    return num < 0 ? `-৳${toBengaliDigits(formatted.replace("-", ""))}` : `৳${toBengaliDigits(formatted)}`;
  }
  return num < 0 ? `-Tk ${formatted.replace("-", "")}` : `Tk ${formatted}`;
}
