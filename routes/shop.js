// const rootDir = require('../util/path');
// const path = require('path');
// const admin = require('./admin');

const shopController = require('../controllers/shop'); 

const router = require('express').Router();

router.get('/', shopController.getIndex);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/cart/delete/:productID', shopController.postCartDeleteProduct);

router.post('/create-order', shopController.postOrder);

router.get('/orders', shopController.getOrders);

router.get('/products', shopController.getProducts);

router.get('/products/:productID', shopController.getProduct);

// router.get('/checkout', shopController.getCheckout);

module.exports = router;