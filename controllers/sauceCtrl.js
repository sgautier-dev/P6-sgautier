const Sauce = require('../models/Sauce');
const fs = require('fs');//access to file system

/**
 * Creating a new sauce with object from body request data and image file from request
 * @param req, res the HTTP request and response objects.
 * @res setting HTTP response with status and json message
 */
exports.createSauce = async (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;// cause DB will create the object id
    delete sauceObject._userId;// for security, preventing usage of another userId
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        userId: req.auth.userId,//userId from auth Token
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    try {
        await sauce.save();
        res.status(201).json({ message: 'Object saved !' })
    } catch (error) {
        res.status(400).json({ error })
    }
};

/**
 * Retrieving a sauce from DB with id from request params
 * @param req, res the HTTP request and response objects.
 * @res if error setting HTTP response with status and json message
 * @res if ok setting response with status and sauce object
 */
exports.getOneSauce = async (req, res, next) => {
    try {
        const sauce = await Sauce.findOne({ _id: req.params.id });
        res.status(200).json(sauce);
    } catch (error) {
        res.status(404).json({ error: error });
    }
};

/**
 * Modifying a sauce from DB, if file parsing multer object and creating imageUrl
 * with no file using request body object, user needs authorization
 * @param req, res the HTTP request and response objects.
 * @res setting HTTP response with status and json message
 */
exports.modifySauce = async (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;// for security, preventing usage of another userId
    try {
        const sauce = await Sauce.findOne({ _id: req.params.id });
        if (sauce.userId != req.auth.userId) {
            res.status(403).json({ message: 'Not authorized' });
        } else {
            try {
                await Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id });
                res.status(200).json({ message: 'Object modified!' });
            } catch (error) {
                res.status(401).json({ error })
            }
        }
    } catch (error) {
        res.status(400).json({ error });
    }
};

/**
 * Deleting a sauce from DB, deleting image file from disk, user needs authorization
 * @param req, res the HTTP request and response objects.
 * @res setting HTTP response with status and json message
 */
exports.deleteSauce = async (req, res, next) => {
    try {
        const sauce = await Sauce.findOne({ _id: req.params.id });
        if (sauce.userId != req.auth.userId) {
            res.status(403).json({ message: 'Not authorized' });
        } else {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, async () => {
                try {
                    await Sauce.deleteOne({ _id: req.params.id });
                    res.status(200).json({ message: 'Object deleted !' })
                } catch (error) {
                    res.status(401).json({ error })
                }
            });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

/**
 * Retrieving all sauces from DB
 * @param req, res the HTTP request and response objects.
 * @res if error setting HTTP response with status and json message
 * @res if ok setting response with status and sauce objects
 */
exports.getAllsauce = async (req, res, next) => {
    try {
        const sauces = await Sauce.find();
        res.status(200).json(sauces);
    } catch (error) {
        res.status(400).json({ error });
    }
};

/**
 * Setting like or dislike for a sauce with id from request params. Like/dislike request 
 * add one to likes/dislikes and userId to usersLiked/usersDisliked. Removing like/dislike will
 * remove userId too.
 * @param req, res the HTTP request and response objects.
 * @res setting HTTP response with status and json message
 * @res if setting like adds one more like and 
 */
exports.setLikeSauce = async (req, res, next) => {
    try {
        const sauce = await Sauce.findOne({ _id: req.params.id });

        const matchLiked = sauce.usersLiked.find(userLiked => {
            return userLiked === req.body.userId;
        });
        const matchDisliked = sauce.usersDisliked.find(userDisliked => {
            return userDisliked === req.body.userId;
        });
        let message = '';
        switch (req.body.like) {
            case 1:
                if (!matchLiked && !matchDisliked) {
                    sauce.likes++;
                    sauce.usersLiked.push(req.body.userId);
                    message = 'Like added!';
                }
                break;
            case 0:
                if (matchLiked) {
                    sauce.likes--;
                    sauce.usersLiked = sauce.usersLiked.filter(userLiked => {
                        return userLiked !== req.body.userId;
                    });
                    message = 'Like removed!';
                }
                if (matchDisliked) {
                    sauce.dislikes--;
                    sauce.usersDisliked = sauce.usersDisliked.filter(userDisliked => {
                        return userDisliked !== req.body.userId;
                    });
                    message = 'Dislike removed!';
                }
                break;
            case -1:
                if (!matchDisliked && !matchLiked) {
                    sauce.dislikes++;
                    sauce.usersDisliked.push(req.body.userId);
                    message = 'Dislike added!';
                }
                break;
            default:
                throw Error('Unvalid Like number');
        }
        try {
            await sauce.save();
            res.status(200).json({ message: message });
        } catch (error) {
            res.status(400).json({ error })
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};