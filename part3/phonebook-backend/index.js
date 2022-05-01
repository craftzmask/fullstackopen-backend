require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token(
  'body', 
  function (req, res) { return JSON.stringify(req.body) }
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

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(persons => response.json(persons))
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

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!(body.name && body.number)) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  const foundPerson = persons
    .find(person => person.name === body.name)

  if (foundPerson) {
    return response.status(400).json({
      error: `${body.name} already exists in the phonebook`
    })
  }

  function generateId() {
    return Math.floor(Math.random() * 1000000000)
  }

  const personObject = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(personObject)
  
  return response.json(personObject)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})