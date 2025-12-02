// ===== ALL IN ONE FILE =====

// 1. UTILS FUNCTIONS
function formatRupiah(amount) {
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function showNotification(message, type = 'success') {
    // ... kode showNotification yang sudah diperbaiki ...
}

// 2. DATABASE
const database = {
    // ... kode database dari database.js ...
};

// 3. KASIR FUNCTIONS
let cart = [];
function addToCart(product) { /* ... */ }
function updateCartDisplay() { /* ... */ }
function initKasir() { /* ... */ }

// 4. STATISTICS FUNCTIONS
function initStatistik() { /* ... */ }

// 5. APP INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Starting app...');
    
    // Initialize database
    if (database.init) database.init();
    
    // Initialize kasir
    if (typeof initKasir === 'function') initKasir();
    
    // Setup tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
            
            console.log('Tab changed to:', tabId);
        });
    });
    
    console.log('App ready!');
});
