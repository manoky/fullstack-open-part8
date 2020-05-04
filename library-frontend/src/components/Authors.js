  
import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import Select from 'react-select'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'


const Authors = (props) => {

  const authors = useQuery(ALL_AUTHORS, {
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
  const [author, setAuthor] = useState('')
  const [date, setDate] = useState('')
  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    update:(store, response) => {
      props.updateCacheWith(response.data.editAuthor)
    },
    onError: (error) => {
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

  if (!props.show) {
    return null
  }

  if (authors.loading) {
    return <div>...loading</div>
  }
  
  const options = authors.data && 
    authors.data.allAuthors.map(a => {
      return { value: a.name, label: a.name }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await editAuthor({ variables: { name: author.value, setBornTo: parseInt(date) }})

    setDate('')
    setAuthor('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          { authors.data &&
            authors.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h3>Set birthyear</h3>
      <form onSubmit={handleSubmit}>
        <Select
          value={author}
          onChange={(option) => setAuthor(option)}
          options={options}
        />
        <div>
            born {' '}
            <input
              type='number'
              onChange={({target}) => setDate(target.value)}
              value={date}
            />
        </div>
          <button type='submit'>
            update author
          </button>
      </form>
    </div>
  )
}

export default Authors
