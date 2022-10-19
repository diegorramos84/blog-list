const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    console.log('cleared')

    const passwordHash = await bcrypt.hash('sekret', 10)

    const user = new User({
      username: 'root',
      name:'superuser',
      passwordHash,
    })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDB()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('user creation fails with username shorter than 3 chars', async () => {
    const usersAtStart = await helper.usersInDB({})

    const newUser = {
      username: 'te',
      name: 'test',
      password: 'test'
    }

    await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDB({})
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('user creation fails with password shorter than 3 chars', async () => {
    const usersAtStart = await helper.usersInDB({})

    const newUser = {
      username: 'test',
      name: 'test',
      password: 'te'
    }

    await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDB({})
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('user creation fails if username is not unique', async () => {
    const usersAtStart = await helper.usersInDB({})

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'test'
    }

    const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDB({})
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
