// ========== UTILS ==========
function formatRupiah(amount) {
  return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
}

// ========== DATABASE ==========
let db;
let cart = [];
let transactions = [];

function initDatabase() {
  // Load from localStorage
  const saved = localStorage.getItem('nyumil_cart');
  if (saved) cart = JSON.parse(saved);
  
  const savedTrans = localStorage.getItem('nyumil_transactions');
  if (savedTrans) transactions = JSON.parse(savedTrans);
  
  console.log('Database initialized');
}

function saveCart() {
  localStorage.setItem('nyumil_cart', JSON.stringify(cart));
}

function saveTransaction(transaction) {
  transaction.id = Date.now();
  transaction.date = new Date().toISOString();
  transactions.push(transaction);
  localStorage.setItem('nyumil_transactions', JSON.stringify(transactions));
}

// ========== KASIR ==========
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartDisplay();
  showNotification('Ditambahkan ke keranjang', 'success');
}

function updateCartDisplay() {
  const orderList = document.getElementById('orderList');
  const emptyOrder = document.getElementById('emptyOrder');
  const orderCount = document.getElementById('orderCount');
  const subtotal = document.getElementById('subtotalAmount');
  const total = document.getElementById('totalAmount');
  
  if (!orderList) return;
  
  if (cart.length === 0) {
    emptyOrder.style.display = 'flex';
    orderList.innerHTML = '';
    orderCount.textContent = '0';
    subtotal.textContent = 'Rp 0';
    total.textContent = 'Rp 0';
    return;
  }
  
  emptyOrder.style.display = 'none';
  
  let html = '';
  let totalAmount = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;
    
    html += `
      <div class="order-item">
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-price">${formatRupiah(item.price)}</span>
        </div>
        <div class="item-controls">
          <button class="btn-quantity" onclick="changeQuantity(${item.id}, -1)">
            <i class="fas fa-minus"></i>
          </button>
          <span class="quantity">${item.quantity}</span>
          <button class="btn-quantity" onclick="changeQuantity(${item.id}, 1)">
            <i class="fas fa-plus"></i>
          </button>
          <button class="btn-remove" onclick="removeFromCart(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="item-total">
          ${formatRupiah(itemTotal)}
        </div>
      </div>
    `;
  });
  
  orderList.innerHTML = html;
  orderCount.textContent = cart.length;
  subtotal.textContent = formatRupiah(totalAmount);
  total.textContent = formatRupiah(totalAmount);
}

// ========== APP INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Loaded');
  
  // Initialize
  initDatabase();
  
  // Setup tabs
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`${tabId}-tab`).classList.add('active');
      
      console.log('Switched to tab:', tabId);
    });
  });
  
  // Setup buttons
  document.getElementById('clearBtn')?.addEventListener('click', function() {
    cart = [];
    saveCart();
    updateCartDisplay();
    showNotification('Keranjang dikosongkan', 'info');
  });
  
  document.getElementById('checkoutBtn')?.addEventListener('click', function() {
    if (cart.length === 0) {
      showNotification('Keranjang kosong!', 'error');
      return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const modal = document.getElementById('paymentModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.innerHTML = `
        <div class="modal-content">
          <h3><i class="fas fa-credit-card"></i> Pembayaran</h3>
          <p>Total: <strong>${formatRupiah(total)}</strong></p>
          <button class="btn btn-primary" onclick="processPayment()">
            <i class="fas fa-check"></i> Konfirmasi Pembayaran
          </button>
          <button class="btn btn-secondary" onclick="closeModal()">
            <i class="fas fa-times"></i> Batal
          </button>
        </div>
      `;
    }
  });
  
  // Load sample products
  loadSampleProducts();
  
  console.log('App initialized successfully!');
});

function loadSampleProducts() {
  const products = [
    { id: 1, name: 'Dimsum Ayam', price: 15000, category: 'dimsum' },
    { id: 2, name: 'Dimsum Udang', price: 20000, category: 'dimsum' },
    { id: 3, name: 'Siomay', price: 12000, category: 'dimsum' },
    { id: 4, name: 'Teh Tarik', price: 8000, category: 'minuman' },
    { id: 5, name: 'Kopi', price: 10000, category: 'minuman' }
  ];
  
  // Render products
  const menuGrid = document.getElementById('menuGrid');
  if (menuGrid) {
    let html = '';
    products.forEach(product => {
      html += `
        <div class="menu-item" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
          <div class="menu-item-content">
            <h4>${product.name}</h4>
            <p class="price">${formatRupiah(product.price)}</p>
            <button class="btn-add">
              <i class="fas fa-plus"></i> Tambah
            </button>
          </div>
        </div>
      `;
    });
    menuGrid.innerHTML = html;
  }
}
