const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator');


//@route   POST/auth
//@desc Authenticate user and get token
//@access public
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route   POST/auth
//@desc Authenticate user and get token
//@access public
router.post('/', [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password should be entered').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {
            email,
            password
        } = req.body;

        try {
            let user = await User.findOne({
                email
            });
            if (!user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'Invalid credentials'
                    }]
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    errors: [{
                        msg: 'Invalid credentials'
                    }]
                });
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), {
                expiresIn: 360000
            }, (err, token) => {
                if (err) {
                    throw err;
                } else {
                    res.json({
                        token
                    });
                }
            })

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Server error");
        }



    });
module.exports = router;