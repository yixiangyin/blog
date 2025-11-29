const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: "Payphone",
    author: "Maroon 5",
    url: "https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://en.wikipedia.org/wiki/Payphone_(song)&ved=2ahUKEwiq17qr3dmQAxUASmwGHd3yOvwQFnoECCAQAQ&usg=AOvVaw0eIqsrRXFwEPtyKVZtbk8o",
    likes: 10,
  },
  {
    title: "Happy",
    author: "Peter",
    url: "",
    likes: 0,
  },
]

// const nonExistingId = async () => {
//   const note = new Note({ content: 'willremovethissoon' })
//   await note.save()
//   await note.deleteOne()

//   return note._id.toString()
// }



const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
}
