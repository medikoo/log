"use strict";

var isPlainFunction = require("es5-ext/object/is-plain-function");

module.exports = function (logger) {
	if (!isPlainFunction(logger)) return false;
	if (typeof logger.level !== "string") return false;
	return typeof logger.isNamespaceInitialized === "function";
};
