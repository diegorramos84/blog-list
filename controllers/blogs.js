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

  if (blog.title === "" || blog.url === "") {
    response.status(400).end()
  } else {
    blog
      .save()
      .then(result => {
        response.status(201).json(result)
      })
      .catch(error => console.log(error))
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter
