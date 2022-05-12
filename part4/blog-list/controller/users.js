const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.status(200).json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body

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