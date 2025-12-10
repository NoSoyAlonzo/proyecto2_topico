const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// aqui es para probar la conexión
sequelize.authenticate()
  .then(() => console.log(' Conexión a base de datos establecida'))
  .catch(err => console.error(' Error de conexión a BD:', err));

module.exports = sequelize;