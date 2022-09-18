const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

// USER TESTS
describe('User Tests (When there is initially one user at db):', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  // Test 1
  test('Test 1: Creation succeeded with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'test123',
      name: 'Test User',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  // Test 2
  test('Test 2: Creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  // Test 3
  test('Test 3: Creation fails if password not defined', async () => {
    const newUser = {
      username: 'Username',
      name: 'Superuser'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password missing')
  })

  // Test 4
  test('Test 4: Creation fails if username not defined', async () => {
    const newUser = {
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Username missing')
  })

  // Test 5
  test('Test 5: Creation fails if password is less than 3 characters long', async () => {
    const newUser = {
      username: 'Testi',
      name: 'Superuser',
      password: 'sa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password must be at least 3 characters long.')
  })

  // Test 6
  test('Test 6: Creation fails if username is less than 3 characters long', async () => {
    const newUser = {
      username: 'Te',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Username must be at least 3 characters long.')
  })
})


// BLOG TESTS
describe('Blog tests (When there is initial blogs saved):', () => {
  let users = []
  let token = ''

  // Before all tests
  beforeAll(async () => {
    // Load all users from DB (there is only one user)
    users = await helper.usersInDb()
  })

  // Before each test
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  // Login test
  test('Login test', async () => {
    const user = {
      username: 'root',
      password: 'sekret'
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    token = response.body.token
  })

  // Test 1
  test('Test 1: Blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  // Test 2
  test('Test 2: All blogs returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  // Test 3
  test('Test 3: Is id-field defined?', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(element => expect(element.id).toBeDefined())
  })

  // Test 4
  test('Test 4: Addition of a new blog', async () => {
    const newBlog = {
      title: 'Testing...',
      author: 'Test Person',
      url: 'http://www.google.com',
      likes: 100,
      user: users[0].id
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // Remember to add the "Bearer"
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).toContain('Testing...')
  })

  // Test 5
  test('Test 5: Blog without likes', async () => {
    const newBlog = {
      title: 'Testing... 2',
      author: 'Test Person',
      url: 'http://www.google.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // Remember to add the "Bearer"
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
  test('Test 6: Blog without title or url', async () => {
    const newBlog = {
      author: 'Test Person',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) // Remember to add the "Bearer"
      .send(newBlog)
      .expect(400)
  })
})

// Blog deletion test
test('Blog deletion test: Succeeds with status code 204 if id is valid', async () => {
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

// Blog ubdating test
test('Succeeds with status code 200 if id is valid', async () => {
  const updatedBlog = {
    title: 'Updating...',
    author: 'Test Person',
    url: 'http://www.google.com',
    likes: 1000,
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

afterAll(() => {
  mongoose.connection.close()
})
