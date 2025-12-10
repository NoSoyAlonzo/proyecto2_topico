const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./models/db');
const productRoutes = require('./routes/routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // En producción, especificar dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/', productRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Mini Tienda',
    endpoints: {
      status: 'GET /api/status',
      products: 'GET /api/products',
      productById: 'GET /api/products/:id',
      createProduct: 'POST /api/products',
      updateProduct: 'PUT /api/products/:id',
      deleteProduct: 'DELETE /api/products/:id'
    }
  });
});

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ 
    message: `Ruta no encontrada: ${req.method} ${req.url}`,
    suggestion: 'Verifique la URL o consulte la documentación en /'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(' Error en servidor:', err);
  
  // Si es error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      message: 'Error de validación',
      errors
    });
  }
  
  // Si es error de duplicado
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: 'Conflicto de datos únicos',
      field: err.errors[0].path
    });
  }
  
  // Error general
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Función para inicializar datos de prueba
async function initializeSampleData() {
  try {
    const count = await sequelize.models.Product.count();
    
    if (count === 0) {
      console.log('- Insertando datos de muestra...');
      
      const sampleProducts = [
        {
          name: 'Laptop Gaming',
          price: 1299.99,
          stock: 15,
          description: 'Laptop para juegos de alta gama',
          image_url: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Laptop'
        },
        {
          name: 'Mouse Inalámbrico',
          price: 49.99,
          stock: 50,
          description: 'Mouse ergonómico inalámbrico',
          image_url: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Mouse'
        },
        {
          name: 'Teclado Mecánico',
          price: 89.99,
          stock: 30,
          description: 'Teclado mecánico con RGB',
          image_url: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=Teclado'
        },
        {
          name: 'Monitor 24"',
          price: 199.99,
          stock: 25,
          description: 'Monitor Full HD 144Hz',
          image_url: 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=Monitor'
        },
        {
          name: 'Auriculares Bluetooth',
          price: 79.99,
          stock: 40,
          description: 'Auriculares con cancelación de ruido',
          image_url: 'https://via.placeholder.com/150/FFEAA7/FFFFFF?text=Auriculares'
        }
      ];
      
      await sequelize.models.Product.bulkCreate(sampleProducts);
      console.log(' Datos de muestra insertados');
    }
  } catch (error) {
    console.error(' Error al insertar datos de muestra:', error);
  }
}

// Iniciar servidor
async function startServer() {
  try {
    // Sincronizar base de datos (no force para no borrar datos)
    await sequelize.sync({ alter: true });
    console.log(' Base de datos sincronizada');
    
    // Insertar datos de muestra
    await initializeSampleData();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`- Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`- Documentación API: http://localhost:${PORT}/`);
      console.log(`- Estado API: http://localhost:${PORT}/api/status`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejar cierre gracioso
process.on('SIGINT', async () => {
  console.log('\n Cerrando servidor...');
  await sequelize.close();
  console.log(' Conexión a BD cerrada');
  process.exit(0);
});

startServer();