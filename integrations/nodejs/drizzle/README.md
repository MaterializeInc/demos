# Node.js + Drizzle + Materialize

This is a simple example of how to use Drizzle with Node.js and Materialize.

## Setup

1. Install dependencies: `npm install`
1. Prepare the `.env` file: `cp .env.example .env`
1. Update the `.env` file with your Materialize credentials
1. (Optional) If you don't have any data in Materialize yet, run the [Get Started Materialize demo](https://materialize.com/docs/get-started/quickstart/)
1. Run the app: `node index.js`

Output should look like:

```json
[
  {
    id: '20',
    buyer: '3334',
    auction_id: 2,
    amount: 44,
    bid_time: 2023-10-04T08:27:14.614Z,
    item: 'Custom Art',
    seller: '1592'
  },
  {
    id: '70',
    buyer: '2763',
    auction_id: 7,
    amount: 90,
    bid_time: 2023-10-04T08:27:15.946Z,
    item: 'Custom Art',
    seller: '1509'
  },
  ...
]
```
