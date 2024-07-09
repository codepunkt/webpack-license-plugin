import React from 'react'
import { createRoot } from 'react-dom/client'

const container = document.querySelector('body')
const root = createRoot(container)

root.render(
  React.createElement('h1', {}, ['Hello world']),
)
