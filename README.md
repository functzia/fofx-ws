# fofx-ws

An input/output plugin for WebSockets for [fofx](https://github.com/functzia/fofx)

- **type:** `"ws"`
- **params (these go in your _plugins.json_):**
  - **port [int]** this is the port your server listens on (default: 8080)
- **input params (these go in your _nano.json_ input key)**:
  - **endpoint [string]** this will trigger on a request to http://localhost:\<port\>/ws/\<endpoint\>
- **output params (these go in your _nano.json_ output key):**
  - **url [string]** create a WebSocket client bound to this url, and send the nano's output to its server.

## Sample _plugins.json_

```json
[
  {
    "name": "fofx-ws",
    "params": {
      "port": 6000
    }
  }
]
```

## Sample _nano.json_

```json
{
  "input": {
    "type": "ws",
    "endpoint": "foo"
  },
  "output": {
    "type": "ws",
    "url": "ws://localhost:6000/ws/bar"
  }
}
```
