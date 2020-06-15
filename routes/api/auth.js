const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator');

const User = require('../../models/User');
//@route  Get api/auth
//@desc   Test Route
//@access  public
router.get('/', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

//@route  post api/auth
//@desc   Authenticate user and get token
//@access  public
router.post('/', [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        const {
            email,
            password
        } = req.body;

        try {

            // see if user exist 
            const user = await User.findOne({
                email
            });

            if (!user) {
                return res.status(400).json({
                    error: [{
                        msg: 'Invalid credentials'
                    }]
                });
            }

            const ismatch = await bcrypt.compare(password, user.password);

            if (!ismatch) {
                return res.status(400).json({
                    error: [{
                        msg: 'Invalid credentials'
                    }]
                });
            }

            //Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'), {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token
                    });
                });

        } catch (err) {

            console.log(err.message);
            res.status(500).send('Server error')

        }

    });


module.exports = router;