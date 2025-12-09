export async function renderProductsList(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-boxes"></i> Catálogo de Productos</h2>
            <p class="page-subtitle">Selecciona los productos que deseas agregar al carrito</p>
        </div>
        
        <div class="products-container" id="products-container">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando productos...</p>
            </div>
        </div>
    `;
    
    const productsContainer = document.getElementById('products-container');
    
    try {
        const response = await fetch('http://localhost:3000/api/products');
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const products = await response.json();
        
        if (products.length === 0) {
            productsContainer.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-box-open"></i>
                    <h3>No hay productos disponibles</h3>
                    <p>Por el momento no hay productos en el catálogo.</p>
                </div>
            `;
            return;
        }
        
        productsContainer.innerHTML = `
            <div class="product-grid" id="product-grid"></div>
        `;
        
        const productGrid = document.getElementById('product-grid');
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card fade-in';
            
            const stockClass = product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : '';
            const stockText = product.stock > 10 ? 'Disponible' : product.stock > 0 ? 'Últimas unidades' : 'Agotado';
            const isOutOfStock = product.stock === 0;
            
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/150?text=Producto'">
                
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    
                    <div class="product-stock ${stockClass}">
                        <i class="fas fa-${product.stock > 0 ? 'check-circle' : 'times-circle'}"></i>
                        ${stockText} (${product.stock} unidades)
                    </div>
                    
                    ${product.description ? `
                        <p class="product-description">${product.description}</p>
                    ` : ''}
                    
                    <button class="btn btn-primary add-to-cart-btn" 
                            data-id="${product.id}"
                            data-name="${product.name}"
                            data-price="${product.price}"
                            ${isOutOfStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i>
                        ${isOutOfStock ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                </div>
            `;
            
            productGrid.appendChild(productCard);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', addToCart);
        });
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        
        productsContainer.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error al cargar productos</h3>
                <p>No se pudieron cargar los productos. Por favor, verifica:</p>
                <ul style="text-align: left; margin: 1rem auto; max-width: 400px;">
                    <li>Que el servidor backend esté corriendo</li>
                    <li>Que la URL sea correcta: http://localhost:3000</li>
                    <li>Tu conexión a internet</li>
                </ul>
                <p><strong>Detalles técnicos:</strong> ${error.message}</p>
                <button class="btn btn-secondary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }
}

function addToCart(event) {
    const button = event.currentTarget;
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex(item => item.id == id);
    
    if (existingItemIndex > -1) {
        // Incrementar cantidad
        cart[existingItemIndex].quantity += 1;
    } else {
        // Agregar nuevo producto
        cart.push({
            id,
            name,
            price,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Disparar evento personalizado para actualizar badge
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    // Mostrar notificación
    showNotification(`${name} agregado al carrito`);
    
    // Deshabilitar botón si es el último producto
    const productElement = button.closest('.product-card');
    const stockElement = productElement.querySelector('.product-stock');
    const stockText = stockElement.textContent;
    const currentStock = parseInt(stockText.match(/\((\d+)/)?.[1] || 0);
    
    if (currentStock - 1 <= 0) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-times-circle"></i> Agotado';
        stockElement.innerHTML = '<i class="fas fa-times-circle"></i> Agotado (0 unidades)';
        stockElement.className = 'product-stock';
    } else {
        stockElement.textContent = stockText.replace(
            /\((\d+)/,
            `(${currentStock - 1}`
        );
    }
}

function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar estilos para animaciones de notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);