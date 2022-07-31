const express = require('express')
const app = express()

app.use(express.json())

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

// generateId - Generates an id for a person.
const generateId = () => {
  return Math.floor(Math.random() * 100000)
}

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

// Startup the server.
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})