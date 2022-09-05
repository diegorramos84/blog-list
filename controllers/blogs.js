const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', (request, response) => {
  console.log(Blog)
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
    .catch(error => console.log(error))
})

blogsRouter.post('/', (request, response) => {
  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  })

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
    .catch(error => console.log(error))
})

module.exports = blogsRouter
