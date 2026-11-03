import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const [notificationType, setNotificationType] = useState('success')
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistUser')

    if (loggedUserJSON) {
      const savedUser = JSON.parse(loggedUserJSON)
      blogService.setToken(savedUser.token)
      setUser(savedUser)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const loggedInUser = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBloglistUser', JSON.stringify(loggedInUser)
      )
      blogService.setToken(loggedInUser.token)
      setUser(loggedInUser)
      setUsername('')
      setPassword('')
    } catch {
      showNotification('wrong username or password', 'error')
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification(message)
    setNotificationType(type)
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBloglistUser')
    setUser(null)
  }

  const handleCreateBlog = async (blogObject) => {
    try {
      const createdBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(createdBlog))
      blogFormRef.current.toggleVisibility()
      showNotification(`a new blog ${createdBlog.title} by ${createdBlog.author} added`)
      return true
    } catch {
      showNotification('could not create blog', 'error')
      return false
    }
  }

  const handleLike = async (blogToLike) => {
    const updatedBlog = {
      title: blogToLike.title,
      author: blogToLike.author,
      url: blogToLike.url,
      likes: blogToLike.likes + 1,
      user: blogToLike.user?.id || blogToLike.user,
    }

    try {
      const returnedBlog = await blogService.update(blogToLike.id, updatedBlog)
      setBlogs(blogs.map(blog => blog.id === blogToLike.id ? returnedBlog : blog))
    } catch {
      showNotification('could not update blog likes', 'error')
    }
  }

  const handleRemove = async (blogToRemove) => {
    const confirmed = window.confirm(
      `Remove blog ${blogToRemove.title} by ${blogToRemove.author}?`
    )

    if (!confirmed) {
      return
    }

    try {
      await blogService.remove(blogToRemove.id)
      setBlogs(blogs.filter(blog => blog.id !== blogToRemove.id))
      showNotification(`blog ${blogToRemove.title} removed`)
    } catch {
      showNotification('could not remove blog', 'error')
    }
  }

  if (user === null) {
    return (
      <div>
        <Notification message={notification} type={notificationType} />
        <h2>log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>
              username
              <input
                type="text"
                value={username}
                onChange={({ target }) => setUsername(target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              password
              <input
                type="password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </label>
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  const sortedBlogs = [...blogs].sort((firstBlog, secondBlog) =>
    secondBlog.likes - firstBlog.likes
  )

  return (
    <div>
      <Notification message={notification} type={notificationType} />
      <h2>blogs</h2>
      <p>{user.name} logged in</p>
      <button onClick={handleLogout}>logout</button>
      <Togglable buttonLabel="new blog" ref={blogFormRef}>
        <BlogForm createBlog={handleCreateBlog} />
      </Togglable>
      {sortedBlogs.map(blog =>
        <Blog
          key={blog.id}
          blog={blog}
          updateLikes={handleLike}
          removeBlog={handleRemove}
          user={user}
        />
      )}
    </div>
  )
}

export default App
