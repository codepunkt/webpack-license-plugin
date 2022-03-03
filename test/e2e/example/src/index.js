import React from 'react'
import ReactDOM from 'react-dom'
import {format} from 'date-fns'

ReactDOM.render(
  React.createElement('h1', {}, ['Hello world']),
  document.querySelector('body')
)

console.log(format(new Date(), "'Today is a' eeee"))
