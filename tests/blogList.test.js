const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

beforeAll(async () => {
  //create admin user for the test
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'admin', passwordHash })

  await user.save()
})

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

  //login user to get token
  const response = await api
  .post('/api/login')
  .send(
    {
      "username": "admin",
      "password": "sekret"
    })

  const token = response.body.token

  const users = await api.get('/api/users')

  const adminId = users.body[0].id

    const newPost = { // creates new post by the blog model schema
      title: 'new post',
      author: 'Diego',
      url: 'www.diegoramos.com',
      likes: 5,
      user: {
        username: 'admin',
        id: adminId
      }
    }

    await api // make a post request to the api/blogs & send new post
      .post('/api/blogs')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + token)
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
    //login user to get token
    const response = await api
    .post('/api/login')
    .send(
      {
        "username": "admin",
        "password": "sekret"
      })

    const token = response.body.token

    const users = await api.get('/api/users')

    const adminId = users.body[0].id


    const newPost = { // creates new post by the blog model schema
      title: 'new post',
      author: 'Diego',
      url: 'www.diegoramos.com',
      user: {
        username: users.body[0],
        id: adminId
      }
    }

    await api // make a post request to the api/blogs & send new post
      .post('/api/blogs')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send(newPost)
      .expect(201)

    const finalBlogs = await api.get('/api/blogs')
    const finalPost = finalBlogs.body

    expect(finalPost[finalPost.length - 1].likes).toBe(0)
  })

  test('fails creating a post with status 400 if if missing title', async () => {
    //login user to get token
    const response = await api
    .post('/api/login')
    .send(
      {
        "username": "admin",
        "password": "sekret"
      })

    const token = response.body.token

    const users = await api.get('/api/users')

    const adminId = users.body[0].id


    const newPost = { // creates new post by the blog model schema
      author: 'Diego',
      url: 'www.diegoramos.com',
      likes: 5,
      user: {
        username: users.body[0],
        id: adminId
      }
    }

    await api // make a post request to the api/blogs & send new post
      .post('/api/blogs')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send(newPost)
      .expect(400)
  })
  test('fails creating a post with status 400 if missing url', async () => {
    //login user to get token
    const response = await api
    .post('/api/login')
    .send(
      {
        "username": "admin",
        "password": "sekret"
      })

    const token = response.body.token

    const users = await api.get('/api/users')

    const adminId = users.body[0].id


    const newPost = { // creates new post by the blog model schema
      title: 'test',
      author: 'Diego',
      likes: 5,
      user: {
        username: users.body[0],
        id: adminId
      }
    }

    await api // make a post request to the api/blogs & send new post
      .post('/api/blogs')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send(newPost)
      .expect(400)
  })
})

describe('deletion of a blog post by post creator only', () => {
  test('blog post can be deleted', async () => {

  //login user to get token
  const response = await api
  .post('/api/login')
  .send(
    {
      "username": "admin",
      "password": "sekret"
    })

  const token = response.body.token

  const users = await api.get('/api/users')

  const adminId = users.body[0].id

  // create a post with logged user to delete it later
  const newPost = {
    title: 'test',
    author: 'Diego',
    url: 'www.diegoramos.com',
    likes: 5,
    user: {
      username: 'admin',
      id: adminId
    }
  }

  await api // make a post request to the api/blogs & send new post
    .post('/api/blogs')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + token)
    .send(newPost)
    .expect(201)

  //  get the post we just added
  const finalBlogs = await api.get('/api/blogs')
  const finalBlogsArray = finalBlogs.body
  const blogToDelete = finalBlogsArray[finalBlogsArray.length - 1]

  // delete the post we added before
  await api
  .delete(`/api/blogs/${blogToDelete.id}`)
  .set('Accept', 'application/json')
  .set('Authorization', 'Bearer ' + token)
  .expect(204)

  // because we added one post, the final post number
  // should match the original list
  const updatedBlogsList = await helper.blogsInDB()
  expect(updatedBlogsList).toHaveLength(helper.initialBlogs.length)

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
