// Importing .env configurations
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const https = require('https');

// Importing the User mongoose model
const User = require('./models/User');

// const MongoDBStore = require('connect-mongodb-session')(session);

// Importing packages
const mongoose = require('mongoose');
const multer = require('multer');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const express = require('express');
const csrf = require('csurf');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Initializing express application
const app = express();

// Importing routes
const auth = require('./routes/auth')
const admin = require('./routes/admin');
const shop = require('./routes/shop');

// Importing util
const rootDir = require('./util/path');
const isAuth = require('./middleware/is-auth');

// Importing controller
const errorsController = require('./controllers/errors');
const shopController = require('./controllers/shop'); 

// ENV variables
const port = process.env.PORT;
const DB_PASSWORD = process.env.DB_PASSWORD;

// Connection URI
const uri = `mongodb+srv://phongvu99:${DB_PASSWORD}@nodejs-course-6joar.mongodb.net/shop?retryWrites=true&w=majority`;
const store = new MongoStore({
    url: uri,
    // Default value
    // collection: 'sessions'
});

// CSRF Protection
const csrfProtection = csrf();

// Multer fileStorage configurations
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        console.log('Original filename', file.originalname);
        cb(null, new Date().toISOString().replace(/[-T:\.Z]/g, "") + '-' + file.originalname);
    }
});

// Multer fileFilter configurations
const fileFilter = (req, file, cb) => {
    const type = file.mimetype;
    if (type === 'image/png' || type === 'image/jpg' || type === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({storage: fileStorage, fileFilter: fileFilter});

// const store = new MongoDBStore({
//     uri: uri,
//     collection: 'sessions'
// });

app.set('view engine', 'ejs');
app.set('views', 'views');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
// const privateKey = fs.readFileSync('./server.key');
// const certificate = fs.readFileSync('./server.crt');

// Deployment optimization
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream}))

app.use(upload.single('img'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.urlencoded({
    extended: true
}));


app.use(express.static(path.join(rootDir, 'public')));
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use(session({
    secret: 'somelongstring',
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(flash());

app.use((req, res, next) => {
    console.log('Is logged in',req.session.isLoggedIn);
    res.locals.isLoggedIn = req.session.isLoggedIn;
    next();
})

app.use((req, res, next) => {
    console.log('Will this even run??');
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            err.status = 500;
            next(err);
        });
});

app.post('/create-order', isAuth, shopController.postOrder);

app.use(csrfProtection);
app.use((req, res, next) => {
    console.log('CSRF Token Setup');
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin', admin);
app.use(shop);
app.use(auth);

app.get('/500', errorsController.show_500);

app.use(errorsController.show_404);

// Error handler
app.use((err, req, res, next) => {
    console.log(err);
    let msg;
    if (err.message) {
        msg = err.message;
    } else {
        msg = undefined;
    }
    console.log('Error status code', err.status);
    res.status(500).render(path.join(rootDir, 'views', 'ejs', '500'), {
        pageTitle: 'BAM!',
        path: '/500',
        errorMsg: msg
    });
})

mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then((result) => {
        // console.log('Mongoose connect', result);
        // https.createServer({ key: privateKey, cert: certificate }, app).listen(port, () => {
        //     console.log('App started on port:', port);
        // });
        app.listen(process.env.PORT || 4200, () => {
            console.log('App started on port:', port);
        })
    }).catch((err) => {
        console.log(err);
    });