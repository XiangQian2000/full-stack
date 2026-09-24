import { useState } from 'react'

const Filter = ({ filter, onFilterChange }) => {
  return (
    <div>
      filter shown with:{' '}
      <input value={filter} onChange={onFilterChange} />
    </div>
  )
}

const PersonForm = ({
  onSubmit,
  newName,
  onNameChange,
  newNumber,
  onNumberChange,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        name: <input value={newName} onChange={onNameChange} />
      </div>
      <div>
        number: <input value={newNumber} onChange={onNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons }) => {
  return (
    <div>
      {persons.map((person) => (
        <p key={person.name}>
          {person.name} {person.number}
        </p>
      ))}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '040-123456' },
    { name: 'Ada Lovelace', number: '39-44-5323523' },
    { name: 'Dan Abramov', number: '12-43-234345' },
    { name: 'Mary Poppendieck', number: '39-23-6423122' },
  ])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  const addPerson = (event) => {
    event.preventDefault()

    const nameAlreadyExists = persons.some((person) => {
      return person.name === newName
    })

    if (nameAlreadyExists) {
      alert(`${newName} is already added to phonebook`)
      return
    }

    const personObject = {
      name: newName,
      number: newNumber,
    }

    setPersons(persons.concat(personObject))
    setNewName('')
    setNewNumber('')
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const personsToShow = persons.filter((person) => {
    return person.name.toLowerCase().includes(filter.toLowerCase())
  })

  return (
    <div>
      <h2>Phonebook</h2>

      <Filter
        filter={filter}
        onFilterChange={handleFilterChange}
      />

      <h3>add a new</h3>

      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        onNameChange={handleNameChange}
        newNumber={newNumber}
        onNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>

      <Persons persons={personsToShow} />
    </div>
  )
}

export default App