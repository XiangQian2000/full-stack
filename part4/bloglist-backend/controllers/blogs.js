const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog
            .find({})
            .populate('user', {
                username: 1,
                name: 1,
            })

        response.json(blogs)
    } catch (error) {
        next(error)
    }
})

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
    try {
        const user = request.user

        const { title, author, url, likes } = request.body

        const blog = new Blog({
            title,
            author,
            url,
            likes,
            user: user._id,
        })

        const savedBlog = await blog.save()

        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        response.status(201).json(savedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id)

        if (!blog) {
            return response.status(404).end()
        }

        if (!blog.user || blog.user.toString() !== request.user.id.toString()) {
            return response.status(401).json({
                error: 'only the creator can delete this blog',
            })
        }

        await blog.deleteOne()
        response.status(204).end()
    } catch (error) {
        next(error)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    try {
        const body = request.body

        const updatedBlog = await Blog.findByIdAndUpdate(
            request.params.id,
            {
                title: body.title,
                author: body.author,
                url: body.url,
                likes: body.likes,
            },
            { returnDocument: 'after' }
        )

        response.json(updatedBlog)
    } catch (error) {
        next(error)
    }
})

module.exports = blogsRouter
