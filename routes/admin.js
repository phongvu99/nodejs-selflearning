const router = require('express').Router();

const { body } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', 
[
    body('title').isString().isLength({min: 3}).trim(),
    body('price').isFloat().trim(),
    body('desc').isLength({min: 5, max: 400}).trim()
]
, isAuth, adminController.postAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productID', isAuth, adminController.getEditProduct);

router.post('/edit-product', 
[
    body('title').isString().isLength({min: 3}).trim(),
    body('price').isFloat().trim(),
    body('desc').isLength({min: 5, max: 400}).trim()
]
, isAuth, adminController.postEditProduct); 

router.delete('/product/:productID', isAuth, adminController.deleteProduct);

module.exports = router;