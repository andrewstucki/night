import Factory from 'factory-girl'
import hat from 'hat'
import mongoose from 'mongoose'

import { User } from '../../../server/models'

Factory.define('user', User, {
  email: Factory.sequence(n => `user${n}@example.com`),
  username: Factory.sequence(n => `username${n}`),
  name: Factory.sequence(n => `User ${n}`),
  password: 'password',
  confirmed: true,
  confirmationToken: () => hat(),
  sessionToken: () => hat()
})

export default Factory
