const _ = require('lodash')
const Blog = require('../models/blog')
const user = require('../models/user')

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

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
  }
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: "Valid Blog",
    author: "Khanh Chung",
    url: "khanhchung.com",
    likes: 1000,
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await user.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb
}