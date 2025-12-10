proyecto topico web  
Alonso donnet , Carlos eduardo M

Guia paso a paso para el proyecto :

desciprcion general del proyecto 
Aplicación web tipo "Mini Tienda" que permite a una pequeña tienda local mostrar sus productos digitalmente. Los usuarios pueden visualizar productos, ver detalles, agregar artículos a un carrito temporal y ver estadísticas simples. La aplicación sigue principios modernos de separación de componentes y arquitectura de microfrontends.

1. Configuración del Backend
Requisitos Previos
Node.js (v14 o superior)

MySQL Server instalado y ejecutándose

NPM o Yarn

Pasos de Instalación
Navegar a la carpeta backend:

cd backend 

2.-Instalar dependencias

 npm install

 3.- Crear archivo .env en la carpeta backend/ con el siguiente contenido:
 ejemplo :
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=mini_tienda
DB_DIALECT=mysql
PORT=3000

4.-Configurar la base de datos:

CREATE DATABASE mini_tienda;

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS mini_tienda;
USE mini_tienda;

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500) DEFAULT 'https://via.placeholder.com/150',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_price (price),
    INDEX idx_stock (stock)
);

-- Insertar datos de ejemplo
INSERT INTO products (name, price, stock, description, image_url) VALUES
('Laptop Gaming', 1299.99, 15, 'Laptop para juegos de alta gama con RTX 3070', 'https://miamimicroexport.com/wp-content/uploads/2024/05/laptop-msi-cybort3.jpg'),
  ('Mouse Inalámbrico', 49.99, 50, 'Mouse ergonómico inalámbrico 16000 DPI', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop&auto=format'),
  ('Teclado Mecánico', 89.99, 30, 'Teclado mecánico con RGB y switches azules', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=400&fit=crop&auto=format'),
  ('Monitor 24"', 199.99, 25, 'Monitor Full HD 144Hz 1ms', 'https://resources.sanborns.com.mx/medios-plazavip/t1/1749811078file1jpg?scale=50&qlty=75'),
  ('Auriculares Bluetooth', 79.99, 40, 'Auriculares con cancelación de ruido activa', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=400&fit=crop&auto=format'),
  ('Smartphone Android', 499.99, 20, 'Smartphone con cámara 108MP y 8GB RAM', 'https://www.krouli.com/wp-content/uploads/2025/01/GA05839-GB-1.png'),
  ('Tablet 10"', 299.99, 18, 'Tablet con stylus y 128GB almacenamiento', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop&auto=format'),
  ('Smartwatch', 199.99, 35, 'Smartwatch con monitor cardiaco y GPS', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop&auto=format'),
  ('Cámara DSLR', 899.99, 10, 'Cámara profesional con lente 18-55mm', 'https://tecnoplanet.mx/media/catalog/product/cache/8cd5a230797067cb5ac02bf70ef67749/0/1/013803300550_2_1.jpg'),
  ('Altavoz Bluetooth', 129.99, 45, 'Altavoz portátil resistente al agua', 'https://www.shutterstock.com/image-photo/bluetooth-speaker-wireless-portable-surround-600nw-2534971805.jpg');

5.-Iniciar el servidor en modo desarrollo:
npm run dev

2.- Configuración del Frontend

cd frontend

Servir la aplicación:

Opción 1: Usar extensión de VS Code "Live Server"


Microfrontends
Los microfrontends están implementados como módulos JavaScript independientes en la carpeta frontend/components/:

header.js - Navegación principal

Renderiza el menú de navegación

Maneja cambios de ruta mediante hash (#)

productsList.js - Lista de productos

Consume la API REST para obtener productos

Muestra productos con opción de agregar al carrito

cart y Stats.js - Carrito y estadísticas

Gestiona el carrito de compras

Muestra estadísticas simples

Async/Await

Backend:

router.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

Front end :

async function loadProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    showErrorMessage('Error al cargar productos');
  }
}

Manejo de Errores
Backend:

Middleware de errores centralizado en index.js

Try/catch en todas las rutas async

Respuestas JSON con códigos HTTP apropiados

Frontend:

Try/catch en todas las llamadas fetch

Mensajes de error amigables en la interfaz

Validación de datos del localStorage

DOM y BOM

DOM:

Creación dinámica de elementos (document.createElement)

Manipulación de contenido (innerHTML, textContent)

Event listeners para interactividad

BOM:

window.location.hash para enrutamiento

window.localStorage para persistencia

window.addEventListener('hashchange', router)

Enrutamiento del Lado del Cliente
Implementado en main.js usando el hash de la URL:

function router() {
  const hash = window.location.hash;
  const content = document.createElement('div');
  
  switch(hash) {
    case '#/products':
      renderProductsList(content);
      break;
    case '#/cart':
      renderCart(content);
      break;
    case '#/stats':
      renderStats(content);
      break;
    default:
      window.location.hash = '#/products';
  }
}

Almacenamiento del Lado del Cliente
LocalStorage: Para persistir el carrito de compras

Implementación en cart y Stats.js:

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

🔧 Endpoints de la API
Método	Endpoint	Descripción
GET	/api/status	Verificar estado de la API
GET	/api/products	Obtener todos los productos
GET	/api/products/:id	Obtener un producto específico
POST	/api/products	Crear nuevo producto
PUT	/api/products/:id	Actualizar producto
DELETE	/api/products/:id	Eliminar producto
