// const rootDir = require('../util/path');
// const path = require('path');
// const admin = require('./admin');

const isAuth = require('../middleware/is-auth');

const shopController = require('../controllers/shop'); 

const router = require('express').Router();

router.get('/', shopController.getIndex);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart/delete/:productID', isAuth, shopController.postCartDeleteProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/products', shopController.getProducts);

router.get('/products/:productID', shopController.getProduct);

router.get('/orders/:orderID/invoice', isAuth, shopController.getInvoice);

router.get('/checkout', shopController.getCheckout);

module.exports = router;