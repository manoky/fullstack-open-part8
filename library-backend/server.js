const { ApolloServer, gql, makeExecutableSchema } = require('apollo-server')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { merge } = require('lodash')
const User = require('./models/user')
const { authorTypes, authorResolvers } = require('./schema/author')
const { bookTypes, bookResolvers } = require('./schema/book')
const { userTypes, userResolvers } = require('./schema/user')

const MONGODB_URI = process.env.MONGODB_URI

const JWT_SECRET = process.env.JWT_SECRET

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(() => {
    console.log('connect to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message)
  })

  mongoose.set("debug", (collectionName, method, query, doc) => {
    console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});


const Query = gql`
  type Query {
    _empty: String
  }
`

const Mutation = gql`
  type Mutation {
    _empty: String
  }
`

const Subscription = gql`
  type Subscription
`

const schema = makeExecutableSchema({
  typeDefs: [
    Query,
    Mutation,
    Subscription,
    authorTypes,
    bookTypes,
    userTypes
  ],

  resolvers: merge( authorResolvers, bookResolvers, userResolvers),
})


const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    
    if (auth && auth.toLowerCase().startsWith('bearer')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )

      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})