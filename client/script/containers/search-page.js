import React, {Component} from 'react'
import { connect } from 'react-redux'
import { venues } from '../actions'

class SearchPage extends Component {
  constructor(props) {
    super(props)
    this.handleInput = this.handleInput.bind(this)
    this.updateLocation = this.updateLocation.bind(this)
    this.state = { location: '' }
  }

  handleInput(e) {
    if (e.keyCode === 13) this.props.changeLocation(this.state.location)
  }

  updateLocation(e) {
    this.setState({ location: e.target.value })
  }

  render() {
    const { location } = this.state
    return <input type="text" placeholder="search" value={location} onChange={this.updateLocation} onKeyDown={this.handleInput} />
  }
}

export default connect(null, {
  changeLocation: venues.changeLocation
})(SearchPage)
