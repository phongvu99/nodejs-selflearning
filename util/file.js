const fs = require('fs');

const deleteFile = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
            console.log(err);
            throw (err);
        }
    });
}

module.exports = {
    deleteFile: deleteFile
}