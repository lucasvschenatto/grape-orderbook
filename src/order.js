"use strict"

const { randomUUID } = require("crypto")

class Order {
  constructor({ side, price, size }) {
    this.id = randomUUID()
    this.timestamp = Date.now()
    this.side = side
    this.price = price
    this.size = size
  }
}

module.exports = { Order }
