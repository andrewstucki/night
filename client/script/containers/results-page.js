import React, {Component} from 'react'
import { connect } from 'react-redux'

import { venues } from '../actions'
import Venue from '../components/venue'

class ResultsPage extends Component {
  constructor(props) {
    super(props)
    if (props.venues.length === 0) this.props.loadVenues(props.location)
    this.attend = this.attend.bind(this)
    this.unattend = this.unattend.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.updateLocation = this.updateLocation.bind(this)
    this.state = { location: this.props.location, venues: this.props.venues }
  }

  componentWillReceiveProps(props) {
    if (props.venues.length === 0) this.props.loadVenues(props.location)
    this.setState({ location: props.location, venues: props.venues })
  }

  handleInput(e) {
    if (e.keyCode === 13) this.props.changeLocation(this.state.location)
  }

  attend(venue) {
    this.props.attend(venue)
  }

  unattend(venue) {
    this.props.unattend(venue)
  }

  updateLocation(e) {
    this.setState({ location: e.target.value })
  }

  render() {
    const { location, venues } = this.state
    const { user, isAuthenticated } = this.props
    const attend = this.attend
    const unattend = this.unattend
    return (
      <div>
        <input type="text" placeholder="search" value={location} onChange={this.updateLocation} onKeyDown={this.handleInput} />
        <ul>
          {venues.map(venue => <Venue key={venue.id} venue={venue} user={user} authenticated={isAuthenticated} attend={attend} unattend={unattend} />)}
        </ul>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    location: state.location,
    venues: Object.values(state.cache.venues).filter(venue => state.location === venue.location),
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated
  }
}

export default connect(mapStateToProps, {
  changeLocation: venues.changeLocation,
  loadVenues: venues.find,
  attend: venues.attend,
  unattend: venues.unattend
})(ResultsPage)
