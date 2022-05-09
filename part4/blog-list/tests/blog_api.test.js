const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

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

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blogs have id as their unique identifier', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogs = response.body
  blogs.forEach(blog => {
    expect(blog.id).toBeDefined()
  }) 
})

test('a valid blog can be added', async () => {
  const validBlog = {
    title: "Valid Blog",
    author: "Khanh Chung",
    url: "khanhchung.com",
    likes: 1000,
  }

  await api.post('/api/blogs')
    .send(validBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const titles = response.body.map(blog => blog.title)

  expect(response.body.length).toBe(2 + 1) // only 2 inital blogs added
  expect(titles).toContain('Valid Blog')
})

test('missing likes property will set it to 0', async () => {
  const missingLikesBlog = {
    title: "Valid Blog",
    author: "Khanh Chung",
    url: "khanhchung.com",
  }
  
  const response = await api.post('/api/blogs')
    .send(missingLikesBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  expect(response.body.likes).toBe(0)
})

test.only('missing title and url properties returns 400 code', async () => {
  const invalidBlog = {
    author: "Khanh Chung",
    likes: 1000,
  }
  
  await api.post('/api/blogs')
    .send(invalidBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

afterAll(() => mongoose.connection.close())