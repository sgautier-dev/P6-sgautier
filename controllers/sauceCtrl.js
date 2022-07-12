const Sauce = require('../models/Sauce');
const fs = require('fs');//access to file system

exports.createSauce = async (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;// cause DB will create the object id
    delete sauceObject._userId;// for security, preventing usage of another userId
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    try {
        await sauce.save();
        res.status(201).json({ message: 'Object saved !' })
    } catch (error) {
        res.status(400).json({ error })
    }
};

exports.getOneSauce = async (req, res, next) => {
    try {
        const sauce = await Sauce.findOne({ _id: req.params.id });
        res.status(200).json(sauce);
    } catch (error) {
        res.status(404).json({ error: error });
    }
};

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

exports.getAllsauce = async (req, res, next) => {
    try {
        const sauces = await Sauce.find();
        res.status(200).json(sauces);
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

exports.setLikeSauce = async (req, res, next) => {
    try {
        const sauce = await Sauce.findOne({ _id: req.params.id });
        console.log(sauce);
        if (sauce.userId != req.auth.userId || req.body.userId != req.auth.userId) {
            res.status(403).json({ message: 'Not authorized' });
        } else {
            const matchLiked = sauce.usersLiked.find(userLiked => {
                return userLiked === req.body.userId;
            });
            console.log(matchLiked);
            const matchDisliked = sauce.usersDisliked.find(userDisliked => {
                return userDisliked === req.body.userId;
            });
            console.log(matchDisliked);
            console.log(req.body.like);
            switch (req.body.like) {
                case 1:
                    if (!matchLiked) {
                        sauce.likes++;
                        sauce.usersLiked.push(req.body.userId);
                        console.log(sauce.likes);
                        console.log(sauce.usersLiked);
                        const message = 'Like added!';
                    }
                    break;
                case 0:
                    if (matchLiked) {
                        sauce.likes--;
                        sauce.usersLiked = sauce.usersLiked.filter(userLiked => {
                            return userLiked !== req.body.userId;
                        });
                        const message = 'Like removed!';
                    }
                    if (matchDisliked) {
                        sauce.dislikes--;
                        sauce.usersDisliked = sauce.usersDisliked.filter(userDisliked => {
                            return userDisliked !== req.body.userId;
                        });
                        const message = 'Dislike removed!';
                    }
                    break;
                case -1:
                    if (!matchDisliked) {
                        sauce.dislikes++;
                        sauce.usersDisliked.push(req.body.userId);
                        console.log(sauce.dislikes);
                        console.log(sauce.usersDisliked);
                        const message = 'Dislike added!';
                    }
                    break;
                default:
                    throw Error('Unvalid Like number');
            }
            try {
                console.log(sauce);
                //await Sauce.updateOne({ _id: req.params.id }, { ...sauce, _id: req.params.id });
                await sauce.save();
                res.status(200).json({ message: message });
            } catch (error) {
                res.status(401).json({ error })
            }
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};