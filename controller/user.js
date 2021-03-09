const User = require('../model/user')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
// const messagebird = require('messagebird')('F9h2fwhYbUtEGlg0hQYxM93Dt')
const speakeasy = require('speakeasy')
const uuid = require('uuid')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

const db = new JsonDB(new Config('myDatabase', true, false, '/'))

exports.createUser = async (req, res, next) => {
    const user = await new User(req.body)
    user.save((err, user) => {
        if (err) {
            return res.status(200).json({
                err: "User not able to save"
            })
        }
        res.json({ user })
    })
}

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        const { email, password } = req.body;

        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg,
            });
        }

        User.findOne({ email }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User email does not exist",
                });
            }

            if (!user.authenticate(password)) {
                return res.status(401).json({
                    error: "Email and password do not match"
                });
            }
            const token = jwt.sign({ _id: user._id }, process.env.SECRET)
            res.cookie("token", token, { expire: new Date() + 9999 });

            const { _id, firstName, lastName, email, address, mobile, pincode } = user;
            return res.json({
                token,
                user: { _id, firstName, lastName, email, address, mobile, pincode }
            });
        });
    } catch (error) {
        console.log(error);
    }
}

exports.logout = (req, res) => {
    res.clearCookie("token")
    res.json({
        message: "User signout"
    })
}

exports.register = async (req, res) => {
    const id = uuid.v4()

    try {
        const path = `/user/${id}`
        const temp_secret = speakeasy.generateSecret()
        db.push(path, { id, temp_secret })
        res.json({ id, secret: temp_secret })
    } catch (error) {
        console.log(error)
    }
}

exports.verify = async (req, res) => {
    const { token, userId } = req.body

    try {
        const path = `/user/${userId}`
        const user = db.getData(path)

        const { base32: secret } = user.temp_secret

        const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token })
        if (verified) {
            db.push(path, { id: userId, secret: user.temp_secret })
            res.json({ verified: true })
        } else {
            res.json({ verified: false })
        }

    } catch (err) {
        console.log(err)
    }
}