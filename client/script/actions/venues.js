import * as Constants from './constants'
import { api, handleError } from './api'

export function find(location) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.VENUES_REQUEST })
    return api(`/find/${location}`)
      .then(json => dispatch({ type: Constants.VENUES_SUCCESS, entity: 'venues', value: json }))
      .catch(err => handleError(dispatch, Constants.VENUES_FAILURE, err))
  }
}

export function attend(venue) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.ATTEND_REQUEST })
    return api(`/venues/${venue.id}`, { method: "post", authentication: getState().auth.user.token })
      .then(json => dispatch({ type: Constants.ATTEND_SUCCESS }))
      .catch(err => handleError(dispatch, Constants.ATTEND_FAILURE, err))
  }
}

export function unattend(venue) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.UNATTEND_REQUEST })
    return api(`/venues/${venue.id}`, { method: "delete", authentication: getState().auth.user.token })
      .then(json => dispatch({ type: Constants.UNATTEND_SUCCESS }))
      .catch(err => handleError(dispatch, Constants.UNATTEND_FAILURE, err))
  }
}

export function update(venue) {
  return { type: Constants.VENUE_UPDATE, venue }
}

export function changeLocation(location) {
  return { type: Constants.CHANGE_LOCATION, location }
}
