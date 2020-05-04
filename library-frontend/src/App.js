
import React, { useState, useEffect } from 'react'
import { useApolloClient, useSubscription, useLazyQuery } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommendations from './components/Recommendations'
import { BOOK_ADDED, ALL_BOOKS, ALL_AUTHORS, AUTHOR_EDITTED } from './queries'
import Notification from './components/Notification'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState('')
  const [notice, setNotice] = useState({message: '', color: ''})
  const client = useApolloClient()

  useEffect(() => {
    const localToken = localStorage.getItem('current-token')
    setToken(localToken)
  }, [])

  useEffect(() => {
    const localToken = localStorage.getItem('current-token')
    setToken(localToken)
    if (!token && !localToken) {
      setPage('login')
    }
  }, [page])// eslint-disable-line

  const [recommendations, result] = useLazyQuery(ALL_BOOKS, {
    onError: (error) => {
      if (error.networkError) {
        notify(error.networkError.result.errors[0].message, 'red')
      }
      if (error.graphQLErrors.length > 0) {
        notify(error.graphQLErrors[0].message, 'red')
      }
    }
  })

  const fetchRecommecations = () => {
    const genre = localStorage.getItem('user-genre')
    recommendations({ variables: { genre }})
    setPage('recommend')
  }


  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('login')
  }
  const notify = (message, color) => {
    setNotice({ message, color})
    setTimeout(() => setNotice({ message: '', color: '' }),5000)
  }

  const updateCacheWith = (data) => {
    const includedIn = (set, object) =>
    set.map(b => b.id).includes(object.id)

    const booksInStore = client.readQuery({ query: ALL_BOOKS })
    const authorsInStore = client.readQuery({ query: ALL_AUTHORS })

    if (data.title) {
      const author = data.author
      const filterAuthors = authorsInStore.allAuthors.filter(a => a.id !== author.id)
    
      if (!includedIn(booksInStore.allBooks, data)) {
        client.writeQuery({
          query: ALL_BOOKS,
          data: { allBooks: booksInStore.allBooks.concat(data)}
        })
      }

      client.writeQuery({
        query: ALL_AUTHORS,
        data: { allAuthors: filterAuthors.concat(author)}
      })
    } 
    
    if (data.name) {
      const filterAuthors = authorsInStore.allAuthors.filter(a => a.id !== data.id)
      console.log(filterAuthors, data)
      client.writeQuery({
        query: ALL_AUTHORS,
        data: { allAuthors: filterAuthors.concat(data)}
      })

      console.log(authorsInStore.allAuthors, data)
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      notify(`Book ${addedBook.title} was added`, 'green')
      updateCacheWith(addedBook)
    }
  })

  useSubscription(AUTHOR_EDITTED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const author = subscriptionData.data.authorEditted
      console.log(author)
      notify(`Author ${author.name} details changed`, 'green')
      updateCacheWith(author)
    }
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={fetchRecommecations}>recommend</button>
        {
          token 
          ? <button onClick={logout}>logout</button>
          : <button onClick={() => setPage('login')}>login</button>
        }
      </div>
      <Notification
        message={notice.message}
        color={notice.color}
      />

      <Authors
        show={page === 'authors'}
        notify={notify}
        updateCacheWith={updateCacheWith}
      />

      <Books
        show={page === 'books'}
        notify={notify}
      />

      <NewBook
        show={page === 'add'}
        updateCacheWith={updateCacheWith}
        notify={notify}
      />
  
      <Login
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
        notify={notify}
      />

      <Recommendations
        show={page === 'recommend'}
        recommendations={result}
      />

    </div>
  )
}

export default App