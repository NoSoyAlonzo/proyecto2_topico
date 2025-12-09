export function renderCart(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2><i class="fas fa-shopping-basket"></i> Mi Carrito</h2>
            <p class="page-subtitle">Revisa y gestiona los productos en tu carrito</p>
        </div>
        
        <div class="cart-container" id="cart-container">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando carrito...</p>
            </div>
        </div>
    `;
    
    setTimeout(() => loadCartContent(container), 100);
}

function loadCartContent(container) {
    const cartContainer = document.getElementById('cart-container');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-basket"></i>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega algunos productos desde el catálogo</p>
                <a href="#/products" class="btn btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-arrow-left"></i> Ver Productos
                </a>
            </div>
        `;
        return;
    }
    
    let total = 0;
    let itemsCount = 0;
    
    cartContainer.innerHTML = `
        <div class="cart-items" id="cart-items"></div>
        <div class="cart-summary">
            <div class="cart-summary-info">
                <div class="cart-items-count">
                    <i class="fas fa-box"></i> ${cart.length} producto${cart.length !== 1 ? 's' : ''}
                </div>
                <div class="cart-total">
                    <i class="fas fa-dollar-sign"></i> Total: $0.00
                </div>
            </div>
            <div class="cart-actions">
                <button class="btn btn-danger" id="clear-cart-btn">
                    <i class="fas fa-trash"></i> Vaciar Carrito
                </button>
                <button class="btn btn-success" id="checkout-btn">
                    <i class="fas fa-credit-card"></i> Simular Compra
                </button>
            </div>
        </div>
    `;
    
    const cartItems = document.getElementById('cart-items');
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsCount += item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item fade-in';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-details">
                    <span class="cart-item-price">
                        <i class="fas fa-tag"></i> $${item.price.toFixed(2)} c/u
                    </span>
                    <span class="cart-item-added">
                        <i class="far fa-calendar"></i> ${new Date(item.addedAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
            
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn decrease-btn" data-index="${index}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-index="${index}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="item-total">
                    <strong>$${itemTotal.toFixed(2)}</strong>
                </div>
                
                <button class="btn btn-danger remove-item-btn" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Actualizar total
    document.querySelector('.cart-total').innerHTML = `
        <i class="fas fa-dollar-sign"></i> Total: $${total.toFixed(2)}
    `;
    document.querySelector('.cart-items-count').innerHTML = `
        <i class="fas fa-box"></i> ${itemsCount} item${itemsCount !== 1 ? 's' : ''} en total
    `;
    
    // Agregar event listeners
    document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
    document.getElementById('checkout-btn').addEventListener('click', simulateCheckout);
    
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });
}

function decreaseQuantity(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        // Si la cantidad es 1, preguntar antes de eliminar
        if (window.confirm(`¿Eliminar ${cart[index].name} del carrito?`)) {
            cart.splice(index, 1);
        } else {
            return;
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    renderCart(document.getElementById('content'));
}

function increaseQuantity(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart[index].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    renderCart(document.getElementById('content'));
}

function removeItem(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const itemName = cart[index].name;
    
    if (window.confirm(`¿Seguro que quieres eliminar "${itemName}" del carrito?`)) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        window.alert(`"${itemName}" eliminado del carrito`);
        renderCart(document.getElementById('content'));
    }
}

function clearCart() {
    if (window.confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
        localStorage.removeItem('cart');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        window.alert('Carrito vaciado correctamente');
        renderCart(document.getElementById('content'));
    }
}

function simulateCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        window.alert('El carrito está vacío. Agrega productos primero.');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const confirmation = window.confirm(
        `¿Confirmar compra de ${itemsCount} producto(s) por un total de $${total.toFixed(2)}?\n\n` +
        'Esta es solo una simulación. No se procesará ningún pago real.'
    );
    
    if (confirmation) {
        window.alert(
            ' Compra simulada exitosamente!\n\n' +
            `Total: $${total.toFixed(2)}\n` +
            `Productos: ${itemsCount}\n` +
            `Fecha: ${new Date().toLocaleString()}\n\n` +
            'Gracias por usar Mini Tienda!'
        );
        
        // Limpiar carrito después de la compra simulada
        localStorage.removeItem('cart');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Redirigir a productos
        window.location.hash = '#/products';
    }
}