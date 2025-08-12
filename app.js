const express = require("express")
const mongoose = require("mongoose")

const blogsRouter = require("./controllers/blogs")

const app = express()

const mongoUrl = process.env.MONGODB_URI
mongoose.connect(mongoUrl)

app.use(express.json())

app.use('/api/blogs', blogsRouter)

module.exports = app
