/*
 * Prism JS v0.1
 * JavaScript client for Prism WebSocket server
 *
 * API inspired by jQuery and based on "Let's Make a Framework" articles (http://dailyjs.com/tags.html#lmaf)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2010 by Alex Soulim (soulim@gmail.com).
 *
 * Usage:
 *
 * Prism("channel", "url");                           #=> create Prism.connection by given URL
 * Prism("channel");                                  #=> get Prism.connection
 * Prism("channel").send("message");                  #=> send message via Prism.connection
 * Prism("channel").disconnect();                     #=> close Prism.connection
 * Prism("channel").bind("event_name", callback);     #=> set callback on given event received from Prism
 */

(function (window) {
  var Prism = function () {
        return Prism.init.apply(Prism, arguments);
      },
      channels = [];

  Prism.VERSION = "0.1";

  Prism.init = function (channel, url) {
    return (url) ? Prism.connect.apply(Prism, arguments) : channels[channel];
  };

  Prism.connect = function (channel, url) {
    if (channels[channel] && channels[channel].connected()) {
      channels[channel].disconnect();
    };

    channels[channel] = new Prism.connection(url);

    return channels[channel];
  };

  Prism.log = function (message) {  };

  Prism.parse = function (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      throw new Error("Prism parser: data attribute not valid JSON");
    };
  };

  Prism.connection = function (url) {
    this.allow_reconnect = true;
    this.retry_count     = 0;
    this.websocket       = null;
    this.callbacks       = [];
    this.connect(url)
  };
  Prism.connection.prototype = {
    connected: function () {
      return this.websocket.readyState != WebSocket.prototype.CLOSED;
    },
    connect: function (url) {
      Prism.log("Prism: connecting...");
      this.websocket = new WebSocket(url);

      var self = this;

      this.websocket.onopen    = function () { self.onOpen.call(self, arguments) };
      this.websocket.onclose   = function () { self.onClose.apply(self, arguments) };
      this.websocket.onmessage = function () { self.onMessage.apply(self, arguments) };
    },
    disconnect: function () {
      Prism.log("Prism: disconnecting...");
      this.retry_count     = 0;
      this.allow_reconnect = false;
      this.websocket.close();
    },
    reconnect: function () {
      Prism.log("Prism: reconnecting in 5 seconds");
      this.retry_count += 1;
      var self = this;
      setTimeout(function () { self.connect(self.websocket.URL) }, 5000);
    },
    send: function (message) {
      this.websocket.send(message);
    },
    bind: function (event_name, callback) {
      this.callbacks[event_name] = callback;
      return this;
    },
    trigger: function (event_name) {
      if (this.callbacks[event_name]) {
        this.callbacks[event_name].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },
    onOpen: function () {
      Prism.log("Prism: connected");
      this.trigger("prism:connection_established");
    },
    onClose: function () {
      Prism.log("Prism: disconnected");
      this.trigger("prism:connection_disconnected");

      if (this.allow_reconnect) { this.reconnect() };
    },
    onMessage: function (e) {
      Prism.log("Prism: message has been received");
      var data = Prism.parse(e.data);

      this.trigger(data.method, data.params);
    }
  };

  if (window.Prism) {
    throw new Error("Prism has already been defined");
  } else {
    window.Prism = Prism;
  }
})(window);
