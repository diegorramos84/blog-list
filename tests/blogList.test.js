const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})

  for(let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('blog application returns correct amout of blog posts', async() => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('unique identifier property of the blog post is named id', async () => {
  const response = await api.get('/api/blogs')
  const content = response.body
  console.log(content)

  const idChecker = content.map(r => r.id)
  console.log(idChecker)
  expect(idChecker[0]).toBeDefined()
})

afterAll(() => {
  mongoose.connection.close()
})
