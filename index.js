// Written with support for all ES5+ engines
// Eventual support for ES3+ engines can be figured out in later turn

"use strict";

var isValue       = require("es5-ext/object/is-value")
  , objForEach    = require("es5-ext/object/for-each")
  , assign        = require("es5-ext/object/assign")
  , ensureString  = require("es5-ext/object/validate-stringifiable-value")
  , toShortString = require("es5-ext/to-short-string-representation")
  , ee            = require("event-emitter");

var emitter = ee(), cache = {};
var isValidLevel = RegExp.prototype.test.bind(/^[a-z]+$/);
var isValidNsToken = RegExp.prototype.test.bind(/^[a-z0-9-]+$/);

var setChildEnabledState = function (logger, state) {
	if (isValue(logger._ownIsEnabled)) return;
	logger.isEnabled = state;
	objForEach(logger.children, function (childLogger) {
		setChildEnabledState(childLogger, state);
	});
};

var setEnabledState = function (logger, state) {
	if (logger._ownIsEnabled === state) return;
	logger._ownIsEnabled = state;
	if (logger.isEnabled === state) return;
	logger.isEnabled = state;
	objForEach(logger.children, function (childLogger) {
		setChildEnabledState(childLogger, state);
	});
};

var getLogger;
var getNsLogger = function (logger, nsToken) {
	if (logger.children[nsToken]) return logger.children[nsToken];
	return getLogger(logger.level, logger, nsToken);
};

getLogger = function (level, parent, nsToken) {
	if (!parent && cache[level]) return cache[level];
	var logger = assign(
		// eslint-disable-next-line no-unused-vars
		function (msgItem1 /*, ...msgItemn*/) {
			if (!logger.isEnabled) return;
			var event = {
				logger: logger,
				date: new Date(),
				messageTokens: arguments
			};
			emitter.emit("log:before", event);
			emitter.emit("log", event);
		},
		{
			level: level,
			ns: parent && parent.ns ? parent.ns + ":" + nsToken : nsToken || null,
			nsTokens: nsToken ? parent.nsTokens.concat(nsToken) : [],
			isEnabled: parent ? parent.isEnabled : true,
			emitter: emitter,
			children: [],
			enable: function () {
				setEnabledState(logger, true);
			},
			disable: function () {
				setEnabledState(logger, false);
			},
			getLevel: function (newLevel) {
				newLevel = ensureString(newLevel);
				if (!isValidLevel(newLevel)) {
					throw new TypeError(
						toShortString(newLevel) +
							" is not a valid level name (only 'a-z' chars are allowed)"
					);
				}
				if (level === newLevel) return logger;
				var levelLogger = getLogger(newLevel);
				return logger.nsTokens.reduce(function (currentLogger, token) {
					return getNsLogger(currentLogger, token);
				}, levelLogger);
			},
			getNs: function (newNs) {
				newNs = ensureString(newNs);
				var newNsTokens = newNs.split(":");
				newNsTokens.forEach(function (newNsToken) {
					if (!isValidNsToken(newNsToken)) {
						throw new TypeError(
							toShortString(newNs) +
								" is not a valid ns string " +
								"(only 'a-z0-9-' chars are allowed and ':' as delimiter)"
						);
					}
				});
				return newNsTokens.reduce(function (currentLogger, token) {
					return getNsLogger(currentLogger, token);
				}, logger);
			}
		}
	);
	if (parent) parent.children[nsToken] = logger;
	else cache[level] = logger;
	emitter.emit("init", { logger: logger });
	return logger;
};

module.exports = getLogger("debug");
