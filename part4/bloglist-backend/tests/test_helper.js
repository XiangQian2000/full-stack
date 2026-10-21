const User = require('../models/user')
const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'Matti Luukkainen',
    url: 'https://example.com/html',
    likes: 5,
  },
  {
    title: 'Testing Node applications',
    author: 'Full Stack Open',
    url: 'https://fullstackopen.com',
    likes: 10,
  },
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = {
  initialBlogs,
  usersInDb,
}