"use strict";

var isValue      = require("es5-ext/object/is-value")
  , primitiveSet = require("es5-ext/object/primitive-set")
  , ensureString = require("es5-ext/object/validate-stringifiable-value")
  , Duration     = require("duration");

var possibleModes = primitiveSet("abs", "rel");

var resolveMode = function (mode) {
	if (!isValue(mode)) return "rel";
	mode = ensureString(mode);
	return possibleModes[mode] ? mode : "rel";
};

var getRelativeResolver = function () {
	var duration = new Duration(new Date());
	return function () {
		duration.to = new Date();
		return String(duration);
	};
};

var absoluteResolver = function () { return new Date().toISOString(); };

module.exports = function (mode) {
	mode = resolveMode(mode);
	if (mode === "rel") return getRelativeResolver();
	return absoluteResolver;
};
