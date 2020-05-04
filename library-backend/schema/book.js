const { UserInputError, AuthenticationError, gql, PubSub }  = require('apollo-server')
const Book = require('../models/book')
const Author = require('../models/author')


const pubsub = new PubSub()

const typeDefs = gql`
  extend type Query {
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
  }

  extend type Subscription {
    bookAdded: Book!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String]
    id: ID!
  }

  extend type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]
    ): Book!
  }
`

const resolvers = {
  Query: {
  
    bookCount: () => Book.collection.countDocuments(),
    allBooks: (root, args) => {
      let books
 
      if (args.genre) {
        console.log(args.genre)
        books = Book.find({ genres: { $in: [args.genre.toLowerCase()] }})
          .populate('author')
      }

      if (!args.genre) {
        books = Book.find({})
          .populate('author')
      }

      return books
    }
  },
  
  Mutation: {

    addBook: async (root, args, { currentUser }) => {
  
      const author = await Author.findOne({ name: args.author })
      const book = new Book({ ...args })

      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }

      if (!author) {
        const newAuthor = new Author({ name: args.author })
        newAuthor.books = newAuthor.books.concat(book._id)

        try {
          
          await newAuthor.save()
          book.author = newAuthor._id
          await book.save()

        } catch (error) {

          throw new UserInputError(error.message, {
            invalidArgs: args
          })

        }
        
        const newBook = {
          id: book._id,
          title: book.title,
          published: book.published,
          genres: book.genres,
          author: newAuthor
        }
      
        pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
  
        return newBook
      }
    
      
      book.author = author._id
      author.books = author.books.concat(book._id)

      try {
  
        await book.save()
        await author.save()

      } catch (error) {
        new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      const newBook = {
        id: book._id,
        title: book.title,
        published: book.published,
        genres: book.genres,
        author: author
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
      return newBook
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

module.exports = {
  bookTypes: typeDefs,
  bookResolvers: resolvers
}