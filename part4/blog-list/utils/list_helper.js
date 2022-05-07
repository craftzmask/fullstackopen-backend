const _ = require('lodash')

const dummy = blogs => 1

const totalLikes = blogs => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = blogs => {
  if (blogs.length === 0) return null;

  let blogWithMostLikes = blogs[0];
  let mostLikes = blogs[0].likes
  for (const blog of blogs) {
    if (mostLikes < blog.likes) {
      mostLikes = blog.likes
      blogWithMostLikes = blog
    }
  }

  return {
    title: blogWithMostLikes.title,
    author: blogWithMostLikes.author,
    likes: blogWithMostLikes.likes
  }
}

const mostBlogs = blogs => {
  if (blogs.length === 0) return null

  const blogsByAuthor = _.countBy(blogs, 'author')
  const authorWithMostBlogs = _.maxBy(
    _.keys(blogsByAuthor), 
    author => blogsByAuthor[author]
  )

  return {
    author: authorWithMostBlogs,
    blogs: blogsByAuthor[authorWithMostBlogs]
  }
}

const mostLikes = blogs => {
  if (blogs.length === 0) return null
  
  const blogsByAuthor = _.groupBy(blogs, 'author')
  const authorMostLikes = _.maxBy(
    _.keys(blogsByAuthor), 
    author => _.sumBy(blogsByAuthor[author], 'likes')
  )

  return {
    author: authorMostLikes,
    likes: _.sumBy(blogsByAuthor[authorMostLikes], 'likes')
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}