import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import BlogForm from './BlogForm'

test('calls createBlog with the entered blog details', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn().mockResolvedValue(true)

  render(<BlogForm createBlog={createBlog} />)

  await user.type(screen.getByLabelText('title'), 'Testing React forms')
  await user.type(screen.getByLabelText('author'), 'Caie')
  await user.type(screen.getByLabelText('url'), 'https://example.com/forms')
  await user.click(screen.getByText('create'))

  expect(createBlog).toHaveBeenCalledTimes(1)
  expect(createBlog).toHaveBeenCalledWith({
    title: 'Testing React forms',
    author: 'Caie',
    url: 'https://example.com/forms',
    likes: 0,
  })
})
