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
  console.log(response.body.length)
  assert.strictEqual(response.body.length, initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})
