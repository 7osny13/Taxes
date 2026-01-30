// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://foxvwykyoraznbadozba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveHZ3eWt5b3Jhem5iYWRvemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzI3NzgsImV4cCI6MjA4NTM0ODc3OH0.jDAnMiRI7HQ6AMTOASLQptlKjrD8xxjQjUQm-4tcUWE';

// Initialize Supabase client
let supabase;

// Initialize the app
async function initializeApp() {
    try {
        // Load Supabase library from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        
        script.onload = async () => {
            // Wait a bit for the library to be fully available
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (window.supabase && window.supabase.createClient) {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Supabase initialized successfully');
                
                // Initialize the rest of the app
                if (typeof window.initializeData === 'function') {
                    window.initializeData();
                }
            } else {
                console.error('Supabase library not loaded properly');
            }
        };
        
        script.onerror = () => {
            console.error('Failed to load Supabase library');
        };
        
        document.head.appendChild(script);
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
}

// Database table names
const TABLES = {
    COMPANIES: 'companies',
    INVOICES: 'invoices',
    RECEIPTS: 'receipts'
};

// Alert thresholds (in days)
const ALERT_THRESHOLDS = {
    WARNING: 40,
    DANGER: 50
};

// Status types
const STATUS = {
    PENDING: 'pending',
    RECEIVED: 'received',
    OVERDUE: 'overdue'
};

// Initialize app on page load
document.addEventListener('DOMContentLoaded', initializeApp);
