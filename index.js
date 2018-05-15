"use strict";

var aFrom          = require("es5-ext/array/from")
  , identity       = require("es5-ext/function/identity")
  , noop           = require("es5-ext/function/noop")
  , assign         = require("es5-ext/object/assign")
  , objForEach     = require("es5-ext/object/for-each")
  , objToArray     = require("es5-ext/object/to-array")
  , setPrototypeOf = require("es5-ext/object/set-prototype-of")
  , ensureString   = require("es5-ext/object/validate-stringifiable-value")
  , toShortString  = require("es5-ext/to-short-string-representation")
  , d              = require("d")
  , lazy           = require("d/lazy")
  , ee             = require("event-emitter");

var emitter = ee(), levelCache = Object.create(null);
var isValidNsToken = RegExp.prototype.test.bind(/^[a-z0-9-]+$/);

var levelNames = ["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"];

var createLevelLogger, createNamespaceLogger;

var loggerPrototype = Object.create(
	Function.prototype,
	assign(
		{
			emitter: d("", emitter),
			predefinedLevels: d("e", levelNames),

			// Public properties & methods
			isEnabled: d("ew", true),
			get: d(function (ns) {
				ns = ensureString(ns);
				var namespaceTokens = ns.split(":");
				namespaceTokens.forEach(function (nsToken) {
					if (!isValidNsToken(nsToken)) {
						throw new TypeError(
							toShortString(ns) +
								" is not a valid ns string " +
								"(only 'a-z0-9-' chars are allowed and ':' as delimiter)"
						);
					}
				});
				return namespaceTokens.reduce(function (currentLogger, token) {
					return createNamespaceLogger(currentLogger, token);
				}, this);
			}),
			enable: d(function () { return this._setEnabledState(true); }),
			disable: d(function () { return this._setEnabledState(false); }),

			// Public meta methods (used by log writers)
			isNamespaceInitialized: d("e", function (ns) {
				var namespaceTokens = ensureString(ns).split(":");
				var currentLogger = this;
				return namespaceTokens.every(function (nsToken) {
					return currentLogger = currentLogger._namespacedLoggers[nsToken];
				});
			}),
			isLevelInitialized: d("e", function (level) {
				level = ensureString(level);
				if (this.level === level) return true;
				var logger = levelCache[level];
				if (!logger) return false;
				if (!this.namespace) return true;
				return logger.isNamespaceInitialized(this.namespace);
			}),
			getAllInitializedLevels: d("e", function () {
				return Object.keys(levelCache)
					.filter(function (level) { return this.isLevelInitialized(level); }, this)
					.map(function (level) { return this._getLevelLogger(level); }, this);
			}),
			getAllInitializedNamespaces: d("e", function () {
				return objToArray(this._namespacedLoggers, identity);
			}),

			// Internal
			_namespaceToken: d("", null),
			_getLevelLogger: d(function (newLevel) {
				newLevel = ensureString(newLevel);
				if (this.level === newLevel) return this;
				var levelLogger = createLevelLogger(newLevel);
				return this.namespaceTokens.reduce(function (currentLogger, token) {
					return createNamespaceLogger(currentLogger, token);
				}, levelLogger);
			}),
			_setEnabledState: d(function (state) {
				var cache = [];
				this._setEnabledStateRecursively(state, cache);
				var result = {
					restore: function () {
						cache.forEach(function (data) {
							if (data.hasDirectSetting) data.logger.isEnabled = !state;
							else delete data.logger.isEnabled;
						});
						result.restore = noop;
					}
				};
				return result;
			}),
			_setEnabledStateRecursively: d(function (newState, cache) {
				if (this.isEnabled !== newState) {
					cache.push({
						logger: this,
						hasDirectSetting: hasOwnProperty.call(this, "isEnabled")
					});
					this.isEnabled = newState;
				}
				objForEach(this._namespacedLoggers, function (namespacedLogger) {
					namespacedLogger._setEnabledStateRecursively(newState, cache);
				});
			})
		},
		lazy(
			Object.assign(
				levelNames.reduce(function (descriptors, level) {
					descriptors[level] = d(
						"e",
						function () { return this._getLevelLogger(level); },
						{ cacheName: "_" + level }
					);
					return descriptors;
				}, {}),
				{
					warn: d(function () { return this._getLevelLogger("warning"); }, {
						cacheName: "_warning"
					}),
					namespace: d(
						"e",
						function () { return this.namespaceTokens.join(":") || null; },
						{ cacheName: "_namespace" }
					),
					namespaceTokens: d(
						"e",
						function () {
							return this._namespaceToken
								? Object.getPrototypeOf(this).namespaceTokens.concat(
										this._namespaceToken
								  )
								: [];
						},
						{ cacheName: "_namespaceTokens" }
					),
					_namespacedLoggers: d("", function () { return Object.create(null); }, {
						cacheName: "__namespacedLoggers"
					})
				}
			)
		)
	)
);

var createLogger = function () {
	// eslint-disable-next-line no-unused-vars
	return function self(msgItem1/*, ...msgItemn*/) {
		emitter.emit("log", { logger: self, messageTokens: aFrom(arguments) });
	};
};

createLevelLogger = function (levelName) {
	if (levelCache[levelName]) return levelCache[levelName];
	var logger = Object.defineProperties(setPrototypeOf(createLogger(), loggerPrototype), {
		level: d("e", levelName),
		levelIndex: d("e", levelNames.indexOf(levelName))
	});
	levelCache[levelName] = logger;
	emitter.emit("init", { logger: logger });
	return logger;
};

createNamespaceLogger = function (parent, nsToken) {
	if (parent._namespacedLoggers[nsToken]) return parent._namespacedLoggers[nsToken];
	var logger = Object.defineProperties(setPrototypeOf(createLogger(), parent), {
		_namespaceToken: d("", nsToken)
	});
	parent._namespacedLoggers[nsToken] = logger;
	emitter.emit("init", { logger: logger });
	return logger;
};

module.exports = createLevelLogger("debug");
