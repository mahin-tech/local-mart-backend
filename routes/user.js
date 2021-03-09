const express = require('express')
const router = express.Router()

const { createUser, login, register, verify, logout } = require('../controller/user')

router.post('/create/user', createUser)
router.post('/login', login)
router.get('/logout', logout)
router.post('/register', register)
router.post('/verify', verify)

module.exports = router