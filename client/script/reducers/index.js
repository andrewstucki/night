import omit from 'lodash/object/omit'
import { routerStateReducer as router } from 'redux-router'
import { combineReducers } from 'redux'

import { constants, flash } from '../actions'

function handleCache(state, entity, value) {
  let flagLoaded = false
  let newEntities = {}
  if (Array.isArray(value)) {
    flagLoaded = true
    value.forEach(newEntity => {
      newEntities[newEntity.id] = newEntity
    })
  } else {
    newEntities[value.id] = value
  }
  const mergedEntities = Object.assign({}, state[entity], newEntities)
  let newState = {}
  if (flagLoaded) newState[`${entity}Loaded`] = true
  newState[entity] = mergedEntities
  return Object.assign({}, state, newState)
}

function removeCache(state, entity, value) {
  let newState = {}
  newState[entity] = omit(state[entity], value)
  return Object.assign({}, state, newState)
}

// Updates authentication state
function auth(state = { isAuthenticated: false, user: {} }, action) {
  const { type, value } = action
  switch (type) {
  case constants.LOGIN_SUCCESS:
    localStorage.setItem("token", value.token)
    return {
      isAuthenticated: true,
      user: value
    }
  case constants.LOGOUT_SUCCESS:
  case constants.LOGIN_FAILURE:
    localStorage.removeItem("token")
    return {
      isAuthenticated: false,
      user: {}
    }
  default:
    return state
  }
}

function cache(state = { users: {}, venues: {}, venuesLoaded: false, usersLoaded: false }, action) {
  const { type, entity, value, venue } = action
  switch(type) {
  case constants.VENUES_SUCCESS:
  case constants.USER_ADD:
  case constants.USER_SUCCESS:
  case constants.USERS_SUCCESS:
    return handleCache(state, entity, value)
  case constants.USER_REMOVE:
    return removeCache(state, entity, value)
  case constants.VENUE_UPDATE:
    if (!state.venues[venue.id]) return state
    return handleCache(state, 'venues', venue)
  default:
    return state
  }
}

function message(state = null, action) {
  const { type, value, error } = action

  if (type === constants.RESET_MESSAGE || type === "@@reduxReactRouter/routerDidChange") { // reset every route change
    return null
  } else if (type === constants.SET_MESSAGE) {
    return value
  } else if (type === constants.SIGNUP_SUCCESS || type === constants.RESEND_SUCCESS) {
    return {
      type: flash.SUCCESS,
      message: value.message
    }
  } else if (error) {
    return {
      type: flash.ERROR,
      message: error
    }
  }

  return state
}

function location(state = null, action) {
  if (action.type === constants.CHANGE_LOCATION) {
    localStorage.setItem("location", action.location)
    return action.location
  }
  return state
}

export default combineReducers({
  location,
  cache,
  auth,
  message,
  router
})
