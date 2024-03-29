const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const userExtractor = require('../utils/middleware').userExtractor
const multer = require('multer')
const upload = require('../cloudinary/upload')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', userExtractor, multer({ limits: { fieldSize: 25 * 1024 * 1024 }}).single('file'), async (request, response) => {
  const user = request.user
  const body = request.body
  console.log(body)

  const image_uploaded = await upload.uploadImage(body.image)
  console.log(image_uploaded)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
    image: image_uploaded.secure_url
  })

  if (!blog.title || !blog.url) {
    response.status(400).end()
  } else {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  // fetch blog post we want to delete
  const blog = await Blog.findById(request.params.id)
  const user = request.user

  console.log(blog.user.toString())
  console.log(user._id.toString()) // usin userExtractor middleware

  // compare the blog.user (id) with the id from the token
  if (blog.user.toString() === user._id.toString()) {
    await Blog.deleteOne(blog)
    response.status(204).end()
  } else {
    return response.status(401).json({ error: 'user not the owner of the blogpost' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  // get the blog with the updates from the request
  const body = request.body
  // get the user thas requesting the blog update from the request
  const user = request.body.user
  // // fetch the blog we are trying to update using the id in the params
  // // this is done so we can compare the user thats requesting to the user that owns the blog
  // const blogToUpdate = await Blog.findById(request.params.id)

  // // compare the blog.user id with the id from the token
  // if (blogToUpdate.user.toString() === user._id.toString()) {

    // if true, create blog with the updated data and update it
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    }
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    return response.json(updatedBlog)
  // }
  // else {
  //   return response.status(401).json({ error: 'user not the owner of the blogpost' })
  // }
})

module.exports = blogsRouter
