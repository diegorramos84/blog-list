const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const { findById } = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})

  for(let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('viewing posts', () => {
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
})

describe('new blog post creation', () => {
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

  test('unique identifier property of the blog post is named id after creation', async () => {
    const response = await api.get('/api/blogs')
    const content = response.body

    const idChecker = content.map(r => r.id)
    expect(idChecker[0]).toBeDefined()
  })

  test('likes property will default to 0 if empty', async () => {
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

  test('fails creating a post with status 400 if if missing title', async () => {
    const newPost = { // create a post with missing likes field
      title: '',
      author: 'Diego',
      url: 'www.diegorramos.com',
      likes: 0
    }

    await api
    .post('/api/blogs')
    .send(newPost)
    .expect(400)
  })

  test('fails creating a post with status 400 if missing url', async () => {
    const newPost = { // create a post with missing likes field
      title: 'this is a test',
      author: 'Diego',
      url: '',
      likes: 0
    }

    await api
    .post('/api/blogs')
    .send(newPost)
    .expect(400)
  })
})

describe('deletion of a blog post', () => {
  test('blog post can be deleted', async () => {
    const initialBlogs = await helper.blogsInDB()
    const blogToDelete = initialBlogs[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const updatedBlogsList = await helper.blogsInDB()
    expect(updatedBlogsList).toHaveLength(initialBlogs.length -1)

    const titles = updatedBlogsList.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog post', () => {
  test('updating like count', async () => {
    const blogs = await helper.blogsInDB()
    const blogToUpdate = blogs[0]

    blogToUpdate.likes = 100

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)

    const updatedBlogs = await helper.blogsInDB()
    expect(updatedBlogs[0].likes).toBe(blogToUpdate.likes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
