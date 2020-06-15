const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {
    check,
    validationResult
} = require('express-validator');

//Import user model
const User = require('../../models/User')

//@route  post api/users
//@desc   Register Route
//@access  public
router.post('/', [
        check('name', 'Name is required')
        .not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        const {
            name,
            email,
            password
        } = req.body;

        try {

            // see if user exist 
            let user = await User.findOne({
                email
            });

            if (user) {
                return res.status(400).json({
                    error: [{
                        msg: 'User already configured'
                    }]
                })
            }

            // Get user gravator
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                name,
                email,
                avatar,
                password
            })

            //Encrypt the password 
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt)

            await user.save();

            //Return jsonwebtoken
            res.send('user registered');

        } catch (err) {

            console.log(err.message);
            res.status(500).send('Server error')

        }


        res.send('User route')
    });


module.exports = router;