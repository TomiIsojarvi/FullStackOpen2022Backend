const Blog = require('../models/blog')
const initialBlogs = require('./blogs')

const nonExistingId = async () => {
  const newBlog = new Blog({
    title: 'willremovethissoon',
    author: 'Test Person',
    url: 'http://www.google.com',
    likes: 100
  })

  await newBlog.save()
  await newBlog.remove()

  return newBlog.id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}