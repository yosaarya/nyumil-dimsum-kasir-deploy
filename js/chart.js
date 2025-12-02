// chart.js - SIMPLIFIED VERSION
// Chart.js helper functions

console.log('Chart.js helpers loading...');

// Check if Chart.js is loaded
function waitForChart(callback) {
    if (typeof Chart !== 'undefined') {
        callback();
    } else {
        // Try again after 100ms
        setTimeout(() => waitForChart(callback), 100);
    }
}

// Initialize when Chart is ready
waitForChart(() => {
    console.log('Chart.js is ready, initializing helpers...');
    
    // Simple chart configuration
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = '#333';
    
    // Create basic chart functions
    window.createChart = function(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas #${canvasId} not found`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...options
            }
        });
    };
    
    window.createBarChart = function(canvasId, labels, data, label = 'Data') {
        return createChart(canvasId, 'bar', {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: '#457b9d',
                borderColor: '#1d3557',
                borderWidth: 1
            }]
        }, {
            scales: {
                y: { beginAtZero: true }
            }
        });
    };
    
    window.createLineChart = function(canvasId, labels, data, label = 'Data') {
        return createChart(canvasId, 'line', {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: '#e63946',
                backgroundColor: 'rgba(230, 57, 70, 0.1)',
                tension: 0.4,
                fill: true
            }]
        }, {
            scales: {
                y: { beginAtZero: true }
            }
        });
    };
    
    window.createPieChart = function(canvasId, labels, data) {
        return createChart(canvasId, 'pie', {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#e63946', '#457b9d', '#2a9d8f',
                    '#e9c46a', '#f4a261', '#9d4edd'
                ]
            }]
        }, {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        });
    };
    
    window.destroyChart = function(chart) {
        if (chart) {
            chart.destroy();
        }
    };
    
    console.log('Chart.js helpers ready!');
});
