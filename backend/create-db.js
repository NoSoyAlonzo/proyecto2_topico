const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
});

console.log('🔧 Configurando base de datos...');

connection.connect((err) => {
  if (err) {
    console.error('- Error conectando a MySQL:', err.message);
    console.log('\n- Posibles soluciones:');
    console.log('1. ¿MySQL está corriendo? (services.msc)');
    console.log('2. ¿Contraseña correcta? La usas en MySQL Workbench');
    console.log('3. Prueba con contraseña vacía: password: ""');
    return;
  }
  
  console.log('-------- Conectado a MySQL');
  
  // 1. Crear base de datos
  connection.query('CREATE DATABASE IF NOT EXISTS mini_tienda', (err, result) => {
    if (err) {
      console.error('- Error creando BD:', err.message);
      connection.end();
      return;
    }
    console.log('------ Base de datos "mini_tienda" creada/existe');
    
    // 2. Usar la base de datos
    connection.query('USE mini_tienda', (err, result) => {
      if (err) {
        console.error('❌ Error usando BD:', err.message);
        connection.end();
        return;
      }
      console.log('----- Usando base de datos "mini_tienda"');
      
      // 3. Crear tabla products
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS products (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          stock INT NOT NULL DEFAULT 0,
          description TEXT,
          image_url VARCHAR(500) DEFAULT 'https://via.placeholder.com/150',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      connection.query(createTableSQL, (err, result) => {
        if (err) {
          console.error('- Error creando tabla:', err.message);
          connection.end();
          return;
        }
        console.log('- Tabla "products" creada/existe');
        
        // 4. Verificar si ya hay datos
        connection.query('SELECT COUNT(*) as count FROM products', (err, results) => {
          if (err) {
            console.error('❌ Error contando productos:', err.message);
            connection.end();
            return;
          }
          
          const count = results[0].count;
          
          if (count === 0) {
            // 5. Insertar datos de ejemplo solo si está vacía
            const insertDataSQL = `
              INSERT INTO products (name, price, stock, description, image_url) VALUES
              ('Laptop Gaming', 1299.99, 15, 'Laptop para juegos de alta gama', 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Laptop'),
              ('Mouse Inalámbrico', 49.99, 50, 'Mouse ergonómico inalámbrico', 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Mouse'),
              ('Teclado Mecánico', 89.99, 30, 'Teclado mecánico con RGB', 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=Teclado'),
              ('Monitor 24"', 199.99, 25, 'Monitor Full HD 144Hz', 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=Monitor'),
              ('Auriculares Bluetooth', 79.99, 40, 'Auriculares con cancelación de ruido', 'https://via.placeholder.com/150/FFEAA7/FFFFFF?text=Auriculares')
            `;
            
            connection.query(insertDataSQL, (err, result) => {
              if (err) {
                console.error('- Error insertando datos:', err.message);
              } else {
                console.log(`- ${result.affectedRows} productos insertados`);
              }
              finish();
            });
          } else {
            console.log(`- Ya existen ${count} productos en la base de datos`);
            finish();
          }
        });
      });
    });
  });
  
  function finish() {
    console.log('\n- ¡Base de datos configurada completamente!');
    console.log('\n- Ahora ejecuta: npm run dev');
    console.log('- Luego abre: http://localhost:3000/api/products');
    connection.end();
  }
});