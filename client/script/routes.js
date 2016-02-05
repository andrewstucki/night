
import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './containers/app'
import HomePage from './containers/home-page'
import LoginPage from './containers/login-page'
import SignupPage from './containers/signup-page'

import { requireAuth, noAuth } from './components/auth'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={HomePage} />
    <Route path='/login' name='login' component={noAuth(LoginPage)} />
    <Route path='/signup' name='signup' component={noAuth(SignupPage)} />
  </Route>
)
