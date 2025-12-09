export function renderHeader() {
    const container = document.getElementById('header-container');
    if (!container) {
        console.error('- No se encontró header-container');
        return;
    }
    
    container.innerHTML = `
        <header class="header fade-in">
            <div class="header-title">
                <h1><i class="fas fa-shopping-cart"></i> Mini Tienda</h1>
                <p class="header-subtitle">Proyecto Final - Aplicaciones Web</p>
            </div>
            
            <nav class="nav">
                <a href="#/products" class="nav-link" id="nav-products">
                    <i class="fas fa-boxes"></i>
                    <span>Productos</span>
                </a>
                <a href="#/cart" class="nav-link" id="nav-cart">
                    <i class="fas fa-shopping-basket"></i>
                    <span>Carrito</span>
                    <span class="cart-badge" id="cart-badge">0</span>
                </a>
                <a href="#/stats" class="nav-link" id="nav-stats">
                    <i class="fas fa-chart-bar"></i>
                    <span>Estadísticas</span>
                </a>
            </nav>
        </header>
    `;
    
    updateCartBadge();
    window.addEventListener('storage', updateCartBadge);
    window.addEventListener('cartUpdated', updateCartBadge);
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

export function updateActiveNav(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.getElementById(`nav-${route.replace('/', '')}`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}