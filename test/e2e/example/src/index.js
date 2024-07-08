import React from 'react'
import ReactDOM from 'react-dom'

// just for test the NOTICE file extraction
import { pi } from 'mathjs'

ReactDOM.render(
  React.createElement('div', {}, [
    React.createElement('h1', {}, ['Hello world']),
    React.createElement('p', {}, ['This is the value of pi: ', pi]),
  ]),
  document.querySelector('body'),
)
