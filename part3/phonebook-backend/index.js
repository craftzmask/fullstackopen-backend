require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token(
  'body', 
  function (request, response) { return JSON.stringify(request.body) }
)

app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :body'
))

app.get('/info', (request, response) => {
  response.send(`
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date()}</p>
  `)
})

app.get('/api/persons', (request, response, next) => {
  Person
    .find({})
    .then(persons => response.json(persons))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!(body.name && body.number)) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })
  
  person
    .save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { number } = request.body

  Person
    .findByIdAndUpdate(request.params.id, { number }, { new: true })
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id'
    })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})