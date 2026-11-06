const { test, expect, describe, beforeEach } = require('@playwright/test')
const { loginWith, createBlog, likeBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    const resetResponse = await request.post('/api/testing/reset')
    expect(resetResponse.status()).toBe(204)

    const userResponse = await request.post('/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'secret123',
      },
    })
    expect(userResponse.status()).toBe(201)

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'log in to application' })).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'secret123')

      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'wrong-password')

      await expect(page.getByText('wrong username or password')).toBeVisible()
      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'testuser', 'secret123')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(
        page,
        'A blog created by Playwright',
        'Test User',
        'https://example.com/playwright'
      )

      await expect(
        page.locator('.blog').filter({ hasText: 'A blog created by Playwright' })
      ).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(
        page,
        'A liked blog',
        'Test User',
        'https://example.com/liked'
      )
      await likeBlog(page, 'A liked blog', 1)
    })

    test('the creator can remove a blog', async ({ page }) => {
      const title = 'A removable blog'
      await createBlog(page, title, 'Test User', 'https://example.com/remove')

      const blog = page.locator('.blog').filter({ hasText: title })
      await blog.getByRole('button', { name: 'view' }).click()
      page.once('dialog', dialog => dialog.accept())
      await blog.getByRole('button', { name: 'remove' }).click()

      await expect(blog).toHaveCount(0)
    })

    test('only the creator sees the remove button', async ({ page, request }) => {
      const title = 'A protected blog'
      await createBlog(page, title, 'Test User', 'https://example.com/protected')

      await request.post('/api/users', {
        data: {
          name: 'Another User',
          username: 'anotheruser',
          password: 'secret456',
        },
      })

      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'anotheruser', 'secret456')

      const blog = page.locator('.blog').filter({ hasText: title })
      await blog.getByRole('button', { name: 'view' }).click()
      await expect(blog.getByRole('button', { name: 'remove' })).toHaveCount(0)
    })

    test('blogs are ordered by likes', async ({ page }) => {
      await createBlog(page, 'One like', 'Test User', 'https://example.com/one')
      await createBlog(page, 'Two likes', 'Test User', 'https://example.com/two')
      await createBlog(page, 'Three likes', 'Test User', 'https://example.com/three')

      await likeBlog(page, 'One like', 1)
      await likeBlog(page, 'Two likes', 2)
      await likeBlog(page, 'Three likes', 3)

      const blogs = page.locator('.blog')
      await expect(blogs.nth(0)).toContainText('Three likes')
      await expect(blogs.nth(1)).toContainText('Two likes')
      await expect(blogs.nth(2)).toContainText('One like')
    })
  })
})
