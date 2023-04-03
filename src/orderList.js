"use strict"

const { ORDER_SIDE } = require("./constants")

class OrderList {
  constructor(side) {
    this.side = side
    this.list = []
  }

  add(order) {
    const index = this.list.findIndex((otherOrder) => {
      //buy list is sorted descending based on price and arrival ordering (arrival order matches timestamp order)
      if (this.side === ORDER_SIDE.BUY) {
        return otherOrder.price >= order.price
      }
      //sell list is sorted ascending based on price and arrival ordering (arrival order matches timestamp order)
      if (this.side === ORDER_SIDE.SELL) {
        return otherOrder.price <= order.price
      }
      return false
    })

    if (index >= 0) {
      this.list.splice(index, 0, order)
    } else {
      this.list.push(order)
    }
    return order
  }

  getBestPrice() {
    return this.list[this.list.length - 1].price
  }

  pop() {
    return this.list.pop()
  }

  hasOrders() {
    return Boolean(this.list.length)
  }
}

module.exports = { OrderList }
