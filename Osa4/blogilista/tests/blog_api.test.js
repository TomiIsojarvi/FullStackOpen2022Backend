const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

describe('When there is initial blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  // Test 1
  test('Blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  // Test 2
  test('All blogs returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  // Test 3
  test('Is id-field defined?', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(element => expect(element.id).toBeDefined())
  })

  // Test 4
  test('Addition of a new blog', async () => {
    const newBlog = {
      title: 'Testing...',
      author: 'Test Person',
      url: 'http://www.google.com',
      likes: 100
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).toContain('Testing...')
  })

  // Test 5
  test('Blog without likes', async () => {
    const newBlog = {
      title: 'Testing... 2',
      author: 'Test Person',
      url: 'http://www.google.com',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const length = helper.initialBlogs.length + 1

    expect(blogsAtEnd).toHaveLength(length)

    const likes = blogsAtEnd[length - 1].likes
    expect(likes).toBe(0)
  })

  // Test 6
  test('Blog without title or url', async () => {
    const newBlog = {
      author: 'Test Person',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
})

describe('Deletion of a blog', () => {
  // Test 7
  test('Succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('Updating a blog', () => {
  // Test 8
  test('Succeeds with status code 200 if id is valid', async () => {
    const updatedBlog = {
      title: 'Updating...',
      author: 'Test Person',
      url: 'http://www.google.com',
      likes: 1000
    }

    await api
      .put('/api/blogs/5a422aa71b54a676234d17f8')
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain('Updating...')

  })
})

afterAll(() => {
  mongoose.connection.close()
})
