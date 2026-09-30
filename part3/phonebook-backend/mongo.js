const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('please provide the password')
  process.exit(1)
}

const password = process.argv[2]


const url = `mongodb+srv://xiangqian8711_db_user:${encodeURIComponent(password)}@cluster0.yrrvotd.mongodb.net/phonebook?appName=Cluster0`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then((people) => {
    console.log('phonebook:')

    people.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })

    mongoose.connection.close()
  })
} else {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then((savedPerson) => {
    console.log(
      `added ${savedPerson.name} number ${savedPerson.number} to phonebook`
    )
    mongoose.connection.close()
  })
}