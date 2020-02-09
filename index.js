require('dotenv').config();

const User = require('./models/User');

const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const rootDir = require('./util/path');
const mongoose = require('mongoose');

const admin = require('./routes/admin');
const shop = require('./routes/shop');

const errorsController = require('./controllers/errors');

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(rootDir, 'public')));

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    User.findById('5e3fd0f2d4d7310fec14eb7c')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', admin);
app.use(shop);

app.use(errorsController.show_404);

const port = process.env.PORT;
const DB_PASSWORD = process.env.DB_PASSWORD;
// Connection URI
const uri = `mongodb+srv://phongvu99:${DB_PASSWORD}@nodejs-course-6joar.mongodb.net/shop?retryWrites=true&w=majority`;

mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(async (result) => {
        // console.log('Mongoose connect', result);
        const user = await User.findOne();
        if (!user) {
            let user = new User({
                name: 'Phong',
                email: 'phongvu99@outlook.com',
                cart: {
                    items: []
                }
            });
            await user.save();
        }
        app.listen(process.env.PORT || port, () => {
            console.log('App started on port:', port);
        })
    }).catch((err) => {
        console.log(err);
    });