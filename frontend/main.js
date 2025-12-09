// Importar componentes
import { renderHeader, updateActiveNav } from './components/header.js';
import { renderProductsList } from './components/productList.js';
import { renderCart } from './components/cart.js';
import { renderStats } from './components/stats.js';

// Variables globales
let currentRoute = '';

// Inicializar aplicación
function initApp() {
    console.log('- Iniciando Mini Tienda...');
    
    // Obtener el contenedor principal
    const app = document.getElementById('app');
    
    // Si el header va dentro de #app, debemos insertarlo al principio
    renderHeader(app);
    
    // Mover el header al principio si es necesario
    const header = app.querySelector('header');
    if (header && header.parentNode === app) {
        app.prepend(header);
    }
    
    // Configurar router
    setupRouter();
    
    // Configurar eventos globales
    setupGlobalEvents();
    
    console.log('- Mini Tienda inicializada correctamente');
}

// Configurar enrutador
function setupRouter() {
    // Manejar cambios en hash
    window.addEventListener('hashchange', handleRoute);
    
    // Manejar carga inicial
    window.addEventListener('load', handleRoute);
}

// Manejar ruta actual
function handleRoute() {
    const hash = window.location.hash.slice(1) || '/products';
    const content = document.getElementById('content');
    
    if (!content) return;
    
    // Limpiar contenido anterior
    content.innerHTML = '';
    
    // Actualizar navegación activa
    updateActiveNav(hash);
    
    // Renderizar contenido según ruta
    switch (hash) {
        case '/products':
            renderProductsList(content);
            currentRoute = 'products';
            break;
            
        case '/cart':
            renderCart(content);
            currentRoute = 'cart';
            break;
            
        case '/stats':
            renderStats(content);
            currentRoute = 'stats';
            break;
            
        default:
            // Redirigir a productos si ruta no existe
            window.location.hash = '#/products';
            break;
    }
    
    // Animar transición
    content.classList.add('fade-in');
    setTimeout(() => content.classList.remove('fade-in'), 500);
}

// Configurar eventos globales
function setupGlobalEvents() {
    // Manejar errores no capturados
    window.addEventListener('error', (event) => {
        console.error('Error no capturado:', event.error);
        
        const content = document.getElementById('content');
        if (content && !content.querySelector('.error-message')) {
            content.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">
                        <i class="fas fa-bug"></i>
                    </div>
                    <h3>Error en la aplicación</h3>
                    <p>Ocurrió un error inesperado. Por favor, recarga la página.</p>
                    <button class="btn btn-secondary" onclick="location.reload()">
                        <i class="fas fa-redo"></i> Recargar Página
                    </button>
                </div>
            `;
        }
    });
    
    // Manejar promesas no capturadas
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promesa no manejada:', event.reason);
    });
    
    // Verificar conexión a internet
    window.addEventListener('online', () => {
        showNetworkStatus('Conectado a internet', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNetworkStatus('Sin conexión a internet', 'error');
    });
    
    // Agregar atajo de teclado para limpiar carrito (Ctrl+Shift+L)
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'L') {
            if (window.confirm('¿Limpiar carrito? (Atajo Ctrl+Shift+L)')) {
                localStorage.removeItem('cart');
                window.dispatchEvent(new CustomEvent('cartUpdated'));
                if (currentRoute === 'cart') {
                    handleRoute();
                }
            }
            event.preventDefault();
        }
    });
}

// Mostrar estado de red
function showNetworkStatus(message, type) {
    const statusDiv = document.createElement('div');
    statusDiv.className = `network-status ${type}`;
    statusDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        padding: 10px 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideDown 0.3s ease;
    `;
    
    statusDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'wifi' : 'exclamation-triangle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(statusDiv);
    
    setTimeout(() => {
        statusDiv.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => statusDiv.remove(), 300);
    }, 3000);
}

// Agregar estilos para animaciones de estado de red
const networkStyles = document.createElement('style');
networkStyles.textContent = `
    @keyframes slideDown {
        from { top: -50px; opacity: 0; }
        to { top: 10px; opacity: 1; }
    }
    @keyframes slideUp {
        from { top: 10px; opacity: 1; }
        to { top: -50px; opacity: 0; }
    }
`;
document.head.appendChild(networkStyles);

// Función para cambiar de vista (pública para otros componentes)
window.changeView = function(view) {
    window.location.hash = `#/${view}`;
};

// Inicializar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Exportar para pruebas
if (window.__TEST__) {
    window.__APP__ = {
        initApp,
        handleRoute,
        setupRouter
    };
}