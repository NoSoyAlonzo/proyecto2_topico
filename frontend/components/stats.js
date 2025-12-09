export async function renderStats(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-chart-bar"></i> Estadísticas</h2>
            <p class="page-subtitle">Métricas y datos de tu experiencia de compra</p>
        </div>
        
        <div class="stats-container" id="stats-container">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando estadísticas...</p>
            </div>
        </div>
    `;
    
    setTimeout(() => loadStatsContent(container), 100);
}

async function loadStatsContent(container) {
    const statsContainer = document.getElementById('stats-container');
    
    try {
        // Obtener datos del carrito
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Obtener productos del API
        const response = await fetch('http://localhost:3000/api/products');
        const products = response.ok ? await response.json() : [];
        
        // Calcular estadísticas del carrito
        const cartStats = calculateCartStats(cart);
        
        // Calcular estadísticas de productos
        const productStats = calculateProductStats(products);
        
        // Calcular estadísticas generales
        const generalStats = calculateGeneralStats(cart, products);
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <!-- Estadísticas del Carrito -->
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="stat-value">${cartStats.totalItems}</div>
                    <div class="stat-label">Productos en Carrito</div>
                    <div class="stat-subtext">${cart.length} tipo${cart.length !== 1 ? 's' : ''} diferente${cart.length !== 1 ? 's' : ''}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-value">$${cartStats.totalValue.toFixed(2)}</div>
                    <div class="stat-label">Valor Total del Carrito</div>
                    <div class="stat-subtext">Promedio: $${cartStats.averageValue.toFixed(2)} por producto</div>
                </div>
                
                <!-- Estadísticas de Productos -->
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <div class="stat-value">${productStats.totalProducts}</div>
                    <div class="stat-label">Productos en Catálogo</div>
                    <div class="stat-subtext">Stock total: ${productStats.totalStock} unidades</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-tags"></i>
                    </div>
                    <div class="stat-value">$${productStats.averagePrice.toFixed(2)}</div>
                    <div class="stat-label">Precio Promedio</div>
                    <div class="stat-subtext">Rango: $${productStats.minPrice.toFixed(2)} - $${productStats.maxPrice.toFixed(2)}</div>
                </div>
                
                <!-- Estadísticas Generales -->
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-value">${generalStats.cartUtilization}%</div>
                    <div class="stat-label">Utilización de Carrito</div>
                    <div class="stat-subtext">${cartStats.uniqueProducts} de ${productStats.totalProducts} productos únicos</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="stat-value">${generalStats.visits}</div>
                    <div class="stat-label">Visitas a la Tienda</div>
                    <div class="stat-subtext">Primera visita: ${generalStats.firstVisit}</div>
                </div>
            </div>
            
            <div class="stats-details" style="margin-top: 2rem;">
                <h3><i class="fas fa-info-circle"></i> Detalles Adicionales</h3>
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                    <p><strong>Producto más caro en carrito:</strong> ${cartStats.mostExpensiveItem || 'Ninguno'}</p>
                    <p><strong>Producto más económico en carrito:</strong> ${cartStats.cheapestItem || 'Ninguno'}</p>
                    <p><strong>Valor total del inventario:</strong> $${productStats.totalInventoryValue.toFixed(2)}</p>
                    <p><strong>Última actualización:</strong> ${new Date().toLocaleString()}</p>
                </div>
            </div>
            
            <div class="stats-actions" style="margin-top: 2rem; text-align: center;">
                <button class="btn btn-secondary" id="refresh-stats">
                    <i class="fas fa-sync-alt"></i> Actualizar Estadísticas
                </button>
                <button class="btn btn-primary" onclick="window.print()" style="margin-left: 1rem;">
                    <i class="fas fa-print"></i> Imprimir Reporte
                </button>
            </div>
        `;
        
        // Event listener para actualizar
        document.getElementById('refresh-stats').addEventListener('click', () => {
            renderStats(container);
        });
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        
        statsContainer.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>Error al cargar estadísticas</h3>
                <p>No se pudieron cargar todas las estadísticas.</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <button class="btn btn-secondary" onclick="renderStats(document.getElementById('content'))">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }
}

function calculateCartStats(cart) {
    if (cart.length === 0) {
        return {
            totalItems: 0,
            totalValue: 0,
            averageValue: 0,
            uniqueProducts: 0,
            mostExpensiveItem: null,
            cheapestItem: null
        };
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const averageValue = totalValue / totalItems;
    const uniqueProducts = cart.length;
    
    // Encontrar productos más caro y más económico
    const sortedByPrice = [...cart].sort((a, b) => b.price - a.price);
    const mostExpensiveItem = sortedByPrice[0] ? `${sortedByPrice[0].name} ($${sortedByPrice[0].price})` : null;
    const cheapestItem = sortedByPrice[sortedByPrice.length - 1] ? 
        `${sortedByPrice[sortedByPrice.length - 1].name} ($${sortedByPrice[sortedByPrice.length - 1].price})` : null;
    
    return {
        totalItems,
        totalValue,
        averageValue,
        uniqueProducts,
        mostExpensiveItem,
        cheapestItem
    };
}

function calculateProductStats(products) {
    if (products.length === 0) {
        return {
            totalProducts: 0,
            totalStock: 0,
            averagePrice: 0,
            minPrice: 0,
            maxPrice: 0,
            totalInventoryValue: 0
        };
    }
    
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const prices = products.map(p => parseFloat(p.price));
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    return {
        totalProducts,
        totalStock,
        averagePrice,
        minPrice,
        maxPrice,
        totalInventoryValue: totalValue
    };
}

function calculateGeneralStats(cart, products) {
    // Obtener o inicializar contador de visitas
    let visits = parseInt(localStorage.getItem('store_visits')) || 1;
    localStorage.setItem('store_visits', visits + 1);
    
    // Obtener primera visita
    let firstVisit = localStorage.getItem('first_visit');
    if (!firstVisit) {
        firstVisit = new Date().toLocaleDateString();
        localStorage.setItem('first_visit', firstVisit);
    }
    
    // Calcular utilización de carrito
    const cartUtilization = products.length > 0 
        ? Math.round((cart.length / products.length) * 100) 
        : 0;
    
    return {
        visits,
        firstVisit,
        cartUtilization
    };
}