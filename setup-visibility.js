"use strict";

var ensureArray  = require("es5-ext/array/valid-array")
  , includes     = require("es5-ext/array/#/contains")
  , isValue      = require("es5-ext/object/is-value")
  , ensureString = require("es5-ext/object/validate-stringifiable-value")
  , endsWith     = require("es5-ext/string/#/ends-with")
  , logger       = require("./");

module.exports = function (thresholdLevelName, debugNamespacesTokens) {
	// Resolve intended logging level configuration
	// On this level and above all logs will be exposed
	if (!thresholdLevelName || !includes.call(logger.predefinedLevels, thresholdLevelName)) {
		thresholdLevelName = "warning";
	}
	var thresholdLevelIndex = logger.predefinedLevels.indexOf(thresholdLevelName);

	// Resolve namespace based debug logging configuration
	// Applies only to logs below level threshold (will expose logs just for chosen namespaces)
	var debugNamespacesSettings = Object.create(null);
	ensureArray(debugNamespacesTokens).forEach(function (ns) {
		ns = ensureString(ns).trim();
		if (!ns) return;
		var isEnabled = ns[0] !== "-";
		if (!isEnabled) ns = ns.slice(1);
		if (endsWith.call(ns, ":*")) ns = ns.slice(0, -2);
		ns = ns.split(":").filter(Boolean).join(":");
		debugNamespacesSettings[ns] = isEnabled;
	});
	var debugNamespacesList = Object.keys(debugNamespacesSettings);

	// Apply resolved settings on existing loggers
	logger.predefinedLevels.forEach(function (levelName, levelIndex) {
		// If logger for given level not initialized yet, skip
		if (!logger.isLevelInitialized(levelName)) return;
		// If logs of given level are meant to be exposed, skip (default is to expose)
		if (levelIndex >= thresholdLevelIndex) return;

		// Hide logs for given level
		var levelLogger = logger[levelName];
		levelLogger.isEnabled = false;

		// Eventually expose logs for some namespaces according to passed configuration
		debugNamespacesList.forEach(function (ns) {
			if (ns === "*") {
				levelLogger.isEnabled = debugNamespacesSettings[ns];
			} else if (levelLogger.isNamespaceInitialized(ns)) {
				levelLogger.getNs(ns).isEnabled = debugNamespacesSettings[ns];
			}
		});
	});

	// Ensure settings are applied on any new logger
	logger.emitter.on("init", function (event) {
		var newLogger = event.logger;
		if (!newLogger.ns && newLogger.levelIndex < thresholdLevelIndex) {
			// Root level logger, apply threshold level settings
			newLogger.isEnabled = false;
		}

		// Apply eventual debug namespace visibility
		var isEnabled = debugNamespacesSettings[newLogger.ns || "*"];
		if (isValue(isEnabled)) newLogger.isEnabled = isEnabled;
	});
};
