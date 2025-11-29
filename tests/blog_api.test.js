const assert = require("node:assert")
const { test, after, beforeEach, before } = require("node:test")
const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const Blog = require("../models/blog")

const api = supertest(app)

const initialBlogs = [
  {
    title: "Payphone",
    author: "Maroon 5",
    url: "https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://en.wikipedia.org/wiki/Payphone_(song)&ved=2ahUKEwiq17qr3dmQAxUASmwGHd3yOvwQFnoECCAQAQ&usg=AOvVaw0eIqsrRXFwEPtyKVZtbk8o",
    likes: 10,
  },
  {
    title: "Happy",
    author: "Peter",
    url: "",
    likes: 0,
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/)
})

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs")
  // console.log(response.body.length)
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test("blog posts have id property, not _id", async () => {
  const response = await api.get("/api/blogs")

  const blogs = response.body

  blogs.forEach((blog) => {
    // id should exist
    assert.ok(blog.id, "blog.id should be defined")
    // _id should NOT be in the JSON
    assert.strictEqual(blog._id, undefined)
  })
})

// 4.10: Blog List Tests, step 3

// Write a test that verifies that making an HTTP POST request to the /api/blogs URL successfully creates a new blog post.
// At the very least, verify that the total number of blogs in the system is increased by one.
// You can also verify that the content of the blog post is saved correctly to the database.

// Once the test is finished, refactor the operation to use async/await instead of promises.

test("a valid blog can be added", async () => {
  const newBlog = {
    title: "Love yourself",
    author: "Justin Bieber",
    url: "https://en.wikipedia.org/wiki/Love_Yourself",
    likes: 999,
  }

  // send POST request
  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/)

  // fetch blogs after adding
  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1)

  const titles = blogsAtEnd.map((b) => b.title)
  assert.ok(
    titles.includes("Love yourself"),
    "Newly added blog title should be found in DB"
  )
})

// 4.11*: Blog List Tests, step 4

// Write a test that verifies that if the likes property is missing from the request, it will default to the value 0. Do not test the other properties of the created blogs yet.

// Make the required changes to the code so that it passes the test.

test("if likes property is missing, it defaults to 0", async () => {
  const newBlog = {
    title: "Love yourself",
    author: "Justin Bieber",
    url: "https://en.wikipedia.org/wiki/Love_Yourself",
    // likes intentionally omitted
  }

  const response = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/)

  // const blogsAtEnd = await Blog.find({})
  // console.log(blogsAtEnd)
  // console.log(response.body)
  // Check only the likes field
  assert.strictEqual(response.body.likes, 0)
})

after(async () => {
  await mongoose.connection.close()
})
