import React, {Component, PropTypes} from 'react'

export default class Venue extends Component {
  constructor(props) {
    super(props)
    this.preventDefault = this.preventDefault.bind(this)
    this.handleAttendance = this.handleAttendance.bind(this)
  }

  preventDefault(e) {
    e.preventDefault()
  }

  handleAttendance(e) {
    e.preventDefault()
    if (!this.props.user.confirmed) return
    if (this.props.venue.attendees.indexOf(this.props.user.username) === -1) return this.props.attend(this.props.venue)
    return this.props.unattend(this.props.venue)
  }

  render() {
    const { name, attendees, url, image, snippet } = this.props.venue
    const handler = this.props.authenticated ? this.handleAttendance : this.preventDefault
    return (
      <li>
        <a href={url}>{name}</a>
        <span onClick={handler}>{attendees.length} attendee(s)</span>
        <img src={image} />
        <span>{snippet}</span>
      </li>
    )
  }
}

Venue.propTypes = {
  venue: PropTypes.shape({
    name: PropTypes.string.isRequired,
    attendees: PropTypes.array.isRequired,
    url: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    snippet: PropTypes.string.isRequired
  }).isRequired,
  authenticated: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  attend: PropTypes.func.isRequired,
  unattend: PropTypes.func.isRequired
}
