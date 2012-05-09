# prism.js

JavaScript client library for
[Prism WebSocket Server](https://github.com/soulim/prism).

## Usage

```javascript
Prism("channel", "url");                        #=> create Prism.connection by given URL
Prism("channel").send("message");               #=> send message via Prism.connection
Prism("channel").disconnect();                  #=> close Prism.connection
Prism("channel").bind("event_name", callback);  #=> set callback on given event received from Prism
```

## License

The MIT License

Copyright (c) 2010, Alex Soulim
