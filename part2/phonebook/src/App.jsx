import { useEffect, useState } from 'react'
import personService from './services/persons'

const Notification = ({ message, isError }) => {
  if (message === null) {
    return null
  }

  const style = {
    color: isError ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  return <div style={style}>{message}</div>
}

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

const Persons = ({ persons, onDelete }) => {
  return (
    <div>
      {persons.map((person) => (
        <p key={person.id}>
          {person.name} {person.number}
          <button onClick={() => onDelete(person)}>delete</button>
        </p>
      ))}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    personService.getAll().then((response) => {
      setPersons(response.data)
    })
  }, [])

  const showNotification = (text, error = false) => {
    setMessage(text)
    setIsError(error)

    setTimeout(() => {
      setMessage(null)
      setIsError(false)
    }, 5000)
  }

  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find((person) => {
      return person.name === newName
    })

    if (existingPerson) {
      const answer = window.confirm(
        `${newName} is already added to phonebook. Replace the old number with a new one?`
      )

      if (answer) {
        const changedPerson = {
          ...existingPerson,
          number: newNumber,
        }

        personService
          .update(existingPerson.id, changedPerson)
          .then((response) => {
            setPersons(
              persons.map((person) => {
                return person.id === existingPerson.id
                  ? response.data
                  : person
              })
            )

            showNotification(`${response.data.name}'s number updated`)
          })
          .catch((error) => {
            if (error.response) {
              showNotification(error.response.data.error, true)
            } else {
              showNotification(
                `Information of ${existingPerson.name} has already been removed from server`,
                true
              )

              setPersons(
                persons.filter((person) => {
                  return person.id !== existingPerson.id
                })
              )
            }
          })
      }

      setNewName('')
      setNewNumber('')
      return
    }

    const personObject = {
      name: newName,
      number: newNumber,
    }

    personService
      .create(personObject)
      .then((response) => {
        setPersons(persons.concat(response.data))
        showNotification(`${response.data.name} added`)
      })
      .catch((error) => {
        showNotification(error.response.data.error, true)
      })

    setNewName('')
    setNewNumber('')
  }

  const deletePerson = (person) => {
    const answer = window.confirm(`Delete ${person.name}?`)

    if (answer) {
      personService.remove(person.id).then(() => {
        setPersons(
          persons.filter((item) => {
            return item.id !== person.id
          })
        )
      })
    }
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

      <Notification message={message} isError={isError} />

      <Filter filter={filter} onFilterChange={handleFilterChange} />

      <h3>add a new</h3>

      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        onNameChange={handleNameChange}
        newNumber={newNumber}
        onNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>

      <Persons persons={personsToShow} onDelete={deletePerson} />
    </div>
  )
}

export default App