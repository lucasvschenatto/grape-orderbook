"use strict"

const { ORDER_SIDE, THRESHOLD_TIME } = require("./constants")
const { Order } = require("./order")
const { OrderList } = require("./orderList")

class OrderBook {
  constructor() {
    this.buys = new OrderList(ORDER_SIDE.BUY)
    this.sells = new OrderList(ORDER_SIDE.SELL)
    this.orderPools = new Map()
    this.orderIds = new Set()
  }

  addToOrderPool(order) {
    if (this.orderIds.has(order.id)) {
      // console.log("Rejected, order already processed:",order)
      return
    } else {
      this.orderIds.add(order.id)
    }

    const now = Date.now()
    if (order.timestamp < now - THRESHOLD_TIME) {
      // console.log("Rejected, order is too old:",order)
      return
    }
    if (this.orderPools.has(order.timestamp)) {
      const pool = this.orderPools.get(order.timestamp)
      pool.push(order)
    } else {
      const orderPool = [order]
      this.orderPools.set(order.timestamp, orderPool)
      const waitTime = order.timestamp + THRESHOLD_TIME - now
      setTimeout(() => {
        // at this time no new orders are accepted, so create a new array to prevent that
        const sortedPool = [...orderPool]
        sortedPool.sort()
        // uncomment this to see logs of order pools being scheduled
        // console.log(
        //   "running orders",
        //   sortedPool.length,
        //   order.timestamp,
        //   sortedPool
        // )
        sortedPool.forEach((orderInPool) => {
          this.execute(orderInPool)
        })
      }, waitTime)
    }
  }

  execute(order) {
    if (this.canExecute(order)) {
      this.executeMatching(order)
    } else {
      const thisSide = this.getThisSide(order)
      thisSide.add(order)
    }
  }

  executeMatching(order) {
    const otherSideBestOrder = this.popOtherSideBestOrder(order)
    const rest = otherSideBestOrder.size - order.size

    //if there is a rest, create new order with rest and execute it
    if (rest !== 0) {
      const seed = rest > 0 ? otherSideBestOrder : order
      const newSize = Math.abs(rest)
      const restOrder = new Order({
        ...seed,
        size: newSize,
      })
      this.execute(restOrder)
    }
  }

  canExecute(order) {
    const otherSide = this.getOtherSide(order)
    if (order.side === ORDER_SIDE.BUY) {
      return (
        otherSide.hasOrders() &&
        order.price >= this.getOtherSideBestPrice(order)
      )
    } else {
      return (
        otherSide.hasOrders() &&
        order.price <= this.getOtherSideBestPrice(order)
      )
    }
  }

  popOtherSideBestOrder(order) {
    const otherSide = order.side === ORDER_SIDE.BUY ? this.sells : this.buys
    return otherSide.pop()
  }

  getOtherSideBestPrice(order) {
    const otherSide = this.getOtherSide(order)
    return otherSide.getBestPrice()
  }

  getOtherSide(order) {
    return order.side === ORDER_SIDE.BUY ? this.sells : this.buys
  }

  getThisSide(order) {
    return order.side === ORDER_SIDE.BUY ? this.buys : this.sells
  }
}

module.exports = { OrderBook }
