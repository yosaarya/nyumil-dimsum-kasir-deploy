// app.js - FIXED VERSION (No double init)
let appInitialized = false;

const app = {
    currentTab: 'pos',
    
    async init() {
        // Prevent double initialization
        if (appInitialized) {
            console.log('App already initialized');
            return;
        }
        
        appInitialized = true;
        console.log('App starting...');
        
        try {
            // Initialize database
            if (typeof database !== 'undefined' && typeof database.init === 'function') {
                await database.init();
                console.log('Database initialized');
            } else {
                console.error('Database not found');
                return;
            }
            
            // Setup tabs
            this.setupTabs();
            
            // Initialize kasir
            if (typeof initKasir === 'function') {
                initKasir();
            }
            
            // Initialize statistics
            if (typeof initStatistik === 'function') {
                initStatistik();
            }
            
            // Show initial tab
            this.switchTab('pos');
            
            console.log('App initialized successfully!');
            
            // Remove the setTimeout notification to avoid errors
            // showNotification('Aplikasi siap digunakan!');
            
        } catch (error) {
            console.error('App init failed:', error);
        }
    },
    
    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        console.log('Tabs setup complete');
    },
    
    switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
            if (t.dataset.tab === tabId) t.classList.add('active');
        });
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            }
        });
        
        this.currentTab = tabId;
        console.log('Switched to tab:', tabId);
        
        // Load tab-specific data
        if (tabId === 'stats' && typeof loadStatistics === 'function') {
            setTimeout(() => loadStatistics(), 100);
        }
    }
};

// Initialize only once when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if app is already initialized by other scripts
    if (!appInitialized) {
        app.init();
    }
});
