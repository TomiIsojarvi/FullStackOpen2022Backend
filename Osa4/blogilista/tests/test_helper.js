const Blog = require('../models/blog')
const initialBlogs = require('./blogs')
const User = require('../models/user')

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

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb
}