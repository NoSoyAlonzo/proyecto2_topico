const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',  // ← Cambia esto
  database: 'mini_tienda'
});

connection.connect((err) => {
  if (err) {
    console.error('- Error:', err.message);
    console.log('\n- Posibles soluciones:');
    console.log('1. ¿MySQL está corriendo? (services.msc)');
    console.log('2. ¿La contraseña es correcta?');
    console.log('3. Prueba en MySQL Workbench primero');
    console.log('4. ¿El usuario root tiene acceso?');
  } else {
    console.log('- ¡Conectado a MySQL exitosamente!');
    connection.end();
  }
});