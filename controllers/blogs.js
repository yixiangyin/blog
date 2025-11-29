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

blogsRouter.put("/:id", async (request, response, next) => {
  try {
    const body = request.body

    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).end()
    }

    if (body.likes !== undefined) {
      blog.likes = body.likes
    }
    const savedBlog = await blog.save()
    response.json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter
