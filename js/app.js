// app.js - SIMPLE VERSION
const app = {
    initialized: false,
    
    async init() {
        if (this.initialized) {
            console.log('App already initialized');
            return;
        }
        
        this.initialized = true;
        console.log('🚀 Starting application...');
        
        try {
            // 1. Setup tabs FIRST
            this.setupTabs();
            
            // 2. Initialize database
            if (typeof database !== 'undefined' && database.init) {
                await database.init();
                console.log('✅ Database initialized');
            }
            
            // 3. Initialize kasir
            if (typeof initKasir === 'function') {
                console.log('📦 Initializing kasir...');
                initKasir();
            } else {
                console.warn('⚠️ initKasir function not found');
            }
            
            // 4. Initialize statistics
            if (typeof initStatistik === 'function') {
                console.log('📊 Initializing statistics...');
                initStatistik();
            }
            
            console.log('🎉 Application ready!');
            
        } catch (error) {
            console.error('❌ Application error:', error);
        }
    },
    
    setupTabs() {
        console.log('Setting up tabs...');
        
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
                        console.log(`Switched to ${tabId} tab`);
                    }
                });
            });
        });
        
        console.log(`✅ ${tabs.length} tabs setup complete`);
    }
};

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Make app globally available
window.app = app;
