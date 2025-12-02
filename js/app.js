// app.js - SIMPLE VERSION
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
            // Initialize database if exists
            if (typeof database !== 'undefined' && database.init) {
                await database.init();
                console.log('Database initialized');
            }
            
            // Initialize kasir after a short delay
            setTimeout(() => {
                if (typeof initKasir === 'function') {
                    initKasir();
                } else {
                    console.error('initKasir function not found');
                }
            }, 500);
            
            // Setup tabs
            this.setupTabs();
            
            console.log('✅ App initialized');
            
        } catch (error) {
            console.error('App initialization error:', error);
        }
    },
    
    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                    }
                });
                
                console.log(`Switched to ${tabId} tab`);
            });
        });
        
        console.log('Tabs setup complete');
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
