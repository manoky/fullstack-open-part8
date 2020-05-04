import React from 'react'

const Notification = ({ message, color }) => {
  const style = {
    border: 'solid',
    padding: 10,
    borderWidth: 1,
    textAlign: 'center',
    color: `${ color }`
  }
  if (!message) {
    return null
  }

  return (
    <div style={style}>
     {message}
    </div>
  )
}

export default Notification