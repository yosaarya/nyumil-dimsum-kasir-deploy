// ===== STATISTIK FUNCTIONS =====

let currentChart = null;

// Initialize Statistics
function initStatistik() {
    console.log('Statistik module initialized');
    loadStatistics();
}

// Load Statistics
async function loadStatistics() {
    const statsContainer = document.querySelector('#stats-tab .stats-container');
    if (!statsContainer) return;

    try {
        if (!database || typeof database.getDailyStats !== 'function') {
            throw new Error('Database tidak tersedia');
        }

        const today = getToday();
        const stats = await database.getDailyStats(today);
        
        // Get best selling products
        const bestSellers = await database.getBestSellingProducts(5);
        
        const html = `
            <div class="stats-header">
                <h3><i class="fas fa-chart-bar"></i> Statistik Penjualan</h3>
                <div class="date-filter">
                    <input type="date" id="statsDate" value="${today}">
                    <button class="btn btn-secondary" onclick="loadStatsByDate()">
                        <i class="fas fa-filter"></i> Filter
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon income">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Pendapatan Hari Ini</h4>
                        <p class="stat-value">${formatRupiah(stats.revenue)}</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon transaction">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Total Transaksi</h4>
                        <p class="stat-value">${stats.transactions}</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon items">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Item Terjual</h4>
                        <p class="stat-value">${stats.itemsSold}</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon profit">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Laba Bersih</h4>
                        <p class="stat-value">${formatRupiah(stats.profit)}</p>
                    </div>
                </div>
            </div>
            
            <div class="charts-section">
                <div class="chart-container">
                    <h4><i class="fas fa-chart-pie"></i> Distribusi Kategori</h4>
                    <canvas id="categoryChart"></canvas>
                </div>
                
                <div class="chart-container">
                    <h4><i class="fas fa-trophy"></i> Produk Terlaris</h4>
                    <div class="best-sellers">
                        ${bestSellers.map((item, index) => `
                            <div class="seller-item">
                                <span class="rank">${index + 1}</span>
                                <span class="seller-name">${item.name}</span>
                                <span class="seller-qty">${item.quantity} terjual</span>
                                <span class="seller-revenue">${formatRupiah(item.revenue)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="export-section">
                <h4><i class="fas fa-download"></i> Ekspor Data</h4>
                <div class="export-buttons">
                    <button class="btn btn-secondary" onclick="exportStats('today')">
                        <i class="fas fa-file-csv"></i> Ekspor Hari Ini
                    </button>
                    <button class="btn btn-secondary" onclick="exportStats('all')">
                        <i class="fas fa-file-excel"></i> Ekspor Semua
                    </button>
                </div>
            </div>
        `;

        statsContainer.innerHTML = html;
        
        // Render chart
        renderCategoryChart(stats);
        
    } catch (error) {
        console.error('Error loading statistics:', error);
        statsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Gagal memuat statistik</p>
                <button class="btn btn-secondary" onclick="loadStatistics()">Coba Lagi</button>
            </div>
        `;
    }
}

// Load Stats by Date
async function loadStatsByDate() {
    const dateInput = document.getElementById('statsDate');
    if (!dateInput) return;
    
    const selectedDate = dateInput.value;
    const statsContainer = document.querySelector('#stats-tab .stats-container');
    
    if (!statsContainer) return;
    
    try {
        const stats = await database.getDailyStats(selectedDate);
        
        // Update stats cards
        const statCards = statsContainer.querySelectorAll('.stat-value');
        if (statCards.length >= 4) {
            statCards[0].textContent = formatRupiah(stats.revenue);
            statCards[1].textContent = stats.transactions;
            statCards[2].textContent = stats.itemsSold;
            statCards[3].textContent = formatRupiah(stats.profit);
        }
        
        // Update chart
        renderCategoryChart(stats);
        
    } catch (error) {
        console.error('Error loading stats by date:', error);
        showNotification('Gagal memuat statistik untuk tanggal tersebut', 'error');
    }
}

// Render Category Chart
function renderCategoryChart(stats) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Get category data
    const categories = {};
    if (stats.items && typeof stats.items === 'object') {
        Object.values(stats.items).forEach(item => {
            const product = DEFAULT_PRODUCTS.find(p => p.name === item.name);
            if (product && product.category) {
                if (!categories[product.category]) {
                    categories[product.category] = 0;
                }
                categories[product.category] += item.quantity;
            }
        });
    }
    
    const ctx = canvas.getContext('2d');
    
    // If no data, show message
    if (Object.keys(categories).length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Tidak ada data untuk ditampilkan', canvas.width/2, canvas.height/2);
        return;
    }
    
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    // Create chart
    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#e63946', // Red
                    '#457b9d', // Blue
                    '#2a9d8f', // Teal
                    '#e9c46a', // Yellow
                    '#f4a261', // Orange
                    '#9d4edd'  // Purple
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: false
                }
            }
        }
    });
}

// Export Statistics
async function exportStats(type = 'today') {
    try {
        let csvData = '';
        let filename = '';
        
        if (type === 'today') {
            const today = getToday();
            const stats = await database.getDailyStats(today);
            
            csvData = `Tanggal,Pendapatan,Transaksi,Item Terjual,Laba\n`;
            csvData += `${today},${stats.revenue},${stats.transactions},${stats.itemsSold},${stats.profit}\n`;
            
            filename = `statistik-${today}.csv`;
        } else {
            // Get all daily stats
            if (!database.dailyStats) {
                showNotification('Tidak ada data statistik', 'error');
                return;
            }
            
            csvData = `Tanggal,Pendapatan,Transaksi,Item Terjual,Laba\n`;
            Object.entries(database.dailyStats).forEach(([date, stats]) => {
                csvData += `${date},${stats.revenue},${stats.transactions},${stats.itemsSold},${stats.profit}\n`;
            });
            
            filename = `statistik-all-${getToday()}.csv`;
        }
        
        // Create download
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`Data berhasil diekspor: ${filename}`);
        
    } catch (error) {
        console.error('Error exporting stats:', error);
        showNotification('Gagal mengekspor data', 'error');
    }
}

// Initialize when tab is shown
document.addEventListener('DOMContentLoaded', function() {
    // Listen for tab changes
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            if (this.dataset.tab === 'stats') {
                // Load statistics when stats tab is clicked
                setTimeout(loadStatistics, 100);
            }
        });
    });
});
