const rootDir = require('../util/path');
const path = require('path');

const Product = require('../models/Product');

const getAddProduct = (req, res, next) => {
    // console.log('In the middleware!');
    // ejs
    res.render(path.join(rootDir, 'views', 'admin', 'edit-product'), {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });

    // next(); // Alows the request to continue to the next middleware inline
};

const postAddProduct = (req, res) => {
    console.log('Request body', req.body);
    const title = req.body.title;
    const imgURL = req.body.imgURL;
    const price = req.body.price;
    const desc = req.body.desc;
    const product = new Product({
        title: title,
        price: price,
        desc: desc,
        imgURL: imgURL,
        userID: req.user
    });
    product.save()
        .then(() => {
            console.log('Product Created!')
            res.redirect('/admin/products')
        })
        .catch(err => console.log(err));

};

const getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;
    const prodID = req.params.productID;
    // console.log(editMode);
    // console.log('typeof editMode', typeof (editMode));
    if (!editMode) {
        return res.redirect('/');
    }
    try {
        const product = await Product.findById(prodID);
        if (!product) res.redirect('/');
        res.render(path.join(rootDir, 'views', 'admin', 'edit-product'), {
            product: product,
            pageTitle: 'Edit Mode',
            path: '/admin/edit-product',
            editing: editMode
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

const postEditProduct = async (req, res, next) => {
    console.log(req.body);
    const prodID = req.body.productID;
    const title = req.body.title;
    const imgURL = req.body.imgURL;
    const price = req.body.price;
    const desc = req.body.desc;
    try {
        const product = await Product.findById(prodID);
        product.title = title;
        product.price = price;
        product.imgURL = imgURL;
        product.desc = desc;
        const result = await product.save();
        console.log(result);
        console.log('Successfully!');
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const postDeleteProduct = async (req, res, next) => {
    const prodID = req.params.productID;
    try {
        // const result = await Product.findByIdAndDelete(prodID);
        const result = await Product.findOneAndDelete({
            _id: prodID
        })
        console.log('Delete result', result);
        console.log('Successfully destroy!');
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        next(err);
    }
}


const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
            // .select('title price -_id').populate({
            //     path: 'userID',
            //     select: 'name -_id'
            // });
        console.log('Products', products);
        res.render(path.join(rootDir, 'views', 'admin', 'products'), {
            products: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    postAddProduct: postAddProduct,
    getAddProduct: getAddProduct,
    getEditProduct: getEditProduct,
    postEditProduct: postEditProduct,
    postDeleteProduct: postDeleteProduct,
    getProducts: getProducts
};