const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    items: [{
        product: {
            type: Object,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    user: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        userID: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    }
})

module.exports = mongoose.model('Order', orderSchema);