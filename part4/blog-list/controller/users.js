const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.status(200).json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body

  const foundUsername = await User.find({ username })
  if (foundUsername) {
    return response.status(400).json({
      error: `${username} already existed`
    })
  }

  if (password === null || password.length < 3) {
    return response.status(400).json({
      error: 'Password must be at least 3 characters'
    })
  }

  const saltRound = 10
  const passwordHash = await bcrypt.hash(password, saltRound)

  const user = new User({
    username,
    passwordHash,
    name
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter