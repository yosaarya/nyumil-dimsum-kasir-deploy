// Pastikan DEFAULT_PRODUCTS ada (dari database.js)
// Jika tidak, kita definisikan di sini
if (typeof DEFAULT_PRODUCTS === 'undefined') {
    // Salin dari database.js
    const DEFAULT_PRODUCTS = [
         { id: 1, name: "Dimsum Ori Mentai (Small 3pcs)", price: 18000, cost: 10000, icon: "fa-drumstick-bite", category: "paket", description: "Dimsum 3 + Saus Mentai + Topping + Packaging", stock: 100 },
    { id: 2, name: "Dimsum Ori Mentai (Medium 6pcs)", price: 28000, cost: 15000, icon: "fa-drumstick-bite", category: "paket", description: "Dimsum 6 + Saus Mentai + Topping + Packaging", stock: 100 },
    { id: 3, name: "Dimsum Ori Mentai (Large 16pcs)", price: 75000, cost: 40000, icon: "fa-drumstick-bite", category: "paket", description: "Dimsum 16 + Saus Mentai + Topping + Packaging", stock: 100 },
    { id: 4, name: "Dimmoza Mentai (Small 3pcs)", price: 21000, cost: 11500, icon: "fa-cheese", category: "paket", description: "DSM + Mozzarella", stock: 100 },
    { id: 5, name: "Dimsum Mentai Cheesy (Small 3pcs)", price: 21000, cost: 11500, icon: "fa-cheese", category: "paket", description: "DSM + Mozzarella", stock: 100 },
    { id: 6, name: "Dimsum Mentai Double Cheesy (Small 3pcs)", price: 24000, cost: 13000, icon: "fa-cheese", category: "paket", description: "DSM + Double Mozzarella", stock: 100 },
    { id: 7, name: "Dimsum Mentai Tobiko Cheesy (Small 3pcs)", price: 23000, cost: 12500, icon: "fa-fish", category: "paket", description: "DSM + Mozza + Tobiko", stock: 100 },
    { id: 8, name: "Gyoza Mentai (Small 5pcs)", price: 18000, cost: 10000, icon: "fa-dumpling", category: "paket", description: "Gyoza 5 + Saus Mentai + Topping + Packaging", stock: 100 },
    { id: 9, name: "Gyoza Mentai (Medium 8pcs)", price: 24000, cost: 13000, icon: "fa-dumpling", category: "paket", description: "Gyoza 8 + Saus Mentai + Topping + Packaging", stock: 100 },
    { id: 10, name: "Dimsum Ori (Satuan)", price: 3000, cost: 1500, icon: "fa-utensils", category: "satuan", description: "", stock: 1000 },
    { id: 11, name: "Dimmoza (Satuan)", price: 4000, cost: 2000, icon: "fa-cheese", category: "satuan", description: "", stock: 1000 },
    { id: 12, name: "Gyoza (Satuan)", price: 2000, cost: 1000, icon: "fa-dumpling", category: "satuan", description: "", stock: 1000 },
    { id: 13, name: "Mozzarella", price: 1000, cost: 500, icon: "fa-cheese", category: "topping", description: "", stock: 1000 },
    { id: 14, name: "Tobiko", price: 3000, cost: 1500, icon: "fa-fish", category: "topping", description: "", stock: 500 },
    { id: 15, name: "Creamy Bolognese 50ml", price: 7000, cost: 3500, icon: "fa-wine-bottle", category: "saus", description: "", stock: 200 },
    { id: 16, name: "Creamy Bolognese 80ml", price: 10000, cost: 5000, icon: "fa-wine-bottle", category: "saus", description: "", stock: 200 }
    ];
}
// ===== CART SYSTEM =====
let cart = [];
let currentCategory = 'all';

// Initialize Cart
function initCart() {
    const savedCart = localStorage.getItem('nyumil_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('nyumil_cart', JSON.stringify(cart));
}

// Add to Cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
    showNotification(`${product.name} ditambahkan ke keranjang`, 'success');
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    showNotification('Item dihapus dari keranjang', 'info');
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartDisplay();
        }
    }
}

// Clear Cart
function clearCart() {
    if (cart.length === 0) {
        showNotification('Keranjang sudah kosong', 'info');
        return;
    }
    
    if (confirm('Hapus semua item dari keranjang?')) {
        cart = [];
        saveCart();
        updateCartDisplay();
        showNotification('Keranjang dikosongkan', 'success');
    }
}

// Update Cart Display
function updateCartDisplay() {
    const orderList = document.getElementById('orderList');
    const emptyOrder = document.getElementById('emptyOrder');
    const orderCount = document.getElementById('orderCount');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const totalAmount = document.getElementById('totalAmount');
    
    if (!orderList || !emptyOrder) return;
    
    // Hide empty message if cart has items
    emptyOrder.style.display = cart.length === 0 ? 'flex' : 'none';
    
    // Update order count
    if (orderCount) {
        orderCount.textContent = cart.length;
    }
    
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    // Update amounts
    if (subtotalAmount) {
        subtotalAmount.textContent = formatRupiah(subtotal);
    }
    
    if (totalAmount) {
        totalAmount.textContent = formatRupiah(subtotal);
    }
    
    // Render cart items
    if (orderList) {
        orderList.innerHTML = '';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${formatRupiah(item.price)}</span>
                </div>
                <div class="item-controls">
                    <button class="btn-quantity" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="btn-quantity" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="item-total">
                    ${formatRupiah(itemTotal)}
                </div>
            `;
            
            orderList.appendChild(orderItem);
        });
    }
}

// ===== PRODUCT DISPLAY =====
function renderProducts() {
    const menuGrid = document.getElementById('menuGrid');
    const categoriesContainer = document.getElementById('productCategories');
    
    if (!menuGrid || !categoriesContainer) return;
    
    // Get unique categories
    const categories = ['all', 'paket', 'satuan', 'topping', 'saus'];
    
    // Render categories
    categoriesContainer.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = `category-btn ${category === currentCategory ? 'active' : ''}`;
        button.textContent = category === 'all' ? 'Semua' : 
                           category === 'paket' ? 'Paket' :
                           category === 'satuan' ? 'Satuan' :
                           category === 'topping' ? 'Topping' : 'Saus';
        button.onclick = () => {
            currentCategory = category;
            renderProducts();
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        };
        categoriesContainer.appendChild(button);
    });
    
    // Render products based on current category
    let productsToShow = DEFAULT_PRODUCTS;
    if (currentCategory !== 'all') {
        productsToShow = DEFAULT_PRODUCTS.filter(p => p.category === currentCategory);
    }
    
    menuGrid.innerHTML = '';
    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'menu-item';
        productCard.onclick = () => addToCart(product);
        productCard.innerHTML = `
            <div class="menu-item-content">
                <div class="menu-icon">
                    <i class="fas ${product.icon}"></i>
                </div>
                <h4>${product.name}</h4>
                <p class="menu-description">${product.description || ''}</p>
                <p class="price">${formatRupiah(product.price)}</p>
                <button class="btn-add">
                    <i class="fas fa-plus"></i> Tambah
                </button>
            </div>
        `;
        menuGrid.appendChild(productCard);
    });
}

// ===== CHECKOUT PROCESS =====
function checkout() {
    if (cart.length === 0) {
        showNotification('Keranjang kosong! Tambahkan produk terlebih dahulu.', 'error');
        return;
    }
    
    // Create transaction
    const transaction = {
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            cost: item.cost || 0,
            quantity: item.quantity
        })),
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        date: getToday(),
        time: new Date().toLocaleTimeString('id-ID')
    };
    
    // Save transaction
    if (database && typeof database.addTransaction === 'function') {
        database.addTransaction(transaction).then(() => {
            // Clear cart
            cart = [];
            saveCart();
            updateCartDisplay();
            
            // Show success
            showNotification('Transaksi berhasil!', 'success');
            
            // Show receipt
            showReceipt(transaction);
        });
    } else {
        showNotification('Database tidak tersedia', 'error');
    }
}

// Show Receipt
function showReceipt(transaction) {
    const receiptModal = document.getElementById('receiptModal');
    if (!receiptModal) return;
    
    let receiptHTML = `
        <div class="modal-content">
            <div class="receipt-header">
                <h3><i class="fas fa-receipt"></i> Struk Pembayaran</h3>
                <p>No: ${Date.now().toString().slice(-6)}</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-info">
                    <p><strong>Tanggal:</strong> ${transaction.date}</p>
                    <p><strong>Waktu:</strong> ${transaction.time}</p>
                </div>
                <div class="receipt-items">
                    <h4>Items:</h4>
    `;
    
    transaction.items.forEach(item => {
        receiptHTML += `
            <div class="receipt-item">
                <span>${item.name} (${item.quantity}x)</span>
                <span>${formatRupiah(item.price * item.quantity)}</span>
            </div>
        `;
    });
    
    receiptHTML += `
                </div>
                <div class="receipt-total">
                    <p><strong>Total:</strong> ${formatRupiah(transaction.total)}</p>
                </div>
                <div class="receipt-footer">
                    <p>Terima kasih telah berbelanja!</p>
                </div>
            </div>
            <div class="receipt-actions">
                <button class="btn btn-primary" onclick="printReceipt()">
                    <i class="fas fa-print"></i> Cetak
                </button>
                <button class="btn btn-secondary" onclick="closeReceipt()">
                    <i class="fas fa-times"></i> Tutup
                </button>
            </div>
        </div>
    `;
    
    receiptModal.innerHTML = receiptHTML;
    receiptModal.style.display = 'flex';
}

// Print Receipt
function printReceipt() {
    window.print();
}

// Close Receipt
function closeReceipt() {
    const receiptModal = document.getElementById('receiptModal');
    if (receiptModal) {
        receiptModal.style.display = 'none';
    }
}

// ===== INITIALIZATION =====
function initKasir() {
    initCart();
    renderProducts();
    
    // Setup event listeners
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
    }
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    console.log('Kasir system initialized');
}
