const assert = require("node:assert")
const { test, after, beforeEach, before, describe } = require("node:test")
const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const Blog = require("../models/blog")
const bcrypt = require("bcrypt")
const User = require("../models/user")
const helper = require("./test_helper")
const api = supertest(app)

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash("sekret", 10)
    const user = new User({ username: "root", passwordHash })

    await user.save()
  })
  test("creation fails with proper statuscode and message if username or password fits criteria", async () => {
    // Both username and password must be given and both must be at least 3 characters long. The username must be unique.
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "i",
      name: "o",
      password: "u",
    }
    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)
    const usersAtEnd = await helper.usersInDb()
    assert(
      result.body.error.includes("username must be at least 3 characters long")
    )

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    }

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes("expected `username` to be unique"))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    }

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    assert(usernames.includes(newUser.username))
  })
})

describe("blog api", () => {
  // runs before EVERY test in this file
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "secret",
    }

    const userResponse = await api.post("/api/users").send(newUser).expect(201)
    const userId = userResponse.body.id

    // Save blogs with the user assigned
    const blogsWithUser = helper.initialBlogs.map((blog) => {
      return { ...blog, user: userId }
    })

    await Blog.insertMany(blogsWithUser)
  })

  // ───────────────────────────────
  // 1. FETCHING BLOGS
  // ───────────────────────────────
  describe("when there are initially two blogs in db", () => {
    test("blogs are returned as json", async () => {
      await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/)
    })
    test("all blogs are returned", async () => {
      const response = await api.get("/api/blogs")
      // console.log(response.body.length)
      assert.strictEqual(response.body.length, helper.initialBlogs.length)
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
  })

  // ───────────────────────────────
  // 2. ADDING BLOGS (POST /api/blogs)
  // ───────────────────────────────
  describe("addition of a new blog", () => {
    // beforeEach(async () => {
    //   const loginResponse = await api
    //     .post("/api/login")
    //     .send({
    //       username: "root",
    //       password: "secret",
    //     })
    //     .expect(200)
    //     .expect("Content-Type", /application\/json/)
    //   const token = loginResponse.body.token
    // })
    test("a valid blog cannot be added without a valid token", async () => {


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
        .expect(401)

      // fetch blogs after adding
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test("a valid blog can be added with a valid token", async () => {
      // 1. login to get token
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: "root",
          password: "secret",
        })
        .expect(200)
        .expect("Content-Type", /application\/json/)
      const token = loginResponse.body.token

      const newBlog = {
        title: "Love yourself",
        author: "Justin Bieber",
        url: "https://en.wikipedia.org/wiki/Love_Yourself",
        likes: 999,
      }
      // send POST request

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/)

      // fetch blogs after adding
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

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
      // 1. login to get token
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: "root",
          password: "secret",
        })
        .expect(200)
        .expect("Content-Type", /application\/json/)
      const token = loginResponse.body.token

      const newBlog = {
        title: "Love yourself",
        author: "Justin Bieber",
        url: "https://en.wikipedia.org/wiki/Love_Yourself",
        // likes intentionally omitted
      }

      const response = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/)

      // const blogsAtEnd = await Blog.find({})
      // console.log(blogsAtEnd)
      // console.log(response.body)
      // Check only the likes field
      assert.strictEqual(response.body.likes, 0)
    })

    // 4.12*: Blog List tests, step 5

    // Write tests related to creating new blogs via the /api/blogs endpoint, that verify that if the title or url properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request.

    // Make the required changes to the code so that it passes the test.
    test("blog without title is not added", async () => {
      // 1. login to get token
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: "root",
          password: "secret",
        })
        .expect(200)
        .expect("Content-Type", /application\/json/)
      const token = loginResponse.body.token

      const newBlog = {
        author: "No Title Author",
        url: "https://example.com",
        likes: 5,
      }

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test("blog without url is not added", async () => {
      // 1. login to get token
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: "root",
          password: "secret",
        })
        .expect(200)
        .expect("Content-Type", /application\/json/)
      const token = loginResponse.body.token

      const newBlog = {
        title: "No URL Blog",
        author: "Someone",
        likes: 5,
      }

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await Blog.find({})
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  // ───────────────────────────────
  // 3. DELETING BLOGS (DELETE /api/blogs/:id)
  // ───────────────────────────────
  // 4.13 Blog List Expansions, step 1

  // Implement functionality for deleting a single blog post resource.

  // Use the async/await syntax. Follow RESTful conventions when defining the HTTP API.

  // Implement tests for the functionality.

  describe("deletion of a blog", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      // 1. login to get token
      const loginResponse = await api
        .post("/api/login")
        .send({
          username: "root",
          password: "secret",
        })
        .expect(200)
        .expect("Content-Type", /application\/json/)
      const token = loginResponse.body.token

      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const titles = blogsAtEnd.map((b) => b.title)
      assert(!titles.includes(blogToDelete.title))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })
  })

  // ───────────────────────────────
  // 4. UPDATING BLOGS (PUT /api/blogs/:id)
  // ───────────────────────────────
  describe("updating a blog", () => {
    // 4.14 Blog List Expansions, step 2

    // Implement functionality for updating the information of an individual blog post.

    // Use async/await.

    // The application mostly needs to update the number of likes for a blog post. You can implement this functionality the same way that we implemented updating notes in part 3.

    // Implement tests for the functionality.

    test("updating likes succeeds and returns updated blog", async () => {
      const blogsAtStart = await Blog.find({})
      const blogToUpdate = blogsAtStart[0]

      const newLikes = blogToUpdate.likes + 1

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ likes: newLikes })
        .expect(200)
        .expect("Content-Type", /application\/json/)

      // Check API response
      assert.strictEqual(response.body.likes, newLikes)

      // Check DB update
      const updatedBlogInDb = await Blog.findById(blogToUpdate.id)
      assert.strictEqual(updatedBlogInDb.likes, newLikes)
    })
  })
  after(async () => {
    await mongoose.connection.close()
  })
})
