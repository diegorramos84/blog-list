const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => blogs.reduce(
  (sum, blog) =>
  { return blog.likes + sum }, 0)

const favoriteBlog = (blogs) => {
  // assign first blog.likes to max
  // compare with the next blog.likes iteration and keep the higher value
  const favorite = blogs.reduce((fav, blog) => {
    if(fav.likes > blog.likes) {
      return fav
    } else {
      return fav = blog
    }
  })
    return {
      title: favorite.title,
      author: favorite.author,
      likes: favorite.likes
    }

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
