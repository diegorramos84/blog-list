const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body


  // validate username and password > 3 chars long
  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: 'username & password need to be at least 3 chars long'
    })
  }

  // username must be unique
  const notUniqueUser = await User.findOne({ username })
  if (notUniqueUser) {
    return response.status(400).json({
      error: 'username must be unique'
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

  // respond code and error
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

module.exports = usersRouter
