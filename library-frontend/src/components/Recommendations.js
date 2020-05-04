import React from 'react'

const Recommendations = ({ show, recommendations }) => {

  if (!show) {
    return null
  }

  if (recommendations.loading) {
    return <div>loading ...</div>
  }

  const books = recommendations.data &&
    recommendations.data.allBooks
  
  return (
    <div>
      <h2>Recommendations</h2>

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
          {books && books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations