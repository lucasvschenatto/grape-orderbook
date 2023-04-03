# Implementation

## Strategy

The strategy consists of implementing a trusted distributed network of orderbook nodes. If they were not to trust each other, more advanced techniques for consensus would be required.
It is not on the plan to attempt to make it robust (like a blockchain), given the constraints. The idea is to use a threshold waiting time (ie: 3 seconds) before executing orders. This way, nodes can stay sync if they communicate orders to peers and they don't loose connection or do not experiment network delays larger than the defined threshold.
It also doesn't cover the situation where a node is left behind (lets say it went offline for 10 seconds) and needs to catch up with the others. A mechanism for copying the current orderbook from other nodes could address this problem.

Start by implementing a centralized single-node order-book. To prepare it to run distributed, create a mechanism where new orders wait for a threshold time prior to execution (involves adding a pool of orders to run, such that each pool only has orders of the same timestamp and are scheduled to execute sequentially after the time elapsed). Only execute an order after the threshold has passed.

Implement a node that is both server and client to operate on the network. On the node perspective, append each new order to its own orderbook and replicate to others, if the order id is not already in the orderbook (it applies for both orders created by itself and received from others). The node receives/creates orders and execute them on the waiting mechanism. It should also reject received orders older than threshold (ie: 3 seconds).
If there is a race condition, the orders were not executed yet, so it is a matter of ordering them by timestamp and them executing. If there is a tie in timestamp, sort ASCII character order by entire object.

## Tasks

- [x] Start by implementing a centralized order book;
- [x] Create a mechanism where new orders wait for a threshold time (ie: 3 seconds) prior to execution (involves a stack of orders to run, that need to be ordered by timestamp, and each entry in the stack needs the timestamp and a list of orders on that timestamp);
- [x] Only execute the order after that time;
- [x] If there is a race condition, the orders were not executed yet, so it is a matter of ordering them. If there is a tie in timestamp, sort ASCII character order by entire object;
- [x] Reject orders with timestamp older than threshold (ie: 3 seconds);
- [x] Implement a node that is both server and client to operate on the network;
- [x] Let the node receive orders and execute them on the waiting mechanism;
- [x] Let the node propagate created orders, similar to a gossip protocol;
- [ ] Only propagate if order was not already in the book and the order was not rejected;
- [ ] Create script that starts a node and waits for user to prompt orders.

## Future Tasks Ideas

- [ ] Add test coverage;
- [ ] Change current logging for a more elegant and robust strategy;
- [ ] Create a mechanism for a node to catch up with other nodes (for either a node that starts after the orderbook had the first order or a node that stayed behind);
- [ ] Create a confirmation mechanism where the order waits for an ammount of peers to confirm it