require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

app.use(bodyParser.json())
app.use(cors())

const userRoutes = require('./routes/user')

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("DB CONNECTED")
}).catch((err) => {
    console.log("DB CONNECTION ERR")
})

app.use("/api", userRoutes)

const PORT = 8000
app.listen(PORT, () => {
    console.log("app is running at port", PORT)
})