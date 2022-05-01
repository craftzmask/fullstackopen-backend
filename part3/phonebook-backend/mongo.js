const mongoose = require('mongoose')

const len = process.argv.length

if (len !== 3 && len !== 5) {
  console.log('Please follow the format:')
  console.log('I.  node mongose.js <password>: to see the phonebook list')
  console.log('II. node mongo.js <password> <name> <number>: to add a new person')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://khanh:${password}@cluster0.n0r0h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (len === 3) {
  Person.find({})
    .then(result => {
      console.log('phonebook:')
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
} else {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })
  
  person.save().then(person => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}
