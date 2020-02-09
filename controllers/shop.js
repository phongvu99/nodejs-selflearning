const rootDir = require('../util/path');
const path = require('path');

const Product = require('../models/Product');
const Order = require('../models/Order');

const getProducts = async (req, res, next) => {
    // ejs
    try {
        const products = await Product.find();
        // console.log('Products', products);
        res.render(path.join(rootDir, 'views', 'shop', 'product-list'), {
            products: products,
            pageTitle: 'All Products',
            path: '/products'
        });
    } catch (err) {
        console.log(err)
        next(err);
    }
}

const getProduct = async (req, res, next) => {
    const prodID = req.params.productID;
    try {
        const product = await Product.findById(prodID);
        res.render(path.join(rootDir, 'views', 'shop', 'product-details'), {
            product: product,
            path: '/products',
            pageTitle: product.title
        })
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const getIndex = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.render(path.join(rootDir, 'views', 'shop', 'index'), {
            products: products,
            pageTitle: 'Shop',
            path: '/'
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const getCart = async (req, res, next) => {
    // console.log(Object.keys(req.user.__proto__));
    try {
        const user = await req.user.populate({
            path: 'cart.items.productID'
        }).execPopulate();
        // console.log(Object.keys(cart.__proto__));
        console.log('User Cart Items', user.cart.items);
        let products = user.cart.items;
        res.render(path.join(rootDir, 'views', 'shop', 'cart'), {
            path: '/cart',
            pageTitle: 'Cart',
            products: products
        })
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const postCart = (req, res) => {
    const prodID = req.body.productID;
    Product.findById(prodID)
        .then((product) => {
            return req.user.addToCart(product)
        })
        .then(result => {
            console.log(result)
            res.redirect('/cart');
        })
        .catch((err) => {
            console.log(err);
        });
}

const postCartDeleteProduct = async (req, res, next) => {
    const prodID = req.params.productID;
    try {
        const result = await req.user.deleteFromCart(prodID)
        console.log('Delete result', result);
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const postOrder = async (req, res, next) => {
    try {
        const user = await req.user.populate({
            path: 'cart.items.productID'
        }).execPopulate();
        const products = user.cart.items.map(i => {
            return {
                quantity: i.quantity,
                product: i.productID._doc
            };
        });
        const order = new Order({
            items: products,
            user: {
                name: req.user.name,
                userID: req.user
            }
        });
        const result = await order.save();
        console.log('Order create result', result);
        const clearResult = await req.user.clearCart();
        console.log('Clear cart result', clearResult);
        res.redirect('/orders');
    } catch (err) {
        console.log(err);
        next(err);
    }

}

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            'user.userID': req.user
        });
        console.log('Your orders', orders);
        res.render(path.join(rootDir, 'views', 'shop', 'orders'), {
            path: '/orders',
            pageTitle: 'Orders',
            orders: orders
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const getCheckout = (req, res) => {
    res.render(path.join(rootDir, 'views', 'shop', 'checkout'), {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
}

module.exports = {
    getProducts: getProducts,
    getProduct: getProduct,
    getIndex: getIndex,
    getCart: getCart,
    postCart: postCart,
    postCartDeleteProduct: postCartDeleteProduct,
    postOrder: postOrder,
    getOrders: getOrders,
    getCheckout: getCheckout
};