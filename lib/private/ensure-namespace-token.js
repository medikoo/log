"use strict";

var ensureString     = require("es5-ext/object/validate-stringifiable-value")
  , toShortString    = require("es5-ext/to-short-string-representation")
  , isNamespaceToken = require("./is-namespace-token");

module.exports = function (namespaceToken) {
	namespaceToken = ensureString(namespaceToken);
	if (isNamespaceToken(namespaceToken)) return namespaceToken;
	throw new TypeError(
		toShortString(namespaceToken) +
			" is not a valid namespace token (only 'a-z0-9-' chars are allowed)"
	);
};
