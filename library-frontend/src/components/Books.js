import React, { useState, useEffect } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'



const Books = (props) => {

  const [sameGenreBooks, setSameGenreBooks] = useState('')
  const books = useQuery(ALL_BOOKS, {
    onError:(error) => {
      if (
        error.networkError &&
        error.networkError.result
      ) {
        props.notify(error.networkError.result.errors[0].message, 'red')
      }
      if (error.graphQLErrors.length > 0) {
        props.notify(error.graphQLErrors[0].message, 'red')
      }
    }
  })

  const [getGenre, result] = useLazyQuery(ALL_BOOKS, {
    onError:(error) => {
      if (error.networkError) {
        props.notify(error.networkError.result.errors[0].message, 'red')
      }
      if (error.graphQLErrors.length > 0) {
        props.notify(error.graphQLErrors[0].message, 'red')
      }
    }
  })


  useEffect(() => {
   
    setSameGenreBooks('')
  },[props.show])

  useEffect(() => {
    if(result.data) {
      setSameGenreBooks(result.data.allBooks)
    }
  }, [result.data])

  const fetchGenre = async (genre) => {
    getGenre({ variables: { genre }})
  }

  if (!props.show) {
    return null
  }

  if (books.loading) {
    return <div>loading ...</div>
  }

  
  const genres =  books.data &&
    books.data.allBooks.reduce((genArr, b) => {
    return genArr = [...genArr, ...b.genres]
  }, [])
  .filter((g,i,genArr) => genArr.indexOf(g) === i)

  const currentBooks = sameGenreBooks 
    ? sameGenreBooks
    : books.data && books.data.allBooks
  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          { currentBooks &&
            currentBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{marginTop: 10}}>
        {genres && genres.map(genre => (
          <button
          onClick={() => fetchGenre(genre)}
            key={genre}
          >
            {genre}
          </button>
          
        ))}
        <button onClick={() => setSameGenreBooks('')}>
            all books
          </button>
      </div>
    </div>
  )
}

export default Books