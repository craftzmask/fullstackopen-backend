const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const { initialBlogs, nonExistingId, blogsInDb } = require('../utils/list_helper')

const Blog = require('../models/blog')
const User = require('../models/user')

const getToken = async () => {
  const response = await api
    .post('/api/login')
    .send({ username: 'root', password: 'root' })
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  return response.body.token
}

const validBlog = {
  title: "Valid Blog",
  author: "Khanh Chung",
  url: "khanhchung.com",
  likes: 1000,
}

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('root', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
})

describe('when there is initially some blogs saved', () => {
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
  
  describe('addition of a new blog', () => {
    test('200 with a valid blog', async () => {
      const token = await getToken()
      
      await api.post('/api/blogs')
        .send(validBlog)
        .set('Authorization', `bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
      const response = await api.get('/api/blogs')
      const titles = response.body.map(blog => blog.title)
    
      expect(response.body.length).toBe(initialBlogs.length + 1) // only 2 inital blogs added
      expect(titles).toContain('Valid Blog')
    })

    test('400 with missing title and url properties', async () => {
      const token = await getToken()

      const invalidBlog = { author: "catcatcat", likes: 1000 }
      
      await api.post('/api/blogs')
        .send(invalidBlog)
        .set('Authorization', `bearer ${token}`)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })

    test('missing likes property will set it to 0', async () => {
      const token = await getToken()

      const missingLikesBlog = {
        title: "Valid Blog",
        author: "catcatcat",
        url: "catcatcat.com",
      }
      
      const response = await api.post('/api/blogs')
        .send(missingLikesBlog)
        .set('Authorization', `bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      expect(response.body.likes).toBe(0)
    })

    test('401 unauthorized if a token is not provided', async () => {
      const blogsAtStart = await blogsInDb()

      await api.post('/api/blogs')
        .send(validBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)
      
      const blogsAtEnd = await blogsInDb()

      expect(blogsAtStart.length).toBe(blogsAtEnd.length)
    })
  })

  describe('update of a new blog', () => {
    test('200 with update a valid blog ', async () => {
      const blogsAtStart = await blogsInDb()
      const blogToUpdate = blogsAtStart[0]
    
      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send ({ likes: 10 })
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
      expect(response.body.likes).toBe(10)
    })
  })

  describe('deletion of a blog', () => {
    test('delete a blog', async () => {
      const token = await getToken()

      const validBlog = {
        title: "Valid Blog",
        author: "Khanh Chung",
        url: "khanhchung.com",
        likes: 1000,
      }
    
      const response = await api
        .post('/api/blogs')
        .send(validBlog)
        .set('Authorization', `bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      const blogsAtStart = await blogsInDb()

      const blogToDelete = response.body
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `bearer ${token}`)
        .expect(204)
      
      const blogsAtEnd = await blogsInDb()
      const titles = blogsAtEnd.map(blog => blog.title)
    
      expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)
      expect(titles).not.toContain(blogToDelete.title)
    })
  })
})



afterAll(() => mongoose.connection.close())