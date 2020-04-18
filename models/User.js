const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            productID: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
})

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => cp.productID.toString() === product._id.toString());
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productID: product._id,
            quantity: 1
        });
    }

    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save()
}

userSchema.methods.deleteFromCart = function (productID) {
    let updatedCartItems = this.cart.items.filter(item => {
        return item.productID.toString() !== productID.toString();
    })
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = {
        items: []
    };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);


//     addOrder() {
//         const db = getDB();
//         return this.getCart()
//             .then((products) => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: this._id,
//                         username: this.username
//                     }
//                 }
//                 return db.collection('orders').insertOne(order);
//             })
//             .then((result) => {
//                 console.log('Insert Order Result', result);
//                 this.cart = {
//                     items: []
//                 };
//                 return db.collection('users').updateOne({
//                     _id: this._id
//                 }, {
//                     $set: {
//                         cart: {
//                             items: []
//                         }
//                     }
//                 });
//             })
//             .then(result => {
//                 return result;
//             })
//             .catch((err) => {
//                 console.log(err);
//             });
//     }

//     getOrders() {
//         const db = getDB();
//         return db.collection('orders').find({
//                 'user._id': this._id
//             }).toArray()
//             .then((orders) => {
//                 return orders;
//             }).catch((err) => {
//                 console.log(err);
//             });
//     }

//     static findByID(userID) {
//         const db = getDB();
//         return db.collection('users').findOne({
//                 _id: new mongodb.ObjectID(userID)
//             })
//             .then((user) => {
//                 console.log('Active user', user);
//                 return user;
//             }).catch((err) => {
//                 console.log(err);
//             });
//     }
// }
// module.exports = User;