"use strict"

const { PeerRPCServer, PeerRPCClient } = require("grenache-nodejs-http")
const Link = require("grenache-nodejs-link")
const { ADD_ORDER_SERVICE, ORDER_SIDE } = require("./constants")
const { Order } = require("./order")
const { OrderBook } = require("./orderBook")

const link = new Link({
  grape: "http://127.0.0.1:30001",
})
link.start()
const server = new PeerRPCServer(link, {
  timeout: 300000,
})
const peer = new PeerRPCClient(link, {})

const book = new OrderBook()

server.init()
peer.init()

const port = 1024 + Math.floor(Math.random() * 1000)
const service = server.transport("server")
service.listen(port)
link.startAnnouncing(ADD_ORDER_SERVICE, service.port)
console.log("Listening to port:", port)
console.log("Listening to service:", ADD_ORDER_SERVICE)

service.on("request", (rid, serviceName, payload, handler) => {
  if (serviceName === ADD_ORDER_SERVICE) {
    book.addToOrderPool(payload)
    handler.reply(null, {
      msg: `Peer ${port} confirmed: ${JSON.stringify(payload)}`,
    })
  }
})

setInterval(() => {
  const order = new Order(getRandomOrderProps())
  console.log(`Created order:`, order)
  book.addToOrderPool(order)
  peer.request(
    ADD_ORDER_SERVICE,
    order,
    { timeout: 10000 },
    (err, response) => {
      err && console.error(err)
      response && console.log(response)
    }
  )
}, 3000)

setInterval(() => {
  link.lookup(ADD_ORDER_SERVICE, { retry: 5 }, (err, peers) => {
    console.log("Peers are:", peers)
  })
}, 1000)

function shutdownGracefully() {
  console.info("\nShuting down")
  link.stop()
  process.exit(0)
}
function getRandomOrderProps() {
  return {
    side: Math.random() < 0.5 ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
    price: Math.random() * 10,
    size: Math.round(Math.random() * 100),
  }
}
process.on("SIGINT", shutdownGracefully)
process.on("SIGTERM", shutdownGracefully)
