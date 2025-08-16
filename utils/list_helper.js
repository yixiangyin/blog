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

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const authorLikes = {}
  for (const blog of blogs) {
    authorLikes[blog.author] = (authorLikes[blog.author] || 0) + blog.likes
  }

  let topAuthor = null
  let maxLikes = 0
  for (const author in authorLikes) {
    if (authorLikes[author] > maxLikes) {
      topAuthor = author
      maxLikes = authorLikes[author]
    }
  }
  return {
    author: topAuthor,
    likes: maxLikes,
  }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
