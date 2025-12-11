const blogsRouter = require("express").Router()
const Blog = require("../models/blog")
const middleware = require("../utils/middleware")

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post("/", middleware.userExtractor, async (request, response) => {
  const user = request.user
  const blog = new Blog(request.body)

  blog.likes = blog.likes | 0
  blog.user = user._id
  if (!blog.title || !blog.url) {
    return response.status(400).send({ error: "title or url missing" })
  }
  user.blogs = user.blogs.concat(blog._id)
  await user.save()

  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)
    // security?
    if (!blog) {
      return response.status(204).end()
    }

    const blogOwnerId = blog.user.toString()
    const currentUserId = user._id.toString()

    if (blogOwnerId !== currentUserId) {
      return response.status(403).json({
        error: "only the creator can delete a blog",
      })
    }

    await Blog.findByIdAndDelete(request.params.id)

    console.log(user.blogs)
    // clean up the user fields
    user.blogs = user.blogs.filter((b) => b.toString() !== blog._id.toString())
    await user.save()

    response.status(204).end()
  }
)
blogsRouter.put("/:id", async (request, response) => {
  const { title, author, url, likes } = request.body

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }
  blog.title = title
  blog.author = author
  blog.url = url
  blog.likes = likes

  const savedBlog = await blog.save()
  
  response.json(savedBlog)
})

module.exports = blogsRouter
