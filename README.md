# Mining Fees Information API

## Run

Start the gatherer app to fill the database everytime a new block is found on RSK node

```bash
node gatherer.js
```

Start the API server by running

```bash
node server.js
```

## Use

API port can be changed on config.json file. For this example of use, 8080 is configured.

Fees for block number 1887 and hash 0xa76cd4d5f1ea81f7ead53ada4e78e89cabdab1c87b13f123029507a5a74c7709 can be obtained by the following GET request:

`http://localhost:8080/api/feepayment/block/1887/0xa76cd4d5f1ea81f7ead53ada4e78e89cabdab1c87b13f123029507a5a74c7709`

When payments for the block are found, a sample response is

```json
[
    {
        "sender_tx": "0x5e04a60ef2646a0122082076c6b81e7bf02f019f8c7971d16a485e2a12f126cc",
        "to_address": "0x000000000000000000000000dabadabadabadabadabadabadabadabadaba0001",
        "amount": 0,
        "created_date": "2017-11-16T23:45:49.829Z",
        "block": {
            "number": 1887,
            "hash": "0xa76cd4d5f1ea81f7ead53ada4e78e89cabdab1c87b13f123029507a5a74c7709"
        }
    },
    {
        "sender_tx": "0x5e04a60ef2646a0122082076c6b81e7bf02f019f8c7971d16a485e2a12f126cc",
        "to_address": "0x00000000000000000000000028fdc38c327f4a3bbdf9501fd3a01ac7228c7af7",
        "amount": 0,
        "created_date": "2017-11-16T23:45:49.835Z",
        "block": {
            "number": 1887,
            "hash": "0xa76cd4d5f1ea81f7ead53ada4e78e89cabdab1c87b13f123029507a5a74c7709"
        }
    }
]
```

When payments are not found ``` [] ``` will be returned.
