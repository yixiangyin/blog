const blogsRouter = require("express").Router()
const Blog = require("../models/blog")

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post("/", (request, response) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).json({ error: "title or url missing" })
  }

  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  })
})

module.exports = blogsRouter
