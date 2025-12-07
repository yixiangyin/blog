const blogsRouter = require("express").Router()
const Blog = require("../models/blog")
const middleware = require('../utils/middleware')

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  if (!body.title || !body.url) {
    return response.status(400).json({ error: "title or url missing" })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
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

blogsRouter.delete("/:id", middleware.userExtractor, async (request, response) => {
  const token = request.token
  const user = request.user

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: "blog not found" })
  }

  const blogOwnerId = blog.user.toString()
  const currentUserId = user._id.toString()

  if (blogOwnerId !== currentUserId) {
    return response.status(403).json({
      error: "only the creator can delete a blog",
    })
  }

  await Blog.findByIdAndDelete(request.params.id)

  // clean up the user fields
  user.blogs = user.blogs.filter((b) => b.toString() !== blog._id.toString())
  await user.save()

  response.status(204).end()
})

module.exports = blogsRouter
