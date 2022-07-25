const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

//storing image on disk
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');//replacing white spaces with underscores
    const extension = MIME_TYPES[file.mimetype];//retrieving file extension
    callback(null, name + Date.now() + '.' + extension);//unique file name to store on disk
  }
});

module.exports = multer({storage: storage}).single('image');//storing an image file