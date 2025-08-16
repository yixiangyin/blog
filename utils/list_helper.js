const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((fav, blog) => blog.likes > fav.likes ? blog : fav)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const authorCounts = {}

  for (const blog of blogs) {
    authorCounts[blog.author] = (authorCounts[blog.author] || 0) + 1
  }

  let topAuthor = null
  let maxBlogs = 0
  for (const author in authorCounts) {
    if (authorCounts[author] > maxBlogs) {
      topAuthor = author
      maxBlogs = authorCounts[author]
    }
  }
  return {
    author: topAuthor,
    blogs: maxBlogs,
  }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs
}
