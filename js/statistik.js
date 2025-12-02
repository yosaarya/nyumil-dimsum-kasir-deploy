// ===== STATISTICS MODULE =====
let statsChart = null;

// Initialize Statistics Module
function initStatistik() {
    console.log('Statistics module initialized');
    
    // Load stats when stats tab is active
    const statsTab = document.querySelector('[data-tab="stats"]');
    if (statsTab) {
        statsTab.addEventListener('click', () => {
            setTimeout(() => loadStatistics(), 100);
        });
    }
    
    // Load initial stats if on stats tab
    if (document.querySelector('#stats-tab.active')) {
        loadStatistics();
    }
}

// Load Statistics Data
async function loadStatistics() {
    const statsContainer = document.querySelector('#stats-tab .stats-container');
    if (!statsContainer) return;
    
    try {
        // Get today's stats
        const today = getToday();
        const dailyStats = await database.getDailyStats(today);
        
        // Get best sellers
        const bestSellers = await database.getBestSellingProducts(5);
        
        // Get stats for last 7 days
        const last7Days = getLast7Days();
        const weeklyStats = await database.getStatsByDateRange(last7Days[0], last7Days[6]);
        
        // Render stats
        renderStatistics(statsContainer, {
            today: dailyStats,
            bestSellers: bestSellers,
            weekly: weeklyStats,
            todayDate: today
        });
        
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

// Render Statistics UI
function renderStatistics(container, data) {
    const { today, bestSellers, weekly, todayDate } = data;
    
    container.innerHTML = `
        <div class="stats-header">
            <h3><i class="fas fa-chart-bar"></i> Statistik Penjualan</h3>
            <div class="stats-controls">
                <input type="date" id="statsDate" value="${todayDate}" class="date-picker">
                <button class="btn btn-sm" onclick="filterStatsByDate()">
                    <i class="fas fa-filter"></i> Filter
                </button>
                <button class="btn btn-sm btn-secondary" onclick="loadStatistics()">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>
        </div>
        
        <div class="stats-summary-cards">
            <div class="stat-card">
                <div class="stat-icon" style="background: #e63946;">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="stat-info">
                    <h4>Pendapatan</h4>
                    <p class="stat-value">${formatRupiah(today.revenue)}</p>
                    <small>Hari ini</small>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: #457b9d;">
                    <i class="fas fa-receipt"></i>
                </div>
                <div class="stat-info">
                    <h4>Transaksi</h4>
                    <p class="stat-value">${today.transactions}</p>
                    <small>Hari ini</small>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: #2a9d8f;">
                    <i class="fas fa-box"></i>
                </div>
                <div class="stat-info">
                    <h4>Item Terjual</h4>
                    <p class="stat-value">${today.itemsSold}</p>
                    <small>Hari ini</small>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: #e9c46a;">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-info">
                    <h4>Laba</h4>
                    <p class="stat-value">${formatRupiah(today.profit)}</p>
                    <small>Hari ini</small>
                </div>
            </div>
        </div>
        
        <div class="charts-section">
            <div class="chart-card">
                <h4><i class="fas fa-chart-pie"></i> Distribusi Produk</h4>
                <canvas id="productDistributionChart" height="250"></canvas>
            </div>
            
            <div class="chart-card">
                <h4><i class="fas fa-chart-line"></i> Tren 7 Hari</h4>
                <canvas id="weeklyTrendChart" height="250"></canvas>
            </div>
        </div>
        
        <div class="best-sellers-section">
            <h4><i class="fas fa-trophy"></i> Produk Terlaris</h4>
            <div class="sellers-list">
                ${bestSellers.length > 0 ? bestSellers.map((item, index) => `
                    <div class="seller-item">
                        <span class="rank-badge">${index + 1}</span>
                        <div class="seller-info">
                            <strong>${item.name}</strong>
                            <small>Terjual: ${item.quantity} item</small>
                        </div>
                        <div class="seller-stats">
                            <span>${formatRupiah(item.revenue)}</span>
                            <small>Laba: ${formatRupiah(item.profit)}</small>
                        </div>
                    </div>
                `).join('') : `
                    <div class="empty-state">
                        <i class="fas fa-chart-bar"></i>
                        <p>Belum ada data penjualan</p>
                    </div>
                `}
            </div>
        </div>
        
        <div class="export-section">
            <h4><i class="fas fa-download"></i> Ekspor Data</h4>
            <div class="export-buttons">
                <button class="btn btn-secondary" onclick="exportData('daily')">
                    <i class="fas fa-file-csv"></i> Ekspor Harian
                </button>
                <button class="btn btn-secondary" onclick="exportData('weekly')">
                    <i class="fas fa-file-excel"></i> Ekspor Mingguan
                </button>
                <button class="btn btn-secondary" onclick="exportData('products')">
                    <i class="fas fa-file-alt"></i> Ekspor Produk
                </button>
            </div>
        </div>
    `;
    
    // Render charts
    renderProductDistributionChart(today);
    renderWeeklyTrendChart();
}

// Get Last 7 Days
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// Filter Stats by Date
async function filterStatsByDate() {
    const dateInput = document.getElementById('statsDate');
    if (!dateInput) return;
    
    const selectedDate = dateInput.value;
    const statsContainer = document.querySelector('#stats-tab .stats-container');
    
    if (!statsContainer) return;
    
    try {
        const dailyStats = await database.getDailyStats(selectedDate);
        
        // Update stats cards
        const statValues = statsContainer.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = formatRupiah(dailyStats.revenue);
            statValues[1].textContent = dailyStats.transactions;
            statValues[2].textContent = dailyStats.itemsSold;
            statValues[3].textContent = formatRupiah(dailyStats.profit);
        }
        
        // Update date labels
        const dateLabels = statsContainer.querySelectorAll('small');
        dateLabels.forEach(label => {
            if (label.textContent === 'Hari ini') {
                label.textContent = selectedDate;
            }
        });
        
        // Update chart
        renderProductDistributionChart(dailyStats);
        
        showNotification(`Statistik diperbarui untuk tanggal ${selectedDate}`);
        
    } catch (error) {
        showNotification('Gagal memuat statistik untuk tanggal tersebut', 'error');
    }
}

// Render Product Distribution Chart
function renderProductDistributionChart(stats) {
    const canvas = document.getElementById('productDistributionChart');
    if (!canvas) return;
    
    // Destroy existing chart
    if (statsChart) {
        statsChart.destroy();
    }
    
    // Prepare data
    const categories = {};
    if (stats.items && typeof stats.items === 'object') {
        Object.values(stats.items).forEach(item => {
            const product = DEFAULT_PRODUCTS.find(p => p.name === item.name);
            if (product && product.category) {
                if (!categories[product.category]) {
                    categories[product.category] = 0;
                }
                categories[product.category] += item.revenue;
            }
        });
    }
    
    // If no data, show message
    if (Object.keys(categories).length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Tidak ada data untuk ditampilkan', canvas.width/2, canvas.height/2);
        return;
    }
    
    // Create chart
    statsChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#e63946', '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Render Weekly Trend Chart
function renderWeeklyTrendChart() {
    const canvas = document.getElementById('weeklyTrendChart');
    if (!canvas) return;
    
    // Get last 7 days revenue
    const last7Days = getLast7Days();
    const dailyRevenues = last7Days.map(date => {
        if (database.dailyStats && database.dailyStats[date]) {
            return database.dailyStats[date].revenue || 0;
        }
        return 0;
    });
    
    // Format dates for display
    const displayDates = last7Days.map(date => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    
    // Create chart
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: displayDates,
            datasets: [{
                label: 'Pendapatan',
                data: dailyRevenues,
                borderColor: '#e63946',
                backgroundColor: 'rgba(230, 57, 70, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatRupiah(value).replace('Rp ', '');
                        }
                    }
                }
            }
        }
    });
}

// Export Data
async function exportData(type) {
    try {
        let csv = '';
        let filename = '';
        
        switch (type) {
            case 'daily':
                csv = await database.exportToCSV('stats');
                filename = `statistik-harian-${getToday()}.csv`;
                break;
                
            case 'weekly':
                const last7Days = getLast7Days();
                const weeklyStats = await database.getStatsByDateRange(last7Days[0], last7Days[6]);
                
                csv = 'Tanggal,Pendapatan,Transaksi,Item Terjual,Laba\n';
                last7Days.forEach(date => {
                    const stats = database.dailyStats[date] || { revenue: 0, transactions: 0, itemsSold: 0, profit: 0 };
                    csv += `${date},${stats.revenue},${stats.transactions},${stats.itemsSold},${stats.profit}\n`;
                });
                filename = `statistik-mingguan-${getToday()}.csv`;
                break;
                
            case 'products':
                csv = await database.exportToCSV('products');
                filename = `daftar-produk-${getToday()}.csv`;
                break;
        }
        
        // Download file
        const blob = new Blob([csv], { type: 'text/csv' });
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
        console.error('Export error:', error);
        showNotification('Gagal mengekspor data', 'error');
    }
}
