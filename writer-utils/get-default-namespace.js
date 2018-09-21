"use strict";

var d = require("d");

var defaultNamespace = null;

module.exports = Object.defineProperty(
	function () { return defaultNamespace; }, "set",
	d(function (namespace) { defaultNamespace = namespace; })
);
