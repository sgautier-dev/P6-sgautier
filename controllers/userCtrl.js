const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// add middleware to handle password validation
const passwordValidator = require('password-validator');
const schema = new passwordValidator();
// Add properties to schema
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces();                          // Should not have spaces

// add middleware to handle email validation
const validator = require("email-validator");

/**
 * Creating a new user with email and password from body request data, email and pass should be valid,
 * salting and hashing the password using bcrypt
 * @param req, res the HTTP request and response objects.
 * @res setting HTTP response with status and json message
 */
exports.signup = async (req, res) => {
    try {

        if (schema.validate(req.body.password) && validator.validate(req.body.email)) {
            //generate salt against possible rainbow table attacks 
            const salt = await bcrypt.genSalt(10);
            // Hash&Salt password
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
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

        } else {
            if (!validator.validate(req.body.email)) {
                res.statusMessage = 'E-mail should be valid!';
                res.status(400).end();
            }
            if (!schema.validate(req.body.password)) {
                res.statusMessage = 'Password should be min 8 and max 100 chars, contains upper and lower cases, no spaces and 2 digits';
                res.status(400).end();
            }
        }

    } catch (error) {
        error => res.status(500).json({ error });
    }
};

/**
 * Log a user checking email and password (with bcrypt) and signing
 * a Token as response
 * @param req, res the HTTP request and response objects.
 * @res if user not found, invalid password or error 
 * setting HTTP response with status and json message
 * @res if ok sending reponse with status and json object 
 * (userId and jsonwebtoken)
 */
exports.login = async (req, res) => {
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
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            )
        });

    } catch (error) {
        error => res.status(500).json({ error });
    }

};