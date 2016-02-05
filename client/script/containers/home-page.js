import React, {Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import ResultsPage from './results-page'
import SearchPage from './search-page'

class HomePage extends Component {
  render() {
    if (this.props.location) return <ResultsPage />
    return <SearchPage />
  }
}

HomePage.propTypes = {
  location: PropTypes.string
}

function mapStateToProps(state) {
  return {
    location: state.location
  }
}

export default connect(mapStateToProps, {})(HomePage)
