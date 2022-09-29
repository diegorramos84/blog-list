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

  const idChecker = content.map(r => r.id)
  expect(idChecker[0]).toBeDefined()
})

test('a new blog post can be created and saved', async () => {
  const newPost = { // creates new post by the blog model schema
    title: 'new post',
    author: 'Diego',
    url: 'www.diegoramos.com',
    likes: 5
  }

  await api // make a post request to the api/blogs & send new post
    .post('/api/blogs')
    .send(newPost)
    .expect(201)

  //  check if a post was added to the database
  const finalBlogs = await api.get('/api/blogs')

  expect(finalBlogs.body).toHaveLength(helper.initialBlogs.length + 1)
})

test('if the "likes" prop is missing from request its value will default to 0', async () => {
  const newPost = { // create a post with missing likes field
    title: 'new post',
    author: 'Diego',
    url: 'www.diegoramos.com',
  }

  // make a post request
  await api
  .post('/api/blogs')
  .send(newPost)
  .expect(201)

  const finalBlogs = await api.get('/api/blogs')
  const finalPost = finalBlogs.body

  expect(finalPost[finalPost.length - 1].likes).toBe(0)
})

afterAll(() => {
  mongoose.connection.close()
})
