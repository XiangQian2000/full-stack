const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)

  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])

    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const blogs = [
      {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5,
      },
    ]

    const result = listHelper.totalLikes(blogs)

    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = [
      { title: 'First', author: 'Ada', likes: 7 },
      { title: 'Second', author: 'Grace', likes: 12 },
      { title: 'Third', author: 'Linus', likes: 3 },
    ]

    const result = listHelper.totalLikes(blogs)

    assert.strictEqual(result, 22)
  })
})
describe('favorite blog', () => {
  test('returns the blog with the most likes', () => {
    const blogs = [
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        likes: 8,
      },
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12,
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt',
        likes: 6,
      },
    ]

    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    })
  })
})
describe('most blogs', () => {
  test('returns the author with the most blogs', () => {
    const blogs = [
      { title: 'Clean Code', author: 'Robert C. Martin', likes: 8 },
      { title: 'Clean Architecture', author: 'Robert C. Martin', likes: 10 },
      { title: 'Agile Software Development', author: 'Robert C. Martin', likes: 7 },
      { title: 'Refactoring', author: 'Martin Fowler', likes: 9 },
      { title: 'You Do Not Know JS', author: 'Kyle Simpson', likes: 6 },
    ]

    const result = listHelper.mostBlogs(blogs)

    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3,
    })
  })
})
describe('most likes', () => {
  test('returns the author with the most total likes', () => {
    const blogs = [
      {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5,
      },
      {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        likes: 10,
      },
      {
        title: 'Refactoring',
        author: 'Martin Fowler',
        likes: 9,
      },
    ]

    const result = listHelper.mostLikes(blogs)

    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    })
  })
})