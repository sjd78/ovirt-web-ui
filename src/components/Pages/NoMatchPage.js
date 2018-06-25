import React from 'react'
import { RouterPropTypeShapes } from '../../propTypeShapes'

const NoMatchPage = ({ match, location, history }) => {
  return <div>
    <p>The route you requested is not valid. Try again.</p>
  </div>
}
NoMatchPage.propTypes = {
  match: RouterPropTypeShapes.match,
  location: RouterPropTypeShapes.location,
  history: RouterPropTypeShapes.history,
}

export { NoMatchPage }
