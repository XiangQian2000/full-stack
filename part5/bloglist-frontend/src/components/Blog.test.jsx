import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Blog from './Blog'

const blog = {
  title: 'Testing React components',
  author: 'Full Stack Open',
  url: 'https://fullstackopen.com',
  likes: 12,
  user: {
    username: 'testuser',
    name: 'Test User',
  },
}

test('renders title and author, but not url or likes by default', () => {
  render(
    <Blog
      blog={blog}
      updateLikes={vi.fn()}
      removeBlog={vi.fn()}
      user={{ username: 'another-user' }}
    />
  )

  expect(
    screen.getAllByText(/Testing React components Full Stack Open/)[0]
  ).toBeVisible()
  expect(screen.getByText(blog.url)).not.toBeVisible()
  expect(screen.getByText(`likes ${blog.likes}`, { exact: false })).not.toBeVisible()
})

test('shows url and likes after the view button is clicked', async () => {
  const user = userEvent.setup()

  render(
    <Blog
      blog={blog}
      updateLikes={vi.fn()}
      removeBlog={vi.fn()}
      user={{ username: 'another-user' }}
    />
  )

  await user.click(screen.getByText('view'))

  expect(screen.getByText(blog.url)).toBeVisible()
  expect(screen.getByText(`likes ${blog.likes}`, { exact: false })).toBeVisible()
})

test('calls the like handler twice when the like button is clicked twice', async () => {
  const user = userEvent.setup()
  const updateLikes = vi.fn()

  render(
    <Blog
      blog={blog}
      updateLikes={updateLikes}
      removeBlog={vi.fn()}
      user={{ username: 'another-user' }}
    />
  )

  await user.click(screen.getByText('view'))
  await user.click(screen.getByText('like'))
  await user.click(screen.getByText('like'))

  expect(updateLikes).toHaveBeenCalledTimes(2)
})
