const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

// GET / - Get all blogs
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

// POST / - Post a new blog
blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(body.userId)

  if (body.title === undefined || body.url === undefined) {
    response.status(400).end()
    return
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: {
      username: user.username,
      name: user.name,
      id: user.id
    }
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat({
    url: blog.url,
    title: blog.title,
    author: blog.author,
    id: savedBlog.id
  })
  await user.save()

  response.status(201).json(savedBlog)
})

// DELETE /:id - Remove a blog post by id
blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

// PUT /:id - Update a blog by id
blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter