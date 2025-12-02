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
    function initKasir() {
    console.log('Initializing kasir...');
    
    initCart();
    
    // DEBUG: Cek elemen sebelum render
    const menuGrid = document.getElementById('menuGrid');
    console.log('menuGrid element:', menuGrid);
    
    if (!menuGrid) {
        console.error('menuGrid not found!');
        // Coba cari dengan selector lain
        const menuGridAlt = document.querySelector('.menu-grid');
        console.log('Alternative search:', menuGridAlt);
    }
    
    function renderProducts() {
    console.log('renderProducts called');
    
    const menuGrid = document.getElementById('menuGrid');
    const categoriesContainer = document.getElementById('productCategories');
    
    console.log('menuGrid:', menuGrid);
    console.log('categoriesContainer:', categoriesContainer);
    
    if (!menuGrid) {
        console.error('menuGrid element not found!');
        return;
    }
    
    if (!categoriesContainer) {
        console.error('categoriesContainer element not found!');
    }
    
    // DEBUG: Cek DEFAULT_PRODUCTS
    console.log('DEFAULT_PRODUCTS available?', typeof DEFAULT_PRODUCTS);
    
    let productsToShow = [];
    
    // Coba berbagai sumber data
    if (typeof DEFAULT_PRODUCTS !== 'undefined' && DEFAULT_PRODUCTS.length > 0) {
        productsToShow = DEFAULT_PRODUCTS;
        console.log('Using DEFAULT_PRODUCTS, count:', productsToShow.length);
    } else if (database && database.products && database.products.length > 0) {
        productsToShow = database.products;
        console.log('Using database.products, count:', productsToShow.length);
    } else {
        console.error('No products data found!');
        menuGrid.innerHTML = '<div class="error-message">Produk tidak ditemukan. Silakan refresh halaman.</div>';
        return;
    }
    
    console.log('Products to show:', productsToShow.length);
    
    // Render produk pertama dulu sebagai test
    if (productsToShow.length > 0) {
        const testProduct = productsToShow[0];
        console.log('Test product:', testProduct);
        
        // Test render satu produk
        const testHTML = `
            <div class="menu-item" onclick="addToCart(${JSON.stringify(testProduct).replace(/"/g, '&quot;')})">
                <div class="menu-item-content">
                    <div class="menu-icon">
                        <i class="fas ${testProduct.icon}"></i>
                    </div>
                    <h4>${testProduct.name}</h4>
                    <p class="menu-description">${testProduct.description || ''}</p>
                    <p class="price">${formatRupiah(testProduct.price)}</p>
                    <button class="btn-add">
                        <i class="fas fa-plus"></i> Tambah
                    </button>
                </div>
            </div>
        `;
        
        menuGrid.innerHTML = testHTML;
        console.log('Test product rendered');
        
        // Setelah test berhasil, render semua
        setTimeout(() => {
            renderAllProducts(productsToShow);
        }, 100);
    }
}

function renderAllProducts(products) {
    const menuGrid = document.getElementById('menuGrid');
    const categoriesContainer = document.getElementById('productCategories');
    
    if (!menuGrid) return;
    
    // Get unique categories
    const categories = ['all', 'paket', 'satuan', 'topping', 'saus'];
    
    // Render categories jika container ada
    if (categoriesContainer) {
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
                renderAllProducts(products);
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
            };
            categoriesContainer.appendChild(button);
        });
    }
    
    // Render products based on current category
    let productsToShow = products;
    if (currentCategory !== 'all') {
        productsToShow = products.filter(p => p.category === currentCategory);
    }
    
    let html = '';
    productsToShow.forEach(product => {
        html += `
            <div class="menu-item" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
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
            </div>
        `;
    });
    
    menuGrid.innerHTML = html;
    console.log(`Rendered ${productsToShow.length} products`);
}
    
    // Setup event listeners
    const clearBtn = document.getElementById('clearBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    console.log('clearBtn:', clearBtn);
    console.log('checkoutBtn:', checkoutBtn);
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
        console.log('clearBtn event listener added');
    } else {
        console.error('clearBtn not found!');
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
        console.log('checkoutBtn event listener added');
    } else {
        console.error('checkoutBtn not found!');
    }
    
    console.log('Kasir system initialized');
}
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
// kasir.js - WITH FALLBACK RENDER

// Initialize Cart
function initCart() {
    console.log('🔍 initCart() called');
    const savedCart = localStorage.getItem('nyumil_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log('📦 Cart loaded from localStorage:', cart.length, 'items');
            updateCartDisplay();
        } catch (e) {
            console.error('❌ Error parsing cart:', e);
            cart = [];
        }
    }
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('nyumil_cart', JSON.stringify(cart));
}

// Add to Cart - SIMPLIFIED
function addToCart(product) {
    console.log('➕ Adding to cart:', product.name);
    
    // Check if product is an object or just ID
    if (typeof product === 'number') {
        // Find product by ID
        const productObj = DEFAULT_PRODUCTS.find(p => p.id === product);
        if (!productObj) {
            console.error('❌ Product not found:', product);
            return;
        }
        product = productObj;
    }
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            cost: product.cost,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
    
    // Show notification if function exists
    if (typeof showNotification === 'function') {
        showNotification(`${product.name} ditambahkan`, 'success');
    } else {
        alert(`${product.name} ditambahkan ke keranjang`);
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
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
        alert('Keranjang sudah kosong');
        return;
    }
    
    if (confirm('Hapus semua item dari keranjang?')) {
        cart = [];
        saveCart();
        updateCartDisplay();
        alert('Keranjang dikosongkan');
    }
}

// Update Cart Display - ROBUST VERSION
function updateCartDisplay() {
    console.log('🛒 updateCartDisplay() called');
    
    const elements = {
        orderList: document.getElementById('orderList'),
        emptyOrder: document.getElementById('emptyOrder'),
        orderCount: document.getElementById('orderCount'),
        subtotalAmount: document.getElementById('subtotalAmount'),
        totalAmount: document.getElementById('totalAmount')
    };
    
    // Log which elements are missing
    Object.entries(elements).forEach(([name, element]) => {
        if (!element) console.warn(`⚠️ Element #${name} not found`);
    });
    
    if (!elements.orderList || !elements.emptyOrder) {
        console.error('❌ Required cart elements missing');
        return;
    }
    
    // Hide/show empty message
    elements.emptyOrder.style.display = cart.length === 0 ? 'flex' : 'none';
    
    // Update counts
    if (elements.orderCount) {
        elements.orderCount.textContent = cart.length;
    }
    
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    // Update amounts
    if (elements.subtotalAmount) {
        elements.subtotalAmount.textContent = formatRupiah ? formatRupiah(subtotal) : `Rp ${subtotal}`;
    }
    
    if (elements.totalAmount) {
        elements.totalAmount.textContent = formatRupiah ? formatRupiah(subtotal) : `Rp ${subtotal}`;
    }
    
    // Render cart items
    if (elements.orderList) {
        elements.orderList.innerHTML = '';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.style.cssText = 'border: 1px solid #ddd; margin: 5px; padding: 10px;';
            orderItem.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <small>${formatRupiah ? formatRupiah(item.price) : `Rp ${item.price}`} x ${item.quantity}</small>
                </div>
                <div>
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span style="margin: 0 10px;">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button onclick="removeFromCart(${item.id})" style="margin-left: 10px;">Hapus</button>
                </div>
                <div>
                    <strong>${formatRupiah ? formatRupiah(itemTotal) : `Rp ${itemTotal}`}</strong>
                </div>
            `;
            
            elements.orderList.appendChild(orderItem);
        });
    }
}

// ===== PRODUCT DISPLAY =====
function renderProducts() {
    console.log('🎨 renderProducts() called');
    
    const menuGrid = document.getElementById('menuGrid');
    const categoriesContainer = document.getElementById('productCategories');
    
    if (!menuGrid) {
        console.error('❌ #menuGrid element not found!');
        
        // Try to find alternative or create one
        const posTab = document.getElementById('pos-tab');
        if (posTab && !menuGrid) {
            console.log('Creating menuGrid manually...');
            const newMenuGrid = document.createElement('div');
            newMenuGrid.id = 'menuGrid';
            newMenuGrid.className = 'menu-grid';
            newMenuGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;';
            posTab.appendChild(newMenuGrid);
            return renderProducts(); // Retry
        }
        return;
    }
    
    console.log('✅ menuGrid found');
    
    // Get products data
    let productsToShow = [];
    
    if (typeof DEFAULT_PRODUCTS !== 'undefined' && DEFAULT_PRODUCTS.length > 0) {
        productsToShow = DEFAULT_PRODUCTS;
        console.log(`✅ Using DEFAULT_PRODUCTS: ${productsToShow.length} items`);
    } else if (database && database.products && database.products.length > 0) {
        productsToShow = database.products;
        console.log(`✅ Using database.products: ${productsToShow.length} items`);
    } else {
        console.error('❌ No products data available!');
        menuGrid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 20px; text-align: center; border: 2px dashed #ccc;">
                <h3>⚠️ Data Produk Tidak Ditemukan</h3>
                <p>Silakan refresh halaman atau cek console</p>
                <button onclick="location.reload()">Refresh Halaman</button>
            </div>
        `;
        return;
    }
    
    // Render products - SIMPLE VERSION
    let html = '';
    productsToShow.forEach(product => {
        html += `
            <div class="menu-item" onclick="addToCart(${product.id})" 
                 style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; cursor: pointer;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #e63946; margin-bottom: 10px;">
                        <i class="fas ${product.icon || 'fa-box'}"></i>
                    </div>
                    <h4 style="margin: 10px 0;">${product.name}</h4>
                    <p style="color: #666; font-size: 12px; margin: 5px 0;">${product.description || ''}</p>
                    <p style="font-weight: bold; color: #e63946; font-size: 18px; margin: 10px 0;">
                        ${formatRupiah ? formatRupiah(product.price) : `Rp ${product.price}`}
                    </p>
                    <button class="btn-add" 
                            style="background: #e63946; color: white; border: none; padding: 8px 15px; border-radius: 4px; width: 100%;">
                        <i class="fas fa-plus"></i> Tambah
                    </button>
                </div>
            </div>
        `;
    });
    
    menuGrid.innerHTML = html;
    console.log(`✅ Rendered ${productsToShow.length} products`);
}

// ===== CHECKOUT PROCESS =====
function checkout() {
    if (cart.length === 0) {
        alert('Keranjang kosong! Tambahkan produk terlebih dahulu.');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (confirm(`Total: ${formatRupiah ? formatRupiah(total) : `Rp ${total}`}\n\nKonfirmasi pembayaran?`)) {
        // Create simple transaction
        const transaction = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            items: [...cart],
            total: total
        };
        
        // Save to database if available
        if (database && typeof database.addTransaction === 'function') {
            database.addTransaction(transaction).then(() => {
                alert('✅ Transaksi berhasil!');
                cart = [];
                saveCart();
                updateCartDisplay();
            }).catch(error => {
                console.error('Transaction error:', error);
                alert('Transaksi berhasil (offline mode)');
                cart = [];
                saveCart();
                updateCartDisplay();
            });
        } else {
            // Fallback: save to localStorage
            const transactions = JSON.parse(localStorage.getItem('nyumil_transactions') || '[]');
            transactions.push(transaction);
            localStorage.setItem('nyumil_transactions', JSON.stringify(transactions));
            
            alert('✅ Transaksi berhasil!');
            cart = [];
            saveCart();
            updateCartDisplay();
        }
    }
}

// ===== INITIALIZATION =====
function initKasir() {
    console.log('🚀 initKasir() called');
    
    // 1. Initialize cart
    initCart();
    
    // 2. Render products with delay to ensure DOM is ready
    setTimeout(() => {
        renderProducts();
        
        // 3. Setup event listeners
        const clearBtn = document.getElementById('clearBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', clearCart);
            console.log('✅ clearBtn event listener added');
        } else {
            console.warn('⚠️ clearBtn not found');
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', checkout);
            console.log('✅ checkoutBtn event listener added');
        } else {
            console.warn('⚠️ checkoutBtn not found');
        }
        
        console.log('🎉 Kasir system initialized successfully');
    }, 100);
}
// Di akhir kasir.js, tambahkan fallback jika function tidak ada
if (typeof initKasir === 'undefined') {
    window.initKasir = function() {
        console.log('Fallback initKasir called');
        
        // Initialize cart
        const savedCart = localStorage.getItem('nyumil_cart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
                console.log('Cart loaded:', cart.length, 'items');
            } catch (e) {
                console.error('Error loading cart:', e);
                cart = [];
            }
        }
        
        // Try to render products
        if (typeof renderProducts === 'function') {
            renderProducts();
        } else {
            console.error('renderProducts function not found');
        }
        
        // Setup event listeners
        const clearBtn = document.getElementById('clearBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (clearBtn && typeof clearCart === 'function') {
            clearBtn.addEventListener('click', clearCart);
        }
        
        if (checkoutBtn && typeof checkout === 'function') {
            checkoutBtn.addEventListener('click', checkout);
        }
        
        console.log('Fallback kasir initialized');
    };
}
