const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// GET /api/status - Este es para verificar estado del API
router.get('/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// GET /api/products - Este es para obtener todos los productos
router.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      order: [['name', 'ASC']]
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id - Este es para obtener producto por ID
router.get('/api/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        message: 'Producto no encontrado',
        id: req.params.id 
      });
    }
    
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products - Este es para crear nuevo producto
router.post('/api/products', async (req, res, next) => {
  try {
    const { name, price, stock, description, image_url } = req.body;
    
    // Validación básica
    if (!name || !price || stock === undefined) {
      return res.status(400).json({ 
        message: 'Nombre, precio y stock son obligatorios' 
      });
    }
    
    const newProduct = await Product.create({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description || null,
      image_url: image_url || 'https://via.placeholder.com/150'
    });
    
    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: newProduct
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - Este es para actualizar producto
router.put('/api/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        message: 'Producto no encontrado para actualizar' 
      });
    }
    
    await product.update(req.body);
    
    res.json({
      message: 'Producto actualizado exitosamente',
      product
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - Este es para eliminar producto
router.delete('/api/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        message: 'Producto no encontrado para eliminar' 
      });
    }
    
    await product.destroy();
    
    res.status(200).json({
      message: 'Producto eliminado exitosamente',
      id: req.params.id
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;