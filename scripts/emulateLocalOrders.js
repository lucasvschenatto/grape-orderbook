const { ORDER_SIDE } = require("../src/constants")
const { Order } = require("../src/order")
const { OrderBook } = require("../src/orderBook")

function randomOrderProps() {
  return {
    side: Math.random() < 0.5 ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
    price: Math.random() * 10,
    size: Math.round(Math.random() * 100),
  }
}

const orderBook = new OrderBook()
const orders = new Array(30).fill(null).map(randomOrderProps)
for (const order of orders) {
  const registeredOrder = new Order(order)
  orderBook.addToOrderPool(registeredOrder)
}
