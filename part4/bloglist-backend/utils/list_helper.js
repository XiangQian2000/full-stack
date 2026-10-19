const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const favorite = blogs.reduce((currentFavorite, blog) => {
    return blog.likes > currentFavorite.likes ? blog : currentFavorite
  })

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const counts = {}

  blogs.forEach((blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })

  const [author, count] = Object.entries(counts).reduce(
    (most, entry) => (entry[1] > most[1] ? entry : most)
  )

  return {
    author,
    blogs: count,
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const likesByAuthor = {}

  blogs.forEach((blog) => {
    likesByAuthor[blog.author] =
      (likesByAuthor[blog.author] || 0) + blog.likes
  })

  const [author, likes] = Object.entries(likesByAuthor).reduce(
    (most, entry) => (entry[1] > most[1] ? entry : most)
  )

  return {
    author,
    likes,
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}