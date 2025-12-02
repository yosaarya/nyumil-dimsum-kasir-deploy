// app.js - FIXED VERSION
let appInitialized = false;

const app = {
    async init() {
        if (appInitialized) {
            console.log('App already initialized');
            return;
        }
        
        appInitialized = true;
        console.log('App initializing...');
        
        try {
            // 1. Initialize database FIRST
            if (typeof database !== 'undefined' && database.init) {
                await database.init();
                console.log('Database initialized');
            } else {
                console.error('Database not available');
                return;
            }
            
            // 2. Wait a bit for DOM to be fully ready
            await this.wait(300);
            
            // 3. Setup tabs FIRST (so elements are clickable)
            this.setupTabs();
            
            // 4. Initialize kasir if function exists
            if (typeof initKasir === 'function') {
                console.log('Calling initKasir...');
                initKasir();
            } else {
                console.error('initKasir function not found - trying manual init');
                this.manualInitKasir();
            }
            
            // 5. Initialize statistics if available
            if (typeof initStatistik === 'function') {
                console.log('Calling initStatistik...');
                initStatistik();
            }
            
            console.log('✅ App initialized successfully');
            
        } catch (error) {
            console.error('App initialization error:', error);
        }
    },
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    setupTabs() {
        console.log('Setting up tabs...');
        
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        console.log(`Found ${tabs.length} tabs, ${tabContents.length} tab contents`);
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                console.log(`Tab clicked: ${tabId}`);
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                        console.log(`Showing content: ${content.id}`);
                    }
                });
            });
        });
        
        console.log('Tabs setup complete');
    },
    
    manualInitKasir() {
        console.log('Manual kasir initialization...');
        
        // Check if elements exist
        const elements = {
            menuGrid: document.getElementById('menuGrid'),
            orderList: document.getElementById('orderList'),
            productCategories: document.getElementById('productCategories'),
            clearBtn: document.getElementById('clearBtn'),
            checkoutBtn: document.getElementById('checkoutBtn')
        };
        
        console.log('Elements found:', elements);
        
        // Try to render products if menuGrid exists
        if (elements.menuGrid && typeof renderProducts === 'function') {
            console.log('Calling renderProducts...');
            renderProducts();
        }
        
        // Setup event listeners if buttons exist
        if (elements.clearBtn && typeof clearCart === 'function') {
            elements.clearBtn.addEventListener('click', clearCart);
            console.log('clearBtn event listener added');
        }
        
        if (elements.checkoutBtn && typeof checkout === 'function') {
            elements.checkoutBtn.addEventListener('click', checkout);
            console.log('checkoutBtn event listener added');
        }
        
        console.log('Manual kasir init complete');
    }
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - Starting app...');
    app.init();
});

// Also try on window load for safety
window.addEventListener('load', function() {
    console.log('Window loaded - Double-checking app...');
    if (!appInitialized) {
        setTimeout(() => app.init(), 500);
    }
});
