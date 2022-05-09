const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const { initialBlogs, blogsInDb } = require('../utils/list_helper')

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
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

  expect(response.body.length).toBe(initialBlogs.length + 1) // only 2 inital blogs added
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

test('missing title and url properties returns 400 code', async () => {
  const invalidBlog = {
    author: "Khanh Chung",
    likes: 1000,
  }
  
  await api.post('/api/blogs')
    .send(invalidBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('delete a blog', async () => {
  const blogsAtStart = await blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)
  
  const blogsAtEnd = await blogsInDb()
  const titles = blogsAtEnd.map(blog => blog.title)

  expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)
  expect(titles).not.toContain(blogToDelete.title)
})

test.only('update a blog with different likes', async () => {
  const blogsAtStart = await blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send ({ likes: 10 })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(10)
})

afterAll(() => mongoose.connection.close())