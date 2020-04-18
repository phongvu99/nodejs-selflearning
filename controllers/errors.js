const rootDir = require('../util/path');

const path = require('path');

const show_404 = (req, res) => {
    // ejs
    res.status(404).render(path.join(rootDir, 'views', 'ejs', '404'), {
        pageTitle: '404: Page Not Found',
        path: '/404'
    });
};

const show_500 = (req, res) => {
    // ejs
    res.status(500).render(path.join(rootDir, 'views', 'ejs', '500'), {
        pageTitle: 'BAM!',
        path: '/500',
        errorMsg: 'Something happened! We\'re working on it!'
    });
};

module.exports = {
    show_404: show_404,
    show_500: show_500
};