const rootDir = require('../util/path');
const path = require('path');
const fs = require('fs');

const PDFDocument = require('pdfkit');

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const STRIPE_KEY = process.env.STRIPE_KEY;
const stripe = require('stripe')(STRIPE_KEY);

const Product = require('../models/Product');
const Order = require('../models/Order');

const PER_PAGE = 2;

const getProducts = async (req, res, next) => {
    // ejs
    const PAGE = parseInt(req.query.page) || 1;
    let totalItems;
    try {
        totalItems = await Product.estimatedDocumentCount();
        console.log('Total items', totalItems);
        const products = await Product.find().skip((PAGE - 1) * PER_PAGE).limit(PER_PAGE);
        // console.log('Products', products);
        res.render(path.join(rootDir, 'views', 'shop', 'product-list'), {
            products: products,
            pageTitle: 'All Products',
            path: '/products',
            currentPage: PAGE,
            hasNextPage: PER_PAGE * PAGE < totalItems,
            hasPreviousPage: PAGE > 1,
            nextPage: PAGE + 1,
            previousPage: PAGE - 1,
            lastPage: Math.ceil(totalItems / PER_PAGE)
        });
    } catch (err) {
        console.log(err)
        err.status = 500;
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
        err.status = 500;
        next(err);
    }
}

const getIndex = async (req, res, next) => {
    const PAGE = parseInt(req.query.page) || 1;
    let totalItems;
    try {
        totalItems = await Product.estimatedDocumentCount();
        console.log('Total items', totalItems);
        const products = await Product.find().skip((PAGE - 1) * PER_PAGE).limit(PER_PAGE);
        res.render(path.join(rootDir, 'views', 'shop', 'index'), {
            products: products,
            pageTitle: 'Shop',
            path: '/',
            currentPage: PAGE,
            hasNextPage: PER_PAGE * PAGE < totalItems,
            hasPreviousPage: PAGE > 1,
            nextPage: PAGE + 1,
            previousPage: PAGE - 1,
            lastPage: Math.ceil(totalItems / PER_PAGE)
        });
    } catch (err) {
        console.log(err);
        err.status = 500;
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
        err.status = 500;
        next(err);
    }
}

const postCart = async (req, res, next) => {
    const prodID = req.body.productID;
    try {
        const product = await Product.findById(prodID);
        const result = await req.user.addToCart(product);
        console.log('Add to cart result', result);
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
        err.status = 500;
        next(err);
    }
}

const postCartDeleteProduct = async (req, res, next) => {
    const prodID = req.params.productID;
    try {
        const result = await req.user.deleteFromCart(prodID)
        console.log('Delete result', result);
        res.redirect('/cart');
    } catch (err) {
        console.log(err);
        err.status = 500;
        next(err);
    }
}

const postOrder = async (req, res, next) => {
    try {
        const user = await req.user.populate({
            path: 'cart.items.productID'
        }).execPopulate();
        let totalSum = 0;
        for (let p of user.cart.items) {
            totalSum += p.quantity * p.productID.price;
        }
        const products = user.cart.items.map(i => {
            return {
                quantity: i.quantity,
                product: i.productID._doc
            };
        });
        const line_items = products.map(i => {
            return {
                name: i.product.title,
                description: i.product.desc,
                images: ['https://picsum.photos/200'],
                amount: i.product.price * 100,
                currency: 'usd',
                quantity: i.quantity
            };
        });
        const order = new Order({
            items: products,
            user: {
                name: req.user.name,
                email: req.user.email,
                userID: req.user._id
            }
        });
        const result = await order.save();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            success_url: 'http://localhost:3000/orders',
            cancel_url: 'http://localhost:3000/checkout',
            metadata: {
                order_id: result._id.toString(),
                user_id: result.user.userID.toString()
            }
        });
        console.log('Order create result', result);
        const clearResult = await req.user.clearCart();
        console.log('Clear cart result', clearResult);
        res.status(200).json({
            session_id: session.id
        });
    } catch (err) {
        console.log(err);
        err.status = 500;
        next(err);
    }

}

const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({
            'user.userID': req.user._id
        });
        console.log('Your orders', orders);
        res.render(path.join(rootDir, 'views', 'shop', 'orders'), {
            path: '/orders',
            pageTitle: 'Orders',
            orders: orders
        });
    } catch (err) {
        console.log(err);
        err.status = 500;
        next(err);
    }
}

const getCheckout = async (req, res) => {
    try {
        const user = await req.user.populate({
            path: 'cart.items.productID'
        }).execPopulate();
        const products = user.cart.items;
        let total = 0;
        for (let p of products) {
            total += p.quantity * p.productID.price;
        }
        console.log(total);
        res.render(path.join(rootDir, 'views', 'shop', 'checkout'), {
            path: '/checkout',
            pageTitle: 'Checkout',
            products: products,
            total: total
        })
    } catch (err) {
        console.log(err);
        err.status = 500;
        next(err);
    }
}

const getInvoice = async (req, res, next) => {
    const orderID = req.params.orderID;
    const invoiceFile = 'invoice-' + orderID + '.pdf';
    const invoicePath = path.join(rootDir, 'data', 'invoices', invoiceFile);
    try {
        const order = await (await Order.findById(orderID));
        if (!order) {
            return next(new Error('No order with that ID!'));
        }
        if (order.user.userID.toString() !== req.user._id.toString()) {
            return next(new Error('Unathorized!'));
        }
        // fs.readFile(invoicePath), (err, data) => {
        //     if (err) {
        //         return next(err);
        //     }
        //     res.setHeader('Content-Type', 'application/pdf');
        //     res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceFile + '"');
        //     res.send(data);
        // })
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoiceFile}"`);
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(invoicePath));
        doc.pipe(res);

        doc.fontSize(26).text('Invoice', {
            underline: true
        });
        doc.fontSize(20).text('-----------------------------------');
        let totalPrice = 0;
        for (let prod of order.items) {
            doc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
            totalPrice += prod.quantity * prod.product.price;
        }
        doc.text('-----------------------------------');
        doc.fontSize(20).text(`Total price: $${totalPrice}`);
        doc.end();
        // const file = fs.createReadStream(invoicePath);

    } catch (err) {
        console.log(err);
        next(err);
    }
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
    getInvoice: getInvoice,
    getCheckout: getCheckout
};