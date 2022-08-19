const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

// Total likes
const totalLikes = (blogs) => {
  const likes = blogs.map((blog) => blog.likes)
  return likes.reduce((sum, item) => sum + item, 0)
}

// Favorite blog
const favoriteBlog = (blogs) => {
  if (blogs.length === 0)
    return {}

  const favorite = blogs.reduce((pre, curr) => curr.likes >= pre.likes ? curr : pre)

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

// Author with most blogs
const mostBlogs = (blogs) => {
  if (blogs.length === 0)
    return {}

  const mostBlogs = _(blogs)
    .countBy((blog) => blog.author)
    .entries()
    .maxBy()

  return { author: mostBlogs[0], blogs: mostBlogs[1] }
}

// Author with most likes
const mostLikes = (blogs) => {
  if (blogs.length === 0)
    return {}

  // Group the author data together
  const mappedAuthors = _(blogs)
    .groupBy(x => x.author)
    .map((value, key) => ({ author: key, data: value }))
    .value()

  // Use reduce-method to calculate total likes and map them with the author
  const reducedAuthors = _(mappedAuthors)
    .map(author => {
      const totalLikes = _.reduce(author.data, (sum, n) => sum + n.likes, 0)

      return { author: author.author, likes: totalLikes }
    }).value()

  // Author with most likes is...
  const mostLikes = _(reducedAuthors).maxBy('likes')

  return mostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
