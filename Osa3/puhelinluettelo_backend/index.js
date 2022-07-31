const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

// generateId - Generates an id for a person.
const generateId = () => {
  return Math.floor(Math.random() * 100000)
}

// requestLogger - Middleware for requests
/*const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
}*/

morgan.token('person', function (req, res) { return JSON.stringify(req.body )})

// Middlewares
app.use(cors())
app.use(express.json())
//app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))
app.use(express.static('build'))

// Hard-coded persons
let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]


// GET / - Root
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

// GET /info - Get info
app.get('/info', (req, res) => {
  const date = new Date()
  const result = persons.length

  res.send("<p>Phonebook has info for " + result + " people.</p>" +
    "<p>" + date + "</p>")
})

// GET /api/persons - Get all persons.
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

// GET /api/persons/:id - Get a person with a specific id.
app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

// DELETE /api/persons/:id - Deletes a person with a specfic id.
app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

// POST /api/persons - Creates a new user.
app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({ 
      error: 'Name missing' 
    })
  }

  if (!body.number) {
    return res.status(400).json({ 
      error: 'Number missing' 
    })
  }

  if (persons.find(person => person.name === body.name)) {
    return res.status(400).json({
      error: 'Name must be unique'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  res.json(person)
})

// unknownEndpoint - Middleware for unknown endpoints 
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

// Startup the server.
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})