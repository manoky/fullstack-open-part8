const { UserInputError, AuthenticationError, gql, PubSub }  = require('apollo-server')
const Author = require('../models/author')
const Book = require('../models/book')

const pubsub = new PubSub()

const typeDefs = gql`

  extend type Query {
    allAuthors: [Author!]!
    authorCount: Int!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }

  extend type Mutation {
 
    editAuthor(
      name: String!,
      setBornTo: Int!
    ): Author!
  }

  extend type Subscription {
    authorEditted: Author!
  }
`

const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
  
    allAuthors: () =>  Author.find({}),
  },
  Author: {
    bookCount: (root) =>  root.books.length,
    id: root => root._id,
    name: root => root.name
  },

  Mutation: {
    editAuthor: async (root, args, { currentUser }) => {
      const author = await Author.findOne({ name: args.name })
      
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }
    
      if (!author) {
        return null
      }

      author.born = args.setBornTo

      try {
        await author.save()
      } catch (error) {
        throw UserInputError(error.message, {
          invalidArgs: args
        })
      }


      pubsub.publish('AUTHOR_EDITTED', { authorEditted: author })
      return author
    },
  },
  Subscription: {
    authorEditted: {
      subscribe: () => pubsub.asyncIterator(['AUTHOR_EDITTED'])
    } 
  }

}

module.exports = {
  authorTypes: typeDefs,
  authorResolvers: resolvers
}