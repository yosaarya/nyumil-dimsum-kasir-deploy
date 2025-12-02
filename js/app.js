// app.js - SIMPLE
let appInitialized = false;

const app = {
    async init() {
        if (appInitialized) {
            console.log('App already initialized');
            return;
        }
        
        appInitialized = true;
        console.log('App starting...');
        
        try {
            // Initialize database
            if (typeof database !== 'undefined' && database.init) {
                await database.init();
                console.log('Database initialized');
            }
            
            // Setup tabs
            this.setupTabs();
            
            // Initialize kasir after delay
            setTimeout(() => {
                if (typeof initKasir === 'function') {
                    initKasir();
                }
            }, 200);
            
            console.log('✅ App ready');
            
        } catch (error) {
            console.error('App error:', error);
        }
    },
    
    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                // Update tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }
};

// Start once
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    setTimeout(() => app.init(), 100);
}
