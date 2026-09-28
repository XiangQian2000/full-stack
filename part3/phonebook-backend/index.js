const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
morgan.token('requestData', (request) => {
    return JSON.stringify(request.body)
})

app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :requestData'
    )
)

let persons = [
    {
        id: '1',
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: '2',
        name: 'Ada Lovelace',
        number: '39-44-5323523',
    },
    {
        id: '3',
        name: 'Dan Abramov',
        number: '12-43-234345',
    },
    {
        id: '4',
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
    },
]

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map((person) => Number(person.id)))
        : 0

    return String(maxId + 1)
}

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const date = new Date()

    response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>
  `)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id

    let person = persons.find((person) => {
        return person.id === id
    })

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

    persons = persons.filter((person) => {
        return person.id !== id
    })

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const newPersonData = request.body
    if (!newPersonData.name || !newPersonData.number) {
        return response.status(400).json({
            error: 'name or number is missing',
        })
    }

    const nameAlreadyExists = persons.some((person) => {
        return person.name === newPersonData.name
    })

    if (nameAlreadyExists) {
        return response.status(400).json({
            error: 'name must be unique',
        })
    }

    const newPerson = {
        name: newPersonData.name,
        number: newPersonData.number,
        id: generateId(),
    }

    persons = persons.concat(newPerson)

    response.json(newPerson)
})

const PORT = 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})