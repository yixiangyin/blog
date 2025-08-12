require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const logger = require("./utils/logger")
const config = require("./utils/config")
const blogsRouter = require("./controllers/blogs")
const app = express()

const mongoUrl = process.env.MONGODB_URI
mongoose.connect(mongoUrl)

app.use(express.json())

app.use('/api/blogs', blogsRouter)

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
