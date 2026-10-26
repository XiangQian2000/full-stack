const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let user
let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret123', 10)

  user = new User({
    username: 'root',
    name: 'Root User',
    passwordHash,
  })

  await user.save()
  await Blog.insertMany(helper.initialBlogs)

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'root',
      password: 'secret123',
    })

  token = loginResponse.body.token
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier property is named id', async () => {
    const response = await api.get('/api/blogs')

    assert(response.body[0].id)
    assert.strictEqual(response.body[0]._id, undefined)
})

test('a valid blog can be added', async () => {
    const blogsAtStart = await api.get('/api/blogs')

    const newBlog = {
        title: 'Async API testing',
        author: 'You',
        url: 'https://example.com/async',
        likes: 4,
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await api.get('/api/blogs')

    assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length + 1)

    const titles = blogsAtEnd.body.map((blog) => blog.title)
    assert(titles.includes('Async API testing'))
})

test('a blog cannot be added without a token', async () => {
    const blogsAtStart = await api.get('/api/blogs')

    const newBlog = {
        title: 'Blog without token',
        author: 'You',
        url: 'https://example.com/no-token',
        likes: 1,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length)
})

test('blog without likes gets zero likes', async () => {
    const newBlog = {
        title: 'Default values in Mongoose',
        author: 'You',
        url: 'https://example.com/defaults',
    }

    const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

    assert.strictEqual(response.body.likes, 0)
})

test('blog without title or url is not added', async () => {
    const blogWithoutTitle = {
        author: 'You',
        url: 'https://example.com/no-title',
        likes: 1,
    }

    const blogWithoutUrl = {
        title: 'A blog without URL',
        author: 'You',
        likes: 1,
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogWithoutTitle)
        .expect(400)

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogWithoutUrl)
        .expect(400)
})

test('a blog can be deleted', async () => {
    const blogToDelete = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Blog to delete',
            author: 'Root User',
            url: 'https://example.com/delete',
            likes: 1,
        })
        .expect(201)

    const blogsAtStart = await api.get('/api/blogs')

    await api
        .delete(`/api/blogs/${blogToDelete.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')

    assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1)

    const titles = blogsAtEnd.body.map((blog) => blog.title)
    assert(!titles.includes(blogToDelete.body.title))
})

test('a blog cannot be deleted without a token', async () => {
    const blog = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Protected blog',
            author: 'Root User',
            url: 'https://example.com/protected',
            likes: 1,
        })
        .expect(201)

    await api.delete(`/api/blogs/${blog.body.id}`).expect(401)

    const blogsAtEnd = await api.get('/api/blogs')
    assert(blogsAtEnd.body.some((item) => item.id === blog.body.id))
})

test('a blog cannot be deleted by another user', async () => {
    const blog = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Another protected blog',
            author: 'Root User',
            url: 'https://example.com/another-protected',
            likes: 1,
        })
        .expect(201)

    await api
        .post('/api/users')
        .send({
            username: 'otheruser',
            name: 'Other User',
            password: 'secret123',
        })
        .expect(201)

    const otherLogin = await api
        .post('/api/login')
        .send({
            username: 'otheruser',
            password: 'secret123',
        })
        .expect(200)

    await api
        .delete(`/api/blogs/${blog.body.id}`)
        .set('Authorization', `Bearer ${otherLogin.body.token}`)
        .expect(401)

    const blogsAtEnd = await api.get('/api/blogs')
    assert(blogsAtEnd.body.some((item) => item.id === blog.body.id))
})

test('likes of a blog can be updated', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    const updatedBlog = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1,
    }

    const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
})

test('a new user can be created', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
        username: 'newuser',
        name: 'New User',
        password: 'secret123',
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((user) => user.username)
    assert(usernames.includes(newUser.username))
})

test('duplicate username is not allowed', async () => {
    const usersAtStart = await helper.usersInDb()

    const duplicateUser = {
        username: 'root',
        name: 'Another Root',
        password: 'anothersecret',
    }

    const result = await api
        .post('/api/users')
        .send(duplicateUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('expected `username` to be unique'))
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('invalid users are not created', async () => {
    const usersAtStart = await helper.usersInDb()

    const invalidUsers = [
        {
            name: 'Missing Username',
            password: 'secret123',
        },
        {
            username: 'ab',
            name: 'Short Username',
            password: 'secret123',
        },
        {
            username: 'validuser',
            name: 'Short Password',
            password: '12',
        },
    ]

    for (const invalidUser of invalidUsers) {
        const result = await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(result.body.error)
    }

    const usersAtEnd = await helper.usersInDb()

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

after(async () => {
    await mongoose.connection.close()
})
