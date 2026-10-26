const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  try {
    const { username, name, password } = request.body
    if (typeof username !== 'string' || username.length < 3) {
      return response.status(400).json({
        error: 'username must be at least 3 characters long',
      })
    }

    if (typeof password !== 'string' || password.length < 3) {
      return response.status(400).json({
        error: 'password must be at least 3 characters long',
      })
    }
    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User
      .find({})
      .populate('blogs', {
        title: 1,
        author: 1,
        url: 1,
        likes: 1,
      })

    response.json(users)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter