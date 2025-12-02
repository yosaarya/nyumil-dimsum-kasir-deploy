// ===== CART SYSTEM =====
let cart = [];
let currentCategory = 'all';

// Initialize Cart
function initCart() {
    console.log('🔍 initCart() called');
    const savedCart = localStorage.getItem('nyumil_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log('📦 Cart loaded:', cart.length, 'items');
        updateCartDisplay();
    }
}

// Save Cart
function saveCart() {
    localStorage.setItem('nyumil_cart', JSON.stringify(cart));
}

// Add to Cart - FIXED VERSION
function addToCart(product) {
    console.log('➕ addToCart called with:', product);
    
    // Cek jika product adalah object atau hanya ID
    if (typeof product === 'number' || typeof product === 'string') {
        // Cari produk dari DEFAULT_PRODUCTS
        const productId = parseInt(product);
        const foundProduct = DEFAULT_PRODUCTS.find(p => p.id === productId);
        if (!foundProduct) {
            console.error('❌ Product not found for ID:', product);
            return;
        }
        product = foundProduct;
    }
    
    if (!product || !product.id) {
        console.error('❌ Invalid product:', product);
        return;
    }
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            cost: product.cost || 0,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`${product.name} ditambahkan ke keranjang`, 'success');
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

// Update Cart Display - FIXED VERSION
function updateCartDisplay() {
    console.log('🛒 updateCartDisplay() called');
    
    // Dapatkan element setiap kali untuk menghindari null reference
    const orderList = document.getElementById('orderList');
    const emptyOrder = document.getElementById('emptyOrder');
    const orderCount = document.getElementById('orderCount');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const totalAmount = document.getElementById('totalAmount');
    
    // Debug: log status elements
    console.log('Elements status:', {
        orderList: !!orderList,
        emptyOrder: !!emptyOrder,
        orderCount: !!orderCount,
        subtotalAmount: !!subtotalAmount,
        totalAmount: !!totalAmount
    });
    
    // Jika orderList tidak ditemukan, return
    if (!orderList) {
        console.error('❌ orderList not found');
        return;
    }
    
    // Tampilkan/sembunyikan emptyOrder jika ada
    if (emptyOrder) {
        emptyOrder.style.display = cart.length === 0 ? 'flex' : 'none';
    }
    
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
    // Hapus semua order-item, tapi jangan hapus emptyOrder jika ada
    const orderItems = orderList.querySelectorAll('.order-item');
    orderItems.forEach(item => item.remove());
    
    if (cart.length > 0) {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ddd;';
            orderItem.innerHTML = `
                <div style="flex: 2;">
                    <strong>${item.name}</strong><br>
                    <small>${formatRupiah(item.price)}</small>
                </div>
                <div style="flex: 1; text-align: center;">
                    <button onclick="updateQuantity(${item.id}, -1)" style="padding: 5px 10px; background: #e63946; color: white; border: none; border-radius: 4px; cursor: pointer;">-</button>
                    <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" style="padding: 5px 10px; background: #2a9d8f; color: white; border: none; border-radius: 4px; cursor: pointer;">+</button>
                </div>
                <div style="flex: 1; text-align: right;">
                    <strong>${formatRupiah(itemTotal)}</strong><br>
                    <button onclick="removeFromCart(${item.id})" style="padding: 3px 8px; font-size: 12px; margin-top: 5px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Hapus</button>
                </div>
            `;
            
            orderList.appendChild(orderItem);
        });
    }
    
    console.log('✅ Cart updated:', cart.length, 'items');
}

// ===== PRODUCT DISPLAY =====
function renderProducts() {
    console.log('🎨 renderProducts() called');
    
    const menuGrid = document.getElementById('menuGrid');
    const categoriesContainer = document.getElementById('productCategories');
    
    if (!menuGrid) {
        console.error('❌ menuGrid not found');
        return;
    }
    
    console.log('✅ menuGrid found');
    
    // Get products
    let productsToShow = [];
    if (typeof DEFAULT_PRODUCTS !== 'undefined' && DEFAULT_PRODUCTS.length > 0) {
        productsToShow = DEFAULT_PRODUCTS;
        console.log(`✅ Using DEFAULT_PRODUCTS: ${productsToShow.length} items`);
    } else {
        console.error('❌ DEFAULT_PRODUCTS not found');
        menuGrid.innerHTML = '<div class="error">Data produk tidak ditemukan</div>';
        return;
    }
    
    // Render products - SIMPLE VERSION (tanpa onclick complex)
    let html = '';
    productsToShow.forEach(product => {
        // Gunakan inline event listener yang sederhana
        html += `
            <div class="menu-item" data-product-id="${product.id}">
                <div class="menu-item-content">
                    <div class="menu-icon">
                        <i class="fas ${product.icon}"></i>
                    </div>
                    <h4>${product.name}</h4>
                    <p class="menu-description">${product.description || ''}</p>
                    <p class="price">${formatRupiah(product.price)}</p>
                    <button class="btn-add" data-product-id="${product.id}">
                        <i class="fas fa-plus"></i> Tambah
                    </button>
                </div>
            </div>
        `;
    });
    
    menuGrid.innerHTML = html;
    
    // Add event listeners to buttons
    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-product-id'));
            const product = productsToShow.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });
    
    // Juga tambahkan ke parent menu-item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-add')) {
                const productId = parseInt(this.getAttribute('data-product-id'));
                const product = productsToShow.find(p => p.id === productId);
                if (product) {
                    addToCart(product);
                }
            }
        });
    });
    
    console.log(`✅ Rendered ${productsToShow.length} products with event listeners`);
}

// ===== CHECKOUT PROCESS - IMPROVED VERSION =====
function checkout() {
    if (cart.length === 0) {
        alert('Keranjang kosong!');
        return;
    }
    
    // Calculate totals
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const profit = cart.reduce((sum, item) => {
        const itemCost = item.cost || 0;
        return sum + ((item.price - itemCost) * item.quantity);
    }, 0);
    
    // Show confirmation with details
    const itemList = cart.map(item => 
        `${item.name} x${item.quantity} = ${formatRupiah(item.price * item.quantity)}`
    ).join('\n');
    
    const confirmMessage = `
💳 KONFIRMASI PEMBAYARAN

${itemList}

━━━━━━━━━━━━━━━━━━━
Subtotal: ${formatRupiah(total)}
Total: ${formatRupiah(total)}

Lakukan pembayaran?
    `.trim();
    
    if (confirm(confirmMessage)) {
        // Create transaction with proper structure
        const transactionId = Date.now();
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const transaction = {
            id: transactionId,
            date: today,
            time: now,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                cost: item.cost || 0,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subtotal: total,
            total: total, // Make sure this property exists
            profit: profit
        };
        
        console.log('💾 Saving transaction:', transaction);
        
        // ===== SAVE TO LOCALSTORAGE =====
        
        // 1. Save to transactions (for history)
        const transactions = JSON.parse(localStorage.getItem('nyumil_transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('nyumil_transactions', JSON.stringify(transactions));
        console.log('✅ Transactions saved:', transactions.length);
        
        // 2. Save to dailyStats (for statistics)
        const dailyStats = JSON.parse(localStorage.getItem('nyumil_dailyStats') || '{}');
        
        // Initialize today's stats if not exists
        if (!dailyStats[today]) {
            dailyStats[today] = {
                revenue: 0,
                transactions: 0,
                itemsSold: 0,
                profit: 0,
                items: {}
            };
        }
        
        // Update today's stats
        dailyStats[today].revenue += total;
        dailyStats[today].transactions += 1;
        dailyStats[today].profit += profit;
        
        // Update items sold
        transaction.items.forEach(item => {
            dailyStats[today].itemsSold += item.quantity;
            
            // Initialize item stats if not exists
            if (!dailyStats[today].items[item.id]) {
                dailyStats[today].items[item.id] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0,
                    profit: 0
                };
            }
            
            // Update item stats
            dailyStats[today].items[item.id].quantity += item.quantity;
            dailyStats[today].items[item.id].revenue += item.total;
            dailyStats[today].items[item.id].profit += (item.price - item.cost) * item.quantity;
        });
        
        localStorage.setItem('nyumil_dailyStats', JSON.stringify(dailyStats));
        console.log('✅ Daily stats updated:', dailyStats[today]);
        
        // ===== SHOW SUCCESS MESSAGE =====
        
        const successMessage = `
✅ TRANSAKSI BERHASIL!

ID Transaksi: #${transactionId}
Tanggal: ${today} ${now}
Total: ${formatRupiah(total)}

Terima kasih atas pembeliannya!
        `.trim();
        
        // Show notification if available, otherwise alert
        if (typeof showNotification === 'function') {
            showNotification(`Transaksi #${transactionId} berhasil! Total: ${formatRupiah(total)}`, 'success');
        } else {
            alert(successMessage);
        }
        
        // ===== RESET CART =====
        cart = [];
        saveCart();
        updateCartDisplay();
        
        // ===== AUTO-REFRESH STATISTICS IF STATS TAB IS ACTIVE =====
        const activeTab = document.querySelector('.tab.active');
        if (activeTab && activeTab.dataset.tab === 'stats') {
            console.log('🔄 Stats tab is active, refreshing statistics...');
            
            // Wait a moment for data to be saved
            setTimeout(() => {
                // Try to load statistics via app module
                if (typeof app !== 'undefined' && typeof app.loadStatisticsTab === 'function') {
                    app.loadStatisticsTab();
                } 
                // Try to load via statistik module
                else if (typeof loadStatistics === 'function') {
                    loadStatistics();
                }
                // Fallback to simple refresh
                else {
                    console.log('⚠️ No statistics module found, refreshing page...');
                    location.reload();
                }
            }, 300);
        }
        
        // ===== DEBUG: SHOW DATA IN CONSOLE =====
        console.log('📊 DEBUG - Data in localStorage after checkout:');
        console.log('1. Transactions:', JSON.parse(localStorage.getItem('nyumil_transactions') || '[]').length, 'items');
        console.log('2. DailyStats:', JSON.parse(localStorage.getItem('nyumil_dailyStats') || '{}'));
        console.log('3. Today\'s stats:', dailyStats[today] || 'No stats for today');
    }
}

// ===== INITIALIZATION =====
function initKasir() {
    console.log('🚀 initKasir() called');
    
    initCart();
    
    // Delay sedikit untuk memastikan DOM siap
    setTimeout(() => {
        renderProducts();
        
        // Setup event listeners untuk buttons
        const clearBtn = document.getElementById('clearBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', clearCart);
            console.log('✅ clearBtn event listener added');
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', checkout);
            console.log('✅ checkoutBtn event listener added');
        }
        
        console.log('🎉 Kasir system initialized successfully');
    }, 100);
}
