"use strict";

var isValue              = require("es5-ext/object/is-value")
  , ensureNamespaceToken = require("./private/ensure-namespace-token")
  , d                    = require("d");

var defaultNamespace = null;

module.exports = Object.defineProperty(
	function () { return defaultNamespace; }, "set",
	d(function (namespace) {
		defaultNamespace = isValue(namespace) ? ensureNamespaceToken(namespace) : null;
	})
);
