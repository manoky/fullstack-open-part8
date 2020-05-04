import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const Login = ({ setToken, show, setPage, notify }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      if (error.networkError) {
        notify(error.networkError.result.errors[0].message, 'red')
      }
      if (error.graphQLErrors.length > 0) {
        notify(error.graphQLErrors[0].message, 'red')
      }
    }
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      const genre = result.data.login.userGenre
      setToken(token)
      localStorage.setItem('current-token', token)
      localStorage.setItem('user-genre', genre)
      setPage('authors')
    }
  }, [result.data])// eslint-disable-line

  const handleLogin = async (e) => {
    e.preventDefault()

    await login({ variables: { username, password }})

    setPassword('')
    setUsername('')
  }
  if (!show) {
    return null
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          username: <input
            type='text'
            value={username}
            onChange={({target}) => setUsername(target.value)}
            
          />
        </div>
        <div>
          password: <input
            type='password'
            value={password}
            onChange={({target}) => setPassword(target.value)}
          />
        </div>
        <div>
          <button type='submit'>login</button>
        </div>
      </form>
    </div>
  )
}

export default Login