import { constants, venues } from '../actions'

export default class Socket {
  constructor(url, store) {
    const socketProtocol = window.location.protocol === "https:" ? 'wss' : 'ws'
    this.websocket = new WebSocket(`${socketProtocol}://${url}`, 'night')
    this.store = store
    const self = this
    this.websocket.onmessage = event => self.handleMessage(JSON.parse(event.data))
  }

  handleMessage(data) {
    if (data.type === 'update') return this.store.dispatch(venues.update(data.venue))
  }

  close() {
    this.websocket.close()
  }
}
