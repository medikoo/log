"use strict";

var requireUncached = require("ncjsm/require-uncached");

module.exports = function () {
	return requireUncached(function () {
		require("uni-global");
		require.cache[require.resolve("uni-global")].exports = function () { return {}; };
		return {
			log: require("../../../"),
			LogWriter: require("../../../lib/abstract-writer"),
			emitter: require("../../../lib/emitter")
		};
	});
};
