// ===== MAIN APPLICATION =====
class NyumilKasirApp {
    constructor() {
        this.currentTab = 'pos';
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
    }

    // Initialize Application
    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize database
            if (database && typeof database.init === 'function') {
                await database.init();
            } else {
                console.error('Database not available');
                return;
            }
            
            // Setup event listeners
            await this.setupEventListeners();
            
            // Initialize modules if available
            if (typeof initKasir === 'function') {
                initKasir();
            }
            
            if (typeof initStatistik === 'function') {
                initStatistik();
            }
            
            // Set initial tab
            this.switchTab('pos');
            
            this.isInitialized = true;
            console.log('Nyumil Kasir App initialized');
            
            // Show welcome notification
            setTimeout(() => {
                if (typeof showNotification === 'function') {
                    showNotification('Aplikasi Nyumil Dimsum Kasir siap digunakan!');
                }
            }, 1000);
            
        } catch (error) {
            console.error('App initialization failed:', error);
            if (typeof showNotification === 'function') {
                showNotification('Gagal menginisialisasi aplikasi', 'error');
            }
        }
    }

    // Setup Event Listeners
    async setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Online/Offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            if (typeof showNotification === 'function') {
                showNotification('Koneksi internet tersedia', 'success');
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            if (typeof showNotification === 'function') {
                showNotification('Tidak ada koneksi internet', 'warning');
            }
        });

        // Before unload - save data
        window.addEventListener('beforeunload', (e) => {
            if (database && typeof database.saveToLocalStorage === 'function') {
                database.saveToLocalStorage();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    // ===== TAB MANAGEMENT =====
    switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            }
        });

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            }
        });

        this.currentTab = tabId;

        // Load tab-specific data
        switch (tabId) {
            case 'stats':
                if (typeof loadStatistics === 'function') {
                    loadStatistics();
                }
                break;
            case 'history':
                this.loadHistory();
                break;
            case 'products':
                this.loadProducts();
                break;
        }
    }

    // ===== HISTORY TAB =====
    async loadHistory() {
        const historyContainer = document.querySelector('#history-tab .history-container');
        if (!historyContainer) return;

        try {
            if (!database || typeof database.getTransactions !== 'function') {
                throw new Error('Database tidak tersedia');
            }
            
            const transactions = await database.getTransactions();
            
            if (transactions.length === 0) {
                historyContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>Belum ada transaksi</p>
                    </div>
                `;
                return;
            }

            // Sort by date (newest first)
            transactions.sort((a, b) => {
                return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
            });

            const tableHTML = `
                <div class="history-header">
                    <h3>Riwayat Transaksi</h3>
                    <button class="btn btn-primary" onclick="app.refreshHistory()">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Waktu</th>
                                <th>ID</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(transaction => `
                                <tr>
                                    <td>${transaction.date}</td>
                                    <td>${transaction.time}</td>
                                    <td>#${transaction.id}</td>
                                    <td>
                                        <div class="transaction-items">
                                            ${transaction.items.map(item => 
                                                `${item.name} (${item.quantity})`
                                            ).join(', ')}
                                        </div>
                                        ${transaction.note ? `<div class="transaction-note">${transaction.note}</div>` : ''}
                                    </td>
                                    <td>${formatRupiah(transaction.total)}</td>
                                    <td>
                                        <button class="btn-icon" onclick="app.viewTransaction(${transaction.id})" title="Lihat">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-icon btn-danger" onclick="app.deleteTransaction(${transaction.id})" title="Hapus">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            historyContainer.innerHTML = tableHTML;

        } catch (error) {
            console.error('Error loading history:', error);
            historyContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat riwayat transaksi</p>
                    <button class="btn btn-secondary" onclick="app.loadHistory()">Coba Lagi</button>
                </div>
            `;
        }
    }

    // ===== PRODUCTS TAB =====
    async loadProducts() {
        const productsContainer = document.querySelector('#products-tab .products-container');
        if (!productsContainer) return;

        try {
            if (!database || typeof database.getProducts !== 'function') {
                throw new Error('Database tidak tersedia');
            }
            
            const products = await database.getProducts();
            
            const tableHTML = `
                <div class="products-header">
                    <h3>Daftar Produk</h3>
                    <button class="btn btn-primary" onclick="app.addProduct()">
                        <i class="fas fa-plus"></i> Tambah Produk
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Kategori</th>
                                <th>Harga</th>
                                <th>HPP</th>
                                <th>Stok</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr>
                                    <td>
                                        <div class="product-info">
                                            <i class="fas ${product.icon || 'fa-box'}"></i>
                                            <span>${product.name}</span>
                                        </div>
                                    </td>
                                    <td>${product.category}</td>
                                    <td>${formatRupiah(product.price)}</td>
                                    <td>${formatRupiah(product.cost)}</td>
                                    <td>
                                        <span class="stock-badge ${(product.stock || 0) <= 10 ? 'low' : ''}">
                                            ${product.stock || '∞'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-icon" onclick="app.editProduct(${product.id})" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-danger" onclick="app.deleteProduct(${product.id})" title="Hapus">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            productsContainer.innerHTML = tableHTML;

        } catch (error) {
            console.error('Error loading products:', error);
            productsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat daftar produk</p>
                    <button class="btn btn-secondary" onclick="app.loadProducts()">Coba Lagi</button>
                </div>
            `;
        }
    }

    // ===== TRANSACTION FUNCTIONS =====
    async viewTransaction(transactionId) {
        try {
            const transaction = await database.getTransaction(transactionId);
            if (!transaction) {
                showNotification('Transaksi tidak ditemukan', 'error');
                return;
            }

            // Show transaction details in modal
            this.showTransactionModal(transaction);
        } catch (error) {
            showNotification('Gagal memuat transaksi', 'error');
        }
    }

    async deleteTransaction(transactionId) {
        if (!confirm('Hapus transaksi ini? Tindakan ini tidak dapat dibatalkan.')) {
            return;
        }

        try {
            const success = await database.deleteTransaction(transactionId);
            if (success) {
                showNotification('Transaksi berhasil dihapus');
                this.loadHistory();
            } else {
                showNotification('Gagal menghapus transaksi', 'error');
            }
        } catch (error) {
            showNotification('Gagal menghapus transaksi', 'error');
        }
    }

    refreshHistory() {
        this.loadHistory();
    }

    // ===== PRODUCT MANAGEMENT =====
    async addProduct() {
        // Show add product modal
        this.showProductModal();
    }

    async editProduct(productId) {
        try {
            const product = await database.getProduct(productId);
            if (!product) {
                showNotification('Produk tidak ditemukan', 'error');
                return;
            }

            // Show edit product modal
            this.showProductModal(product);
        } catch (error) {
            showNotification('Gagal memuat produk', 'error');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Hapus produk ini? Produk yang sudah terjual tidak akan terpengaruh.')) {
            return;
        }

        try {
            const success = await database.deleteProduct(productId);
            if (success) {
                showNotification('Produk berhasil dihapus');
                this.loadProducts();
                // Refresh product display in kasir tab if function exists
                if (typeof renderProducts === 'function') {
                    renderProducts();
                }
            } else {
                showNotification('Gagal menghapus produk', 'error');
            }
        } catch (error) {
            showNotification('Gagal menghapus produk', 'error');
        }
    }

    // ===== MODAL FUNCTIONS =====
    showTransactionModal(transaction) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        const itemsHTML = transaction.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatRupiah(item.price)}</td>
                <td>${formatRupiah(item.price * item.quantity)}</td>
            </tr>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detail Transaksi #${transaction.id}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="transaction-details">
                        <div class="detail-row">
                            <span>Tanggal:</span>
                            <span>${transaction.date} ${transaction.time}</span>
                        </div>
                        
                        <h4>Items:</h4>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Produk</th>
                                    <th>Qty</th>
                                    <th>Harga</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3"><strong>Total</strong></td>
                                    <td><strong>${formatRupiah(transaction.total)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <div class="summary">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span>${formatRupiah(transaction.subtotal)}</span>
                            </div>
                            <div class="summary-row">
                                <span>Total:</span>
                                <span class="total">${formatRupiah(transaction.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Tutup</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal on X click
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    showProductModal(product = null) {
        const isEdit = product !== null;
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Edit' : 'Tambah'} Produk</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="productForm">
                        <div class="form-group">
                            <label for="productName">Nama Produk *</label>
                            <input type="text" id="productName" class="form-control" 
                                   value="${product?.name || ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productPrice">Harga Jual (Rp) *</label>
                                <input type="number" id="productPrice" class="form-control" 
                                       value="${product?.price || ''}" required min="0">
                            </div>
                            <div class="form-group">
                                <label for="productCost">HPP (Rp) *</label>
                                <input type="number" id="productCost" class="form-control" 
                                       value="${product?.cost || ''}" required min="0">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productCategory">Kategori</label>
                                <select id="productCategory" class="form-control">
                                    <option value="paket" ${product?.category === 'paket' ? 'selected' : ''}>Paket</option>
                                    <option value="satuan" ${product?.category === 'satuan' ? 'selected' : ''}>Satuan</option>
                                    <option value="topping" ${product?.category === 'topping' ? 'selected' : ''}>Topping</option>
                                    <option value="saus" ${product?.category === 'saus' ? 'selected' : ''}>Saus</option>
                                    <option value="lainnya" ${!product?.category || ['paket', 'satuan', 'topping', 'saus'].includes(product?.category) ? '' : 'selected'}>Lainnya</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="productIcon">Icon</label>
                                <select id="productIcon" class="form-control">
                                    <option value="fa-drumstick-bite" ${product?.icon === 'fa-drumstick-bite' ? 'selected' : ''}>🍗 Dimsum</option>
                                    <option value="fa-cheese" ${product?.icon === 'fa-cheese' ? 'selected' : ''}>🧀 Keju</option>
                                    <option value="fa-fish" ${product?.icon === 'fa-fish' ? 'selected' : ''}>🐟 Ikan</option>
                                    <option value="fa-dumpling" ${product?.icon === 'fa-dumpling' ? 'selected' : ''}>🥟 Gyoza</option>
                                    <option value="fa-utensils" ${product?.icon === 'fa-utensils' ? 'selected' : ''}>🍴 Utensil</option>
                                    <option value="fa-wine-bottle" ${product?.icon === 'fa-wine-bottle' ? 'selected' : ''}>🍶 Saus</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="productStock">Stok Awal</label>
                            <input type="number" id="productStock" class="form-control" 
                                   value="${product?.stock || ''}" min="0">
                            <small class="form-text">Kosongkan untuk tidak menggunakan fitur stok</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="productDescription">Deskripsi</label>
                            <textarea id="productDescription" class="form-control" rows="3">${product?.description || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Batal</button>
                    <button class="btn btn-primary" onclick="app.saveProduct(${product?.id || 'null'})">Simpan</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal on X click
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    async saveProduct(productId = null) {
        const form = document.getElementById('productForm');
        if (!form || !form.checkValidity()) {
            showNotification('Harap isi semua bidang yang diperlukan', 'error');
            return;
        }

        const productData = {
            name: document.getElementById('productName').value.trim(),
            price: parseInt(document.getElementById('productPrice').value),
            cost: parseInt(document.getElementById('productCost').value),
            category: document.getElementById('productCategory').value,
            icon: document.getElementById('productIcon').value,
            description: document.getElementById('productDescription').value.trim(),
            stock: document.getElementById('productStock').value ? 
                   parseInt(document.getElementById('productStock').value) : undefined
        };

        // Validate
        if (productData.price < productData.cost) {
            showNotification('Harga jual harus lebih besar dari HPP', 'error');
            return;
        }

        try {
            let product;
            if (productId) {
                product = await database.updateProduct(productId, productData);
                showNotification('Produk berhasil diperbarui');
            } else {
                product = await database.addProduct(productData);
                showNotification('Produk berhasil ditambahkan');
            }

            // Close modal
            document.querySelector('.modal.active')?.remove();
            
            // Refresh product lists
            this.loadProducts();
            if (typeof renderProducts === 'function') {
                renderProducts();
            }

        } catch (error) {
            showNotification('Gagal menyimpan produk', 'error');
        }
    }

    // ===== KEYBOARD SHORTCUTS =====
    handleKeyboardShortcuts(e) {
        // Only handle if not in input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case '1':
            case 'F1':
                e.preventDefault();
                this.switchTab('pos');
                break;
                
            case '2':
            case 'F2':
                e.preventDefault();
                this.switchTab('stats');
                break;
                
            case '3':
            case 'F3':
                e.preventDefault();
                this.switchTab('history');
                break;
                
            case '4':
            case 'F4':
                e.preventDefault();
                this.switchTab('products');
                break;
                
            case 'F5':
                e.preventDefault();
                this.loadHistory();
                break;
                
            case 'F12':
                e.preventDefault();
                // Do nothing - prevent dev tools
                break;
        }
    }

    // ===== UTILITY FUNCTIONS =====
    getAppInfo() {
        return {
            name: 'Nyumil Dimsum Kasir',
            version: '1.0.0',
            database: database ? {
                transactions: database.transactions ? database.transactions.length : 0,
                products: database.products ? database.products.length : 0,
                stats: database.dailyStats ? Object.keys(database.dailyStats).length : 0
            } : null
        };
    }
}

// ===== GLOBAL SETUP =====
// Make app instance globally available
const app = new NyumilKasirApp();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
