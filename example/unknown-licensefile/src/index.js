import React from 'react'
import ReactDOM from 'react-dom'
import SwipableViews from 'react-swipeable-views'

class ShoppingList extends React.Component {
  render() {
    return (
      <div className="shopping-list">
        <h1>Shopping List for {this.props.name}</h1>
        <ul>
          <SwipableViews>
            <li>Instagram</li>
            <li>WhatsApp</li>
            <li>Oculus</li>
          </SwipableViews>
        </ul>
      </div>
    )
  }
}

ReactDOM.render(<ShoppingList name="Mark" />, document.getElementById('root'))
