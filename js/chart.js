        // Initialize Chart.js configuration
        Chart.defaults.font.family = "'Poppins', sans-serif";
        Chart.defaults.color = '#333';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;

// chart.js - WAIT FOR CHART.JS TO LOAD
(function() {
    function initChartFunctions() {
        // ===== CHART.JS HELPER FUNCTIONS =====
        // Initialize Chart.js configuration
        Chart.defaults.font.family = "'Poppins', sans-serif";
        Chart.defaults.color = '#333';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;

        // ... semua kode chart functions ...
    }

    // Tunggu sampai Chart.js tersedia
    if (typeof Chart !== 'undefined') {
        initChartFunctions();
    } else {
        // Coba lagi setelah 100ms
        const checkInterval = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                clearInterval(checkInterval);
                initChartFunctions();
                console.log('Chart.js loaded successfully');
            }
        }, 100);
        
        // Timeout setelah 5 detik
        setTimeout(() => {
            if (typeof Chart === 'undefined') {
                console.error('Chart.js failed to load after 5 seconds');
                clearInterval(checkInterval);
            }
        }, 5000);
    }
})();

        // Create Bar Chart
        window.createBarChart = function(canvasId, data, options = {}) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;
            
            const ctx = canvas.getContext('2d');
            
            const defaultOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [2]
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            };
            
            return new Chart(ctx, {
                type: 'bar',
                data: data,
                options: { ...defaultOptions, ...options }
            });
        };

        // Create Line Chart
        window.createLineChart = function(canvasId, data, options = {}) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;
            
            const ctx = canvas.getContext('2d');
            
            const defaultOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [2]
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            };
            
            return new Chart(ctx, {
                type: 'line',
                data: data,
                options: { ...defaultOptions, ...options }
            });
        };

        // Create Pie/Doughnut Chart
        window.createPieChart = function(canvasId, data, options = {}) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;
            
            const ctx = canvas.getContext('2d');
            
            const defaultOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                },
                cutout: options.type === 'doughnut' ? '60%' : 0
            };
            
            return new Chart(ctx, {
                type: options.type || 'pie',
                data: data,
                options: { ...defaultOptions, ...options }
            });
        };

        // Create Horizontal Bar Chart
        window.createHorizontalBarChart = function(canvasId, data, options = {}) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;
            
            const ctx = canvas.getContext('2d');
            
            const defaultOptions = {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [2]
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            };
            
            return new Chart(ctx, {
                type: 'bar',
                data: data,
                options: { ...defaultOptions, ...options }
            });
        };

        // Create Revenue vs Profit Chart
        window.createRevenueProfitChart = function(canvasId, dates, revenues, profits) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;
            
            const ctx = canvas.getContext('2d');
            
            return new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Pendapatan',
                            data: revenues,
                            backgroundColor: '#457b9d',
                            borderColor: '#1d3557',
                            borderWidth: 1,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Laba',
                            data: profits,
                            type: 'line',
                            borderColor: '#e63946',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            yAxisID: 'y1',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Pendapatan (Rp)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return formatRupiah(value).replace('Rp ', '');
                                }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Laba (Rp)'
                            },
                            grid: {
                                drawOnChartArea: false
                            },
                            ticks: {
                                callback: function(value) {
                                    return formatRupiah(value).replace('Rp ', '');
                                }
                            }
                        }
                    }
                }
            });
        };

        // Destroy Chart
        window.destroyChart = function(chartInstance) {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };

        // Update Chart Data
        window.updateChartData = function(chartInstance, newData) {
            if (!chartInstance) return;
            
            chartInstance.data = newData;
            chartInstance.update();
        };

        // Get Chart.js Colors
        window.getChartColors = function(count) {
            const baseColors = [
                '#e63946', '#457b9d', '#2a9d8f',
                '#e9c46a', '#f4a261', '#9d4edd',
                '#ff6b6b', '#48cae4', '#52b788',
                '#ff9e00', '#9b5de5', '#00bbf9'
            ];
            
            if (count <= baseColors.length) {
                return baseColors.slice(0, count);
            }
            
            // Generate more colors if needed
            const colors = [...baseColors];
            for (let i = baseColors.length; i < count; i++) {
                const hue = (i * 137.508) % 360; // Golden angle approximation
                colors.push(`hsl(${hue}, 70%, 65%)`);
            }
            
            return colors;
        };

        // Format Currency for Chart Tooltips
        window.formatCurrencyTooltip = function(context) {
            let label = context.dataset.label || '';
            let value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            
            if (typeof value === 'number') {
                return `${label}: ${formatRupiah(value)}`;
            }
            
            return label;
        };
    }

    if (typeof Chart !== 'undefined') {
        init();
    } else {
        window.addEventListener('load', function() {
            if (typeof Chart !== 'undefined') {
                init();
            } else {
                console.error('Chart.js is not loaded.');
            }
        });
    }
