const rootDir = require('../util/path');
const path = require('path');

const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const {
    validationResult
} = require('express-validator');

const Product = require('../models/Product');

const getAddProduct = (req, res, next) => {
    // console.log('In the middleware!');
    // ejs
    res.render(path.join(rootDir, 'views', 'admin', 'edit-product'), {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMsg: undefined,
        validationErrors: []
    });

    // next(); // Alows the request to continue to the next middleware inline
};

const postAddProduct = (req, res, next) => {
    console.log('Request body', req.body);
    console.log('Request file', req.file)
    const title = req.body.title;
    const img = req.file;
    const price = req.body.price;
    const desc = req.body.desc;

    if (!img) {
        return res.status(422).render(path.join(rootDir, 'views', 'admin', 'edit-product'), {
            product: {
                title: title,
                price: price,
                desc: desc
            },
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMsg: 'Not an image file (JPG/PNG)',
            validationErrors: []
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render(path.join(rootDir, 'views', 'admin', 'edit-product'), {
            product: {
                title: title,
                price: price,
                desc: desc
            },
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            errorMsg: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    const product = new Product({
        title: title,
        price: price,
        desc: desc,
        imgURL: img.path,
        userID: req.user
    });
    product.save()
        .then(() => {
            console.log('Product Created!')
            res.redirect('/admin/products')
        })
        .catch(err => {
            console.log(err);
            // res.status(500).render(path.join(rootDir, 'views', 'admin', 'edit-product'), {
            //     product: {
            //         title: title,
            //         imgURL: imgURL,
            //         price: price,
            //         desc: desc
            //     },
            //     pageTitle: 'Add Product',
            //     path: '/admin/add-product',
            //     editing: false,
            //     hasError: true,
            //     errorMsg: 'Database operation failed!',
            //     validationErrors: []
            // });
            // res.redirect('/500');
            err.status = 500;
            next(err);
        });

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
        const product = await Product.findOne({
            _id: prodID,
            userID: req.user._id
        });
        if (!product) res.redirect('/');
        res.render(path.join(rootDir, 'views', 'admin', 'edit-product'), {
            product: product,
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            hasError: false,
            errorMsg: undefined,
            validationErrors: []
        });
    } catch (err) {
        console.log(err);
        err.status = 500;
        next(err);
    }
};

const postEditProduct = async (req, res, next) => {
    console.log('Request body', req.body);
    const prodID = req.body.productID;
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const desc = req.body.desc;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render(path.join(rootDir, 'views', 'admin', 'edit-product'), {
            product: {
                title: title,
                price: price,
                desc: desc,
                _id: prodID
            },
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            errorMsg: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    try {
        const product = await Product.findOne({
            _id: prodID,
            userID: req.user._id
        });
        if (!product) {
            return res.redirect('/');
        }
        product.title = title;
        product.price = price;
        if (image) {
            fileHelper.deleteFile(product.imgURL);
            product.imgURL = image.path;
        }
        product.desc = desc;
        const result = await product.save();
        console.log(result);
        console.log('Successfully!');
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        err.status = 500;
        next(err);
    }
}

const deleteProduct = async (req, res, next) => {
    const prodID = req.params.productID;
    try {
        // const result = await Product.findByIdAndDelete(prodID);
        const product = await Product.findById(prodID);
        if (!product) {
            return next(new Error('No product with that ID!'));
        }
        fileHelper.deleteFile(product.imgURL);
        const result = await Product.deleteOne({
            _id: prodID,
            userID: req.user._id
        })
        console.log('Delete result', result);
        console.log('Successfully destroy!');
        res.status(200).json({
            message: 'Deleted successfully'
        });
    } catch (err) {
        console.log('Failed deleting', err);
        res.status(500).json({
            message: 'Failed to delete'
        });
    }
}


const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({
            userID: req.user._id
        });
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
        err.status = 500;
        next(err);
    }
}

module.exports = {
    postAddProduct: postAddProduct,
    getAddProduct: getAddProduct,
    getEditProduct: getEditProduct,
    postEditProduct: postEditProduct,
    deleteProduct: deleteProduct,
    getProducts: getProducts
};