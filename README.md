# Mining Fees Information API

Service that provides an API to mining pools so they can query for their rewards. This API is not part of the RskJ node but retrieves information from it.

## Requirements

`RskJ node`

`node.js > v8.9.0`

`mongoDB v3.4.10`

```bash
npm install
```

## Configuration

Settings like RskJ node url, mongoDB connection string and API port can be configured at `src/configs/config.json` file.

## Run

Start the gatherer app to fill the database everytime a new block is found on RSK node

```bash
node gatherer.js
```

Start the API server by running

```bash
node server.js
```

For both apps, [logging level](https://github.com/winstonjs/winston#logging-levels) can be adjusted by using the `LOG_LEVEL` env variable. For example, run API with

```bash
LOG_LEVEL=info node server.js
```

## Use

For this example of use, port 8080 is configured and API server is running on localhost.

Fees for block number `1887` and hash `0xa76cd4d5f1ea81f7ead53ada4e78e89cabdab1c87b13f123029507a5a74c7709` can be obtained by the following GET request:

`http://localhost:8080/api/feepayment/block/1887/0xa76cd4d5f1ea81f7ead53ada4e78e89cabdab1c87b13f123029507a5a74c7709`

Payment fees found, example response is

```json
{
    "message": "Payment fees found for block number 1887",
    "value": [
        {
            "sender_tx": "0x5e04a60ef2646a0122082076c6b81e7bf02f019f8c7971d16a485e2a12f126cc",
            "to_address": "0x000000000000000000000000dabadabadabadabadabadabadabadabadaba0001",
            "amount": "0",
            "created_date": "2017-11-16T23:45:49.829Z",
            "block": {
                "number": 1887,
                "hash": "0xa76cd4d5f1ea81f7ead53ada4e78e89cabdab1c87b13f123029507a5a74c7709"
            }
        },
        {
            "sender_tx": "0x5e04a60ef2646a0122082076c6b81e7bf02f019f8c7971d16a485e2a12f126cc",
            "to_address": "0x00000000000000000000000028fdc38c327f4a3bbdf9501fd3a01ac7228c7af7",
            "amount": "12340",
            "created_date": "2017-11-16T23:45:49.835Z",
            "block": {
                "number": 1887,
                "hash": "0xa76cd4d5f1ea81f7ead53ada4e78e89cabdab1c87b13f123029507a5a74c7709"
            }
        }
    ]
}
```

Payment fees not found, response will look like

```json 
{
    "message": "Payment fees not found for block number 1890",
    "value": []
}
``` 
