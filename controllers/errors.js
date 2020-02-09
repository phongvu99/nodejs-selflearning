const rootDir = require('../util/path');

const path = require('path');

const show_404 = (req, res) => {
    // ejs
    res.status(404).render(path.join(rootDir, 'views', 'ejs', '404'), {
        pageTitle: '404: Page Not Found',
        path: ''
    });
};

module.exports = {
    show_404: show_404
};