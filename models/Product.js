const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    imgURL: {
        type: String,
        required: true
    }, 
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }  
})

module.exports = mongoose.model('Product', productSchema);

// const mongodb = require('mongodb');
// const getDB = require('../util/database').getDB;

// class Product {
//     constructor(title, price, imgURL, desc, id, userID) {
//         this.title = title;
//         this.price = price;
//         this.imgURL = imgURL;
//         this.desc = desc;
//         this._id = id ? new mongodb.ObjectID(id) : null;
//         this.userID = userID;
//     }

//     save() {
//         const db = getDB();
//         let dbOP;
//         if (this._id) {
//             // Update the product
//             dbOP = db.collection('products').updateOne({
//                 _id: this._id
//             }, {
//                 $set: this
//             });
//         } else {
//             dbOP = db.collection('products').insertOne(this);
//         }
//         return dbOP
//             .then((result) => {
//                 console.log(result);
//             }).catch((err) => {
//                 console.log(err);
//             });;
//     }

//     static getProducts() {
//         const db = getDB();
//         return db.collection('products').find().toArray()
//             .then((products) => {
//                 console.log(products);
//                 return products;
//             })
//             .catch((err) => {
//                 console.log(err);
//             });
//     }

//     static findByID(prodID) {
//         const db = getDB();
//         return db.collection('products').find({
//                 _id: new mongodb.ObjectID(prodID)
//             })
//             .next()
//             .then((product) => {
//                 console.log(product);
//                 return product;
//             }).catch((err) => {
//                 console.log(err);
//             });
//     }

//     static deleteByID(prodID) {
//         const db = getDB();
//         return db.collection('products').deleteOne({
//                 _id: new mongodb.ObjectID(prodID)
//             })
//             .then((result) => {
//                 console.log(result);
//             }).catch((err) => {
//                 console.log(err);
//             });
//     }
// }

// module.exports = Product;