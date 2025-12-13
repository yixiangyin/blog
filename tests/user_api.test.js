const { after, beforeEach, describe, test } = require("node:test")
const app = require("../app")
const assert = require("node:assert")
const mongoose = require("mongoose")
const supertest = require("supertest")
const helper = require("./test_helper")
const User = require("../models/user")
const bcrypt = require('bcrypt')

const api = supertest(app)

describe("users", () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

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
        result.body.error.includes(
          "username must be at least 3 characters long"
        )
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
    after(() => {
    mongoose.connection.close()
  })
})
