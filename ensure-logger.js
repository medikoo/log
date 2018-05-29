"use strict";

var toShortString = require("es5-ext/to-short-string-representation")
  , isLogger      = require("./is-logger");

module.exports = function (logger) {
	if (isLogger(logger)) return logger;
	throw new TypeError(toShortString(logger) + " is not a logger");
};
