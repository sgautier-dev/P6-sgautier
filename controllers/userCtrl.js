const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    try {
        //generate salt against possible rainbow table attacks 
        const salt = await bcrypt.genSalt(10);
        // Hash&Salt password
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        console.log(hashedPassword);
        try {
            const user = new User({
                email: req.body.email,
                password: hashedPassword
            });
            await user.save();
            res.status(201).json({ message: 'User created !' })
        } catch (error) {
            res.status(400).json({ error })
        }

    } catch (error) {
        error => res.status(500).json({ error });
    }
};

exports.login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: 'Incorrect login/password' });
        }
        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Incorrect login/password' });
        }
        res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
            )
        });

    } catch (error) {
        error => res.status(500).json({ error });
    }

};