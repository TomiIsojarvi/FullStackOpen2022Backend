const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('Invalid number of arguments.')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://Tomppa1984:${password}@cluster0.0tidp9z.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: name,
  number: number,
})

if (process.argv.length === 5) {
  person.save().then(() => {
    console.log(`Added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(persons => {
      console.log(persons.name + ' ' + persons.number)
      mongoose.connection.close()
    })
  })
}