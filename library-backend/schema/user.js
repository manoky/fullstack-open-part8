const { UserInputError, AuthenticationError, gql }  = require('apollo-server')
require('dotenv').config()
const User = require('../models/user')
const Book = require('../models/book')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

const typeDefs = gql`
  extend type Query {
    me: User
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!,
    userGenre: String
  }


  extend type Mutation {

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    me: async (root, args, {currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }

      const user = await User.findById(currentUser._id)

      return user
    }
  },

  Mutation: {
    createUser: async (root, args) => {
      const user = new User({ ...args })

      try {
        await  user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return user
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if (!user || args.password !== 'something') {
        throw new UserInputError("Wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET), userGenre: user.favoriteGenre }
    }
  }
}

module.exports = {
  userTypes: typeDefs,
  userResolvers: resolvers
}