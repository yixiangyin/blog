const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// When using async/await syntax, 
// Express will automatically call the error-handling middleware 
// if an await statement throws an error or the awaited promise is rejected. 
// This makes the final code even cleaner.
// https://fullstackopen.com/en/part4/testing_the_backend#error-handling-and-asyncawait
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

    if (!username || !password) {
    return response.status(400).json({
      error: "both username and password must be given"
    })
  }

    if (username.length < 3) {
    return response.status(400).json({
      error: "username must be at least 3 characters long"
    })
  }

  if (password.length < 3) {
    return response.status(400).json({
      error: "password must be at least 3 characters long"
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {title: 1, author: 1, url: 1, likes: 1})
  response.json(users)
})

module.exports = usersRouter
