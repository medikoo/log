/* eslint-env node */

"use strict";

var identity        = require("es5-ext/function/identity")
  , format          = require("util").format
  , supportsColor   = require("supports-color")
  , clc             = require("cli-color/bare")
  , logger          = require("../")
  , setupVisibility = require("../setup-visibility");

var conf = Object.create(null);

// Setup visibility
// Resolve from LOG4_* env vars
logger.predefinedLevels.forEach(function (level) {
	var varName = "LOG_" + level.toUpperCase();
	if (process.env[varName]) conf[level] = process.env[varName].split(",");
});
// Eventually support as fallback DEBUG env var
if (!conf.debug && process.env.DEBUG) conf.debug = process.env.DEBUG.split(",");
// Do not show debug level logs by default
if (!conf.debug) conf.debug = [];
conf.debug.unshift("-*");
setupVisibility(conf);

// Resolve eventual colors setup (as in debug lib)
if (supportsColor && process.env.LOG4_COLORS !== "no") {
	var colors;
	if (supportsColor.level >= 2) {
		colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	} else {
		colors = [6, 2, 3, 4, 5, 1];
	}
	var nsToPrefixMap = Object.create(null);
	var currentIndex = 0;
	var setColor = function (nsLogger) {
		if (nsLogger.nsColor) return;
		if (nsToPrefixMap[nsLogger.ns]) {
			nsLogger.nsLogDecorator = nsToPrefixMap[nsLogger.ns];
			return;
		}
		var nsColor = colors[++currentIndex];
		if (currentIndex === colors.length) currentIndex = 0;
		nsLogger.nsLogDecorator = nsToPrefixMap[nsLogger.ns] = function (name) {
			return (
				"\u001b[3" +
				(nsColor < 8 ? nsColor : "8;5;" + nsColor) +
				";1m" +
				name +
				"\u001b[39;22m"
			);
		};
	};
	logger.getAllLevels().forEach(function (levelLogger) {
		levelLogger.getAllNs().forEach(setColor);
	});
	logger.emitter.on("init", function (event) {
		var newLogger = event.logger;
		if (newLogger.nsTokens.length !== 1) return;
		setColor(newLogger);
	});
}

// Log
var levelPrefixes = {
	info: "[INFO]",
	notice: (supportsColor ? clc.yellow : identity)("[NOTICE]"),
	warning: (supportsColor ? clc.yellowBright : identity)("[WARNING]"),
	error: (supportsColor ? clc.redBright : identity)("[ERROR]"),
	critical: (supportsColor ? clc.bgRed : identity)("[CRITICAL]"),
	alert: (supportsColor ? clc.bgRed.blink : identity)("[ALERT]"),
	emergency: (supportsColor ? clc.bgRedBright.blink.underline : identity)("[EMERGENCY]")
};
logger.emitter.on("log", function (event) {
	var currentLogger = event.logger;
	var prefix = " ";
	var levelPrefix = levelPrefixes[currentLogger.level];
	if (levelPrefix) prefix += levelPrefix + " ";
	if (currentLogger.ns) {
		prefix += (currentLogger.nsLogDecorator || identity)(currentLogger.ns) + " ";
	}
	event.messagePrefix = prefix;
	event.messageText = format.apply(null, event.messageTokens);
	process.stdout.write(prefix + event.messageText + "\n");
});
