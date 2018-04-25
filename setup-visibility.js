"use strict";

var aFrom        = require("es5-ext/array/from")
  , isValue      = require("es5-ext/object/is-value")
  , ensureObject = require("es5-ext/object/valid-object")
  , objMap       = require("es5-ext/object/map")
  , ensureString = require("es5-ext/object/validate-stringifiable-value")
  , endsWith     = require("es5-ext/string/#/ends-with")
  , logger       = require("./");

// Conf should be map of namespace tokens per level, e.g.:
// { debug: "this,-not-this", info: "*" }
module.exports = function (conf) {
	conf = objMap(ensureObject(conf), function (levelConf, level) {
		var map = Object.create(null);
		var levelLogger;
		if (logger.hasLevel(level)) levelLogger = logger[level];
		aFrom(levelConf).forEach(function (ns) {
			ns = ensureString(ns).trim();
			if (!ns) return;
			var isEnabled = ns[0] !== "-";
			if (!isEnabled) ns = ns.slice(1);
			if (endsWith.call(ns, ":*")) ns = ns.slice(0, -2);
			map[ns] = isEnabled;
			if (!levelLogger) return;
			var targetLogger;
			if (ns === "*") targetLogger = levelLogger;
			else if (levelLogger.hasNs(ns)) targetLogger = levelLogger.getNs(ns);
			if (!targetLogger) return;
			targetLogger[isEnabled ? "enable" : "disable"]();
		});
		return map;
	});

	logger.emitter.on("init", function (event) {
		var newLogger = event.logger;
		var levelConf = conf[newLogger.level];
		if (!levelConf) return;
		var isEnabled = levelConf[newLogger.ns || "*"];
		if (isValue(isEnabled)) newLogger[isEnabled ? "enable" : "disable"]();
	});
};
