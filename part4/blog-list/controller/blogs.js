const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const user = request.user

  request.body.user = user._id
  const blog = new Blog(request.body)
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const likes = request.body.likes
  const savedBlog = await Blog
    .findByIdAndUpdate(id, { likes }, { new: true })
    
  response.json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (request.user._id.toString() !== blog.user.toString()) {
    return response.status(401).json({ error: 'Unauthorized' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter