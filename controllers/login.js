const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async(request, response) => {
  // using destructuring assignment
  const { username, password } = request.body

  // findOne is the best option because it can return null
  const user = await User.findOne({ username })
  const passwordCorrect = user === null // ternary operation to check if the find returned null
    ? false // if null return false
    : await bcrypt.compare(password, user.passwordHash) // if true use bycrpt to compare password

    if (!(user && passwordCorrect)) { // if any check returns false
      return response.status(401).json({
        error: 'invalid username or password'
      })
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    response
      .status(200)
      .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
