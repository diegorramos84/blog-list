const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => blogs.reduce(
  (sum, blog) =>
  { return blog.likes + sum }, 0)

module.exports = {
  dummy,
  totalLikes,
}
