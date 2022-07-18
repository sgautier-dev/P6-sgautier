const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauceCtrl');

//routes to sauce controllers
router.get('/', sauceCtrl.getAllsauce);
router.get('/:id', sauceCtrl.getOneSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);// with authorization and multer
router.put('/:id', auth, multer, sauceCtrl.modifySauce);// with authorization and multer
router.delete('/:id', auth, sauceCtrl.deleteSauce);// with authorization
router.post('/:id/like', sauceCtrl.setLikeSauce);

module.exports = router;