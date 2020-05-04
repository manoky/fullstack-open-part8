import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
 fragment BookDetails on Book {
   id
  title
  author {
    id
    name
    born
    bookCount
  }
  published
  genres
 }
`

export const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
`

export const ADD_BOOK = gql`
  mutation addNewBook(
    $title: String!,
    $author: String!,
    $published: Int!,
    $genres: [String!]
  ) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
     ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const EDIT_AUTHOR = gql`
  mutation editAuthor(
    $name: String!,
    $setBornTo: Int!
  ) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo
    ) {
      id
      name
      born
      bookCount
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
      userGenre
    }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const AUTHOR_EDITTED = gql`
  subscription {
    authorEditted {
      id
      name
      bookCount
      born
    }
  }
`