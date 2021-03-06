import React, { Component } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'

function generateAuthWrapper(Component, authCheck, renderCheck) {
  class AuthenticatedComponent extends Component {
    componentWillMount() {
      authCheck(this.props)
    }

    componentWillReceiveProps(nextProps) {
      authCheck(nextProps)
    }

    render() {
      let node = ""
      if (renderCheck(this.props)) node = <Component {...this.props} />
      return ( <div>{node}</div> )
    }
  }

  const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user
  })

  return connect(mapStateToProps)(AuthenticatedComponent)
}

export function requireAuth(Component, confirmation) {
  return generateAuthWrapper(Component, function(props) {
    if (!props.isAuthenticated || (!confirmation && props.user.confirmed)) return props.dispatch(pushState(null, '/login'))
  }, function(props) {
    if (typeof confirmation === 'undefined') return props.isAuthenticated
    return props.isAuthenticated && (!confirmation || props.user.confirmed)
  })
}

export function noAuth(Component) {
  return generateAuthWrapper(Component, function(props) {
    if (props.isAuthenticated) {
      props.dispatch(pushState(null, '/'))
    }
  }, function(props) {
    return !props.isAuthenticated
  })
}
