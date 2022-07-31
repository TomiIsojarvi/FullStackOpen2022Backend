require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

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

morgan.token('person', function (req, res) { return JSON.stringify(req.body) })

// Middlewares
app.use(cors())
app.use(express.json())
//app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))
app.use(express.static('build'))

// GET / - Root
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

// GET /info - Get info
app.get('/info', (req, res, next) => {
  const date = new Date()

  Person.count({}, function (err, result) {
    if (err) {
      next(err)
    } else {
      res.send("<p>Phonebook has info for " + result + " people.</p>" +
        "<p>" + date + "</p>")
    }
  })
})

// GET /api/persons - Get all persons.
app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
    .catch(error => next(error))
})

// GET /api/persons/:id - Get a person with a specific id.
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

// DELETE /api/persons/:id - Deletes a person with a specfic id.
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

// PUT /api/persons/:id - Update a person 
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

// POST /api/persons - Creates a new user.
app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (body.name === undefined) {
    return res.status(400).json({
      error: 'Name missing'
    })
  }

  if (body.number === undefined) {
    return res.status(400).json({
      error: 'Number missing'
    })
  }

  // Tämä tuottaa ongelmia asynkronisen luonteen vuoksi...
  // En tiedä vielä mitä tehdä sille...
  /*Person.find({ name: body.name })
    .then(result => {
      return res.status(400).json({
        error: 'Name must be unique'
      })
    })*/

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedNote => {
      res.json(savedNote)
    })
    .catch(error => next(error))
})

// unknownEndpoint - Middleware for unknown endpoints 
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

// errorHandler - Middleware for handling errors.
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

// Startup the server.
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})