const listHelper = require('../utils/list_helper')
const blogs = require('./blogs')

test('dummy returns one', () => {
  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

// Total likes
describe('Total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    expect(listHelper.totalLikes(blogs)).toBe(36)
  })
})

// Favorite blog
describe('Favorite blog', () => {
  const favorite = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    likes: 12
  }

  test('from a empty list is a empty object', () => {
    expect(listHelper.favoriteBlog([])).toEqual({})
  })

  test('from a list is right', () => {
    expect(listHelper.favoriteBlog(blogs)).toEqual(favorite)
  })
})

// Author with most blog posts
describe('Author with most blog posts', () => {
  const mostBlogs = {
    author: 'Robert C. Martin',
    blogs: 3
  }

  test('from a empty list, returns empty object', () => {
    expect(listHelper.mostBlogs([])).toEqual({})
  })

  test('from a list is right', () => {
    expect(listHelper.mostBlogs(blogs)).toEqual(mostBlogs)
  })
})

// Author with most likes
describe('Author with most likes', () => {
  const mostLikes = {
    author: 'Edsger W. Dijkstra',
    likes: 17
  }

  test('from a empty list, returns empty object', () => {
    expect(listHelper.mostLikes([])).toEqual({})
  })

  test('from a list is right', () => {
    expect(listHelper.mostLikes(blogs)).toEqual(mostLikes)
  })
})