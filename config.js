// =========================================
// Supabase Configuration
// =========================================

// IMPORTANT: Replace these with your actual Supabase credentials
// Get them from: Supabase Dashboard → Settings → API

const SUPABASE_URL = 'https://sxkefskytnribfrwlgbb.supabase.co'; // e.g., https://xxxxxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4a2Vmc2t5dG5yaWJmcndsZ2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDg0NDYsImV4cCI6MjA4Mzk4NDQ0Nn0.4l80SggO5wXlpJZnQPVy40vBgYVWpCa4CkRwD1mNyr0'; // Your anon/public key

// Supabase client will be initialized when the page loads
let supabase = null;

// Database table names
const TABLES = {
    INVOICES: 'invoices',
    COMPANIES: 'companies',
    SETTINGS: 'settings'
};

// Default settings
const DEFAULT_SETTINGS = {
    alertDays: 30,
    userName: 'عمر'
};

// This function will be called when DOM is ready
function initializeSupabaseClient() {
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded');
        return false;
    }
    
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ Supabase credentials not configured in config.js');
        return false;
    }
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return false;
    }
}
