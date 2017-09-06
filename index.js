"use strict";

var assign         = require("es5-ext/object/assign")
  , objMap         = require("es5-ext/object/map")
  , primitiveSet   = require("es5-ext/object/primitive-set")
  , setPrototypeOf = require("es5-ext/object/set-prototype-of")
  , ensureString   = require("es5-ext/object/validate-stringifiable-value")
  , toShortString  = require("es5-ext/to-short-string-representation")
  , d              = require("d")
  , lazy           = require("d/lazy")
  , ee             = require("event-emitter");

var emitter = ee(), levelCache = Object.create(null);
var isValidLevel = RegExp.prototype.test.bind(/^[a-z]+$/);
var isValidNsToken = RegExp.prototype.test.bind(/^[a-z0-9-]+$/);

var predefinedLevels = primitiveSet(
	"debug",
	"info",
	"notice",
	"warning",
	"error",
	"critical",
	"alert",
	"emergency"
);
var levelAliases = Object.create(null, { warn: d("cew", "warning") });

var setEnabledState = function (state) {
	return Object.defineProperty(this, "isEnabled", d("ce", state));
};

var createLogger, createLevelLogger, createNsLogger;

var getLevel = function (newLevel) {
	newLevel = ensureString(newLevel);
	if (this.level === newLevel) return this;
	var levelLogger = createLevelLogger(newLevel);
	return this.nsTokens.reduce(function (currentLogger, token) {
		return createNsLogger(currentLogger, token);
	}, levelLogger);
};

var getNs = function (ns) {
	ns = ensureString(ns);
	var nsTokens = ns.split(":");
	nsTokens.forEach(function (nsToken) {
		if (!isValidNsToken(nsToken)) {
			throw new TypeError(
				toShortString(ns) +
					" is not a valid ns string " +
					"(only 'a-z0-9-' chars are allowed and ':' as delimiter)"
			);
		}
	});
	return nsTokens.reduce(function (currentLogger, token) {
		return createNsLogger(currentLogger, token);
	}, this);
};

var loggerProto = Object.create(
	Function.prototype,
	assign(
		{
			isEnabled: d("e", true),
			emitter: d("", emitter),
			predefinedLevels: d("e", Object.keys(predefinedLevels)),
			_nsToken: d("", null)
		},
		objMap(predefinedLevels, function (ignore, level) {
			return d.gs(function () {
				return this.getLevel(level);
			});
		}),
		{
			hasNs: d("e", function (ns) {
				var nsTokens = ensureString(ns).split(":");
				var currentLogger = this;
				return nsTokens.every(function (nsToken) {
					return currentLogger = currentLogger.nsChildren[nsToken];
				});
			}),
			hasLevel: d("e", function (level) {
				level = ensureString(level);
				if (this.level === level) return true;
				var logger = levelCache[level];
				if (!logger) return false;
				if (!this.ns) return true;
				return logger.hasNs(this.ns);
			}),
			getAllLevels: d("e", function () {
				return Object.keys(levelCache)
					.filter(function (level) {
						return this.hasLevel(level);
					}, this)
					.sort()
					.map(function (level) {
						return this.getLevel(level);
					}, this);
			})
		},
		lazy({
			ns: d(
				"e",
				function () {
					return this.nsTokens.join(":") || null;
				},
				{ cacheName: "_ns" }
			),
			nsTokens: d(
				"e",
				function () {
					return this._nsToken
						? Object.getPrototypeOf(this).nsTokens.concat(this._nsToken)
						: [];
				},
				{ cacheName: "_nsTokens" }
			),
			enable: d(
				function () {
					return setEnabledState.bind(this, true);
				},
				{ cacheName: "_enable" }
			),
			disable: d(
				function () {
					return setEnabledState.bind(this, false);
				},
				{ cacheName: "_disable" }
			),
			getLevel: d(
				function () {
					return getLevel.bind(this);
				},
				{ cacheName: "_getLevel" }
			),
			getNs: d(
				function () {
					return getNs.bind(this);
				},
				{ cacheName: "_getNs" }
			),
			nsChildren: d(
				"",
				function () {
					return Object.create(null);
				},
				{ cacheName: "_nsChildren" }
			)
		})
	)
);

createLogger = function () {
	// eslint-disable-next-line no-unused-vars
	return function self(msgItem1 /*, ...msgItemn*/) {
		if (!self.isEnabled) return;
		var event = {
			logger: self,
			date: new Date(),
			messageTokens: arguments
		};
		emitter.emit("log:before", event);
		emitter.emit("log", event);
	};
};

createLevelLogger = function (level) {
	if (levelAliases[level]) level = levelAliases[level];
	if (levelCache[level]) return levelCache[level];
	if (!isValidLevel(level)) {
		throw new TypeError(
			toShortString(level) + " is not a valid level name (only 'a-z' chars are allowed)"
		);
	}
	if (!predefinedLevels[level] && level in loggerProto) {
		throw new TypeError(
			toShortString(level) +
				" is not a valid level name (should not override existing property)"
		);
	}
	var logger = Object.defineProperties(setPrototypeOf(createLogger(), loggerProto), {
		level: d("e", level)
	});
	levelCache[level] = logger;
	var directLevelAccessConf = {};
	directLevelAccessConf[level] = d(
		"e",
		function () {
			return getLevel.call(this, level);
		},
		{ cacheName: "_" + level }
	);
	Object.defineProperties(loggerProto, lazy(directLevelAccessConf));
	emitter.emit("init", { logger: logger });
	return logger;
};

createNsLogger = function (parent, nsToken) {
	if (parent.nsChildren[nsToken]) return parent.nsChildren[nsToken];
	var logger = Object.defineProperties(setPrototypeOf(createLogger(), parent), {
		_nsToken: d("", nsToken)
	});
	parent.nsChildren[nsToken] = logger;
	emitter.emit("init", { logger: logger });
	return logger;
};

module.exports = createLevelLogger("debug");
