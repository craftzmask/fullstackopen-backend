const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const { usersInDb } = require('../utils/list_helper')

const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
})

describe('invalid users are not created', () => {
  test('Both username and password must be given', async () => {
    const usersAtStart = await usersInDb()

    const missingUsername = { password: 'missing_username' }
    await api
      .post('/api/users')
      .send(missingUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const missingPassword = { username: 'missing_password' }
    await api
      .post('/api/users')
      .send(missingPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()

    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('Both username and password must be at least 3 characters long', async () => {
    const usersAtStart = await usersInDb()

    const usernameTooShort = { 
      username: 'aa',
      password: 'username_too_short' 
    }
    await api
      .post('/api/users')
      .send(usernameTooShort)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    const passwordTooShort = { 
      username: 'password_too_short',
      password: 'aa' 
    }
    await api
      .post('/api/users')
      .send(passwordTooShort)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()

    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('The username must be unique', async () => {
    await User.insertMany([{
      username: 'unique',
      password: 'unique'
    }])

    const usersAtStart = await usersInDb()

    const user = {
      username: 'unique',
      password: 'unique'
    }
    
    await api
      .post('/api/users')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()

    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})