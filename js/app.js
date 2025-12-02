// app.js - UPDATED VERSION WITH TAB LOADING
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
                
                // Load content for the active tab
                this.loadTabContent(tabId);
            });
        });
        
        // Load content for the initially active tab (pos)
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            this.loadTabContent(activeTab.dataset.tab);
        }
    },
    
    loadTabContent(tabId) {
        console.log(`Loading tab: ${tabId}`);
        
        switch(tabId) {
            case 'stats':
                this.loadStatisticsTab();
                break;
            case 'history':
                this.loadHistoryTab();
                break;
            case 'products':
                this.loadProductsTab();
                break;
            case 'pos':
                // Already loaded by initKasir
                break;
            default:
                console.warn(`Unknown tab: ${tabId}`);
        }
    },
    
    // ===== STATISTICS TAB =====
    loadStatisticsTab() {
        const statsContainer = document.querySelector('#stats-tab .stats-container');
        if (!statsContainer) return;
        
        console.log('Loading statistics...');
        
        // Check if statistics module is available
        if (typeof initStatistik === 'function' && typeof loadStatistics === 'function') {
            try {
                initStatistik();
                // Give it a moment to initialize, then load statistics
                setTimeout(() => {
                    if (typeof loadStatistics === 'function') {
                        loadStatistics();
                    }
                }, 100);
            } catch (error) {
                console.error('Error loading statistics module:', error);
                this.loadSimpleStatistics();
            }
        } else {
            this.loadSimpleStatistics();
        }
    },
    
    loadSimpleStatistics() {
        const statsContainer = document.querySelector('#stats-tab .stats-container');
        if (!statsContainer) return;
        
        const transactions = JSON.parse(localStorage.getItem('nyumil_transactions') || '[]');
        
        let totalRevenue = 0;
        let totalTransactions = transactions.length;
        let totalItems = 0;
        
        transactions.forEach(transaction => {
            totalRevenue += transaction.total || 0;
            if (transaction.items) {
                transaction.items.forEach(item => {
                    totalItems += item.quantity || 0;
                });
            }
        });
        
        const estimatedProfit = totalRevenue * 0.5; // 50% margin estimate
        
        statsContainer.innerHTML = `
            <div class="stats-header">
                <h2><i class="fas fa-chart-bar"></i> Statistik Penjualan</h2>
            </div>
            
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0;">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e63946; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                        <i class="fas fa-money-bill-wave" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h3>Total Pendapatan</h3>
                    <p class="stat-value" style="font-size: 24px; font-weight: bold; margin: 10px 0;">${formatRupiah(totalRevenue)}</p>
                    <small style="color: #666;">Semua waktu</small>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #457b9d; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                        <i class="fas fa-receipt" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h3>Total Transaksi</h3>
                    <p class="stat-value" style="font-size: 24px; font-weight: bold; margin: 10px 0;">${totalTransactions}</p>
                    <small style="color: #666;">Semua waktu</small>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #2a9d8f; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                        <i class="fas fa-box" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h3>Item Terjual</h3>
                    <p class="stat-value" style="font-size: 24px; font-weight: bold; margin: 10px 0;">${totalItems}</p>
                    <small style="color: #666;">Semua waktu</small>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e9c46a; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                        <i class="fas fa-chart-line" style="color: white; font-size: 24px;"></i>
                    </div>
                    <h3>Estimasi Laba</h3>
                    <p class="stat-value" style="font-size: 24px; font-weight: bold; margin: 10px 0;">${formatRupiah(estimatedProfit)}</p>
                    <small style="color: #666;">Margin 50%</small>
                </div>
            </div>
            
            <div class="recent-transactions" style="background: white; padding: 20px; border-radius: 10px; margin-top: 30px;">
                <h3>5 Transaksi Terakhir</h3>
                ${transactions.length > 0 ? 
                    transactions.slice(-5).reverse().map(t => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                            <div>
                                <strong>#${t.id}</strong>
                                <small style="display: block; color: #666;">${t.date} ${t.time || ''}</small>
                            </div>
                            <div style="font-weight: bold; color: #2a9d8f;">
                                ${formatRupiah(t.total)}
                            </div>
                        </div>
                    `).join('') :
                    '<p style="text-align: center; color: #666; padding: 20px;">Belum ada transaksi</p>'
                }
            </div>
        `;
    },
    
    // ===== HISTORY TAB =====
    loadHistoryTab() {
        const historyContainer = document.querySelector('#history-tab .history-container');
        if (!historyContainer) return;
        
        console.log('Loading history...');
        
        const transactions = JSON.parse(localStorage.getItem('nyumil_transactions') || '[]');
        
        if (transactions.length === 0) {
            historyContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-history" style="font-size: 48px; color: #666; margin-bottom: 20px;"></i>
                    <h3>Belum Ada Riwayat</h3>
                    <p style="color: #666;">Belum ada transaksi yang tercatat</p>
                </div>
            `;
            return;
        }
        
        // Sort by date (newest first)
        transactions.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + (a.time || '00:00'));
            const dateB = new Date(b.date + ' ' + (b.time || '00:00'));
            return dateB - dateA;
        });
        
        let html = `
            <div style="background: white; border-radius: 10px; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2><i class="fas fa-history"></i> Riwayat Transaksi</h2>
                    <button onclick="app.clearAllHistory()" class="btn btn-danger" style="padding: 10px 15px; background: #e63946; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-trash"></i> Hapus Semua
                    </button>
                </div>
                
                <div style="max-height: 500px; overflow-y: auto;">
        `;
        
        transactions.forEach(transaction => {
            const itemsCount = transaction.items ? transaction.items.length : 0;
            const itemsList = transaction.items 
                ? transaction.items.map(item => `${item.name} x${item.quantity}`).join(', ')
                : 'Tidak ada detail item';
            
            html += `
                <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <strong>Transaksi #${transaction.id}</strong>
                            <small style="display: block; color: #666;">${transaction.date} ${transaction.time || ''}</small>
                        </div>
                        <span style="font-size: 18px; font-weight: bold; color: #2a9d8f;">${formatRupiah(transaction.total)}</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <p style="margin: 5px 0;"><strong>Items:</strong> ${itemsList}</p>
                        <p style="margin: 5px 0; color: #666;">Total item: ${itemsCount}</p>
                    </div>
                    <div>
                        <button onclick="app.deleteTransaction(${transaction.id})" class="btn btn-danger" style="padding: 5px 10px; background: #e63946; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        historyContainer.innerHTML = html;
    },
    
    clearAllHistory() {
        if (confirm('Hapus SEMUA riwayat transaksi? Tindakan ini tidak dapat dibatalkan!')) {
            localStorage.removeItem('nyumil_transactions');
            this.loadHistoryTab();
            if (typeof showNotification === 'function') {
                showNotification('Semua riwayat telah dihapus', 'success');
            }
        }
    },
    
    deleteTransaction(id) {
        if (confirm('Hapus transaksi ini?')) {
            const transactions = JSON.parse(localStorage.getItem('nyumil_transactions') || '[]');
            const filtered = transactions.filter(t => t.id !== id);
            localStorage.setItem('nyumil_transactions', JSON.stringify(filtered));
            this.loadHistoryTab();
            if (typeof showNotification === 'function') {
                showNotification('Transaksi dihapus', 'success');
            }
        }
    },
    
    // ===== PRODUCTS TAB =====
    loadProductsTab() {
        const productsContainer = document.querySelector('#products-tab .products-container');
        if (!productsContainer) return;
        
        console.log('Loading products...');
        
        if (typeof DEFAULT_PRODUCTS === 'undefined') {
            productsContainer.innerHTML = '<p style="color: #e63946;">Data produk tidak tersedia</p>';
            return;
        }
        
        // Group by category
        const categories = {};
        DEFAULT_PRODUCTS.forEach(product => {
            const category = product.category || 'Lainnya';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(product);
        });
        
        let html = `
            <div style="background: white; border-radius: 10px; padding: 20px;">
                <div style="margin-bottom: 20px;">
                    <h2><i class="fas fa-boxes"></i> Daftar Produk</h2>
                    <div style="display: flex; gap: 20px; margin-top: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-box" style="color: #457b9d;"></i>
                            <span>${DEFAULT_PRODUCTS.length} Produk</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-tags" style="color: #457b9d;"></i>
                            <span>${Object.keys(categories).length} Kategori</span>
                        </div>
                    </div>
                </div>
        `;
        
        Object.keys(categories).forEach(category => {
            html += `
                <div style="margin-bottom: 30px;">
                    <h3 style="display: flex; align-items: center; gap: 10px; color: #457b9d; border-bottom: 2px solid #457b9d; padding-bottom: 10px;">
                        <i class="fas fa-folder"></i> ${category.toUpperCase()}
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-top: 15px;">
            `;
            
            categories[category].forEach(product => {
                const profit = product.price - (product.cost || 0);
                const margin = product.cost ? Math.round((profit / product.cost) * 100) : 0;
                const profitColor = profit > 0 ? '#2a9d8f' : '#e63946';
                
                html += `
                    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; display: flex; gap: 15px;">
                        <div style="font-size: 24px; color: #457b9d;">
                            <i class="fas ${product.icon}"></i>
                        </div>
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 5px 0;">${product.name}</h4>
                            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">${product.description || ''}</p>
                            <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                                <span style="font-weight: bold; color: #333;">${formatRupiah(product.price)}</span>
                                <span style="color: #666; font-size: 14px;">HPP: ${formatRupiah(product.cost || 0)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="background: ${profitColor}15; color: ${profitColor}; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                                    Laba: ${formatRupiah(profit)} (${margin}%)
                                </span>
                                <span style="color: #666; font-size: 14px;">Stok: ${product.stock || 0}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        productsContainer.innerHTML = html;
    }
};

// Make app methods available globally for onclick events
window.clearAllHistory = () => app.clearAllHistory();
window.deleteTransaction = (id) => app.deleteTransaction(id);

// Start once
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    setTimeout(() => app.init(), 100);
}
