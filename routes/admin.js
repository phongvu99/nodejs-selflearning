const router = require('express').Router();

// const path = require('path');
// const rootDir = require('../util/path');

const adminController = require('../controllers/admin');

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

router.get('/edit-product/:productID', adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct); 

router.post('/delete/product/:productID', adminController.postDeleteProduct);

module.exports = router;