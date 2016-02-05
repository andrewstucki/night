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
    return (
      <form className="form-horizontal">
        <div className="form-group">
          <label htmlFor="search" className="col-sm-1 col-sm-offset-1 control-label">Location</label>
          <div className="col-sm-9">
            <input type="text" placeholder="search" id="search" value={location} onChange={this.updateLocation} onKeyDown={this.handleInput} className="searchbox form-control" />
          </div>
        </div>
      </form>
    )
  }
}

export default connect(null, {
  changeLocation: venues.changeLocation
})(SearchPage)
