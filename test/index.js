"use strict";

var isDate = require("es5-ext/date/is-date")
  , test   = require("tape")
  , log    = require("../index");

test("Logger", function (t) {
	var emitter = log.emitter, testArgs = ["foo", 12, null, {}];

	t.test("Should by default", function (t) {
		t.equal(log.level, "debug", "be at 'debug' level");
		t.equal(log.ns, null, "point no namespace");
		t.deepEqual(log.nsTokens, [], "have empty namespace tokens list");
		t.end();
	});

	t.equal(log.debug, log, "Should expose default 'debug' level at 'debug' property");
	t.equal(Array.isArray(log.predefinedLevels), true, "Should expose array of predefined levels");

	t.test(
		"When invoked should emit 'log' events on log.emitter, where event should expose",
		function (t) {
			emitter.once("log", function (event) {
				t.equal(event.logger, log, "target logger at 'event.logger' property");
				t.equal(isDate(event.date), true, "current date");
				t.deepEqual(event.messageTokens, testArgs, "message tokens");
				t.end();
			});
			log.apply(null, testArgs);
		}
	);

	t.test("Should allow to create loggers of other levels via .getLevel(name)", function (t) {
		var currentLog = log.getNs("foo").getLevel("error");
		t.test("which expose", function (t) {
			t.equal(currentLog.level, "error", "expected level");
			t.equal(currentLog.ns, "foo", "expected namespace");
			t.deepEqual(currentLog.nsTokens, ["foo"], "expected namespace tokens list");
			t.equal(currentLog.debug, log.getNs("foo"), "Other levels in same namespace");
			t.equal(currentLog.error, currentLog, "Current level at it's name property");
			t.end();
		});
		t.equal(log.error, log.getLevel("error"), "which are automatically on other loggers");

		t.test("which when invoked should emit 'log' event on log.emitter that exposes", function (
			t
		) {
			emitter.once("log", function (event) {
				t.equal(event.logger, currentLog, "target logger");
				t.equal(isDate(event.date), true, "current date");
				t.deepEqual(event.messageTokens, testArgs, "message tokens");
				t.end();
			});
			currentLog.apply(null, testArgs);
		});
		t.end();
	});

	t.throws(
		function () {
			log.getLevel("marko elo");
		},
		TypeError,
		"Should throw on invalid level names"
	);
	t.throws(
		function () {
			log.getLevel("name");
		},
		TypeError,
		"Should throw on level names that override existing properties"
	);

	t.test("Should expose .hasLevel(level) method that", function (t) {
		t.equal(log.hasLevel("foo"), false, "returns false on non setup  not predefined level");
		t.equal(log.hasLevel("critical"), false, "returns false on non setup predefined level");
		t.equal(log.hasLevel("error"), true, "returns true on setup predefined level");
		log.getLevel("marko");
		t.equal(log.hasLevel("marko"), true, "returns true on setup not predefined level");
		t.equal(log.hasLevel("debug"), true, "return true on self level");
		t.equal(log.getNs("foorkot").hasLevel("error"), false,
			"returns false if there's no setup level logger for given namespace");
		t.end();
	});

	t.test("Should expose .getAllLevels() method that expose", function (t) {
		t.deepEqual(log.getAllLevels(),
			[log, log.getLevel("warning"), log.getLevel("error"), log.getLevel("marko")],
			"All setup levels on top level logger");
		t.deepEqual(log.getNs("getlevel-test").getAllLevels(), [log.getNs("getlevel-test")],
			"Only levels setup within given ns scope");
		t.end();
	});

	t.test(
		"Should allow to create namespaced loggers (debug library style) via .getNs(name)",
		function (t) {
			var currentLog = log.getNs("marko");
			t.test("which expose", function (t) {
				t.equal(currentLog.level, "debug", "expected level");
				t.equal(currentLog.ns, "marko", "expected namespace");
				t.deepEqual(currentLog.nsTokens, ["marko"], "expected namespace tokens list");
				t.end();
			});

			t.test(
				"which when invoked should emit 'log' events on log.emitter, that expose",
				function (t) {
					emitter.once("log", function (event) {
						t.equal(event.logger, currentLog, "target logger");
						t.equal(isDate(event.date), true, "current date");
						t.deepEqual(event.messageTokens, testArgs, "message tokens");
						t.end();
					});
					currentLog.apply(null, testArgs);
				}
			);
			t.end();
		}
	);

	t.throws(function () {
		log.getNs("marko elo");
	}, TypeError, "Should throw on invalid namespace names");

	t.test("Should allow to nest namespaced loggers", function (t) {
		t.test("via colon separated tokens passed to .getNs(name)", function (t) {
			var currentLog = log.getNs("marko:barko");

			t.test("which expose", function (t) {
				t.equal(currentLog.level, "debug", "expected level");
				t.equal(currentLog.ns, "marko:barko", "expected namespace");
				t.deepEqual(currentLog.nsTokens, ["marko", "barko"],
					"expected namespace tokens list");
				t.end();
			});

			t.test(
				"which when invoked should emit 'log' events on log.emitter, that expose",
				function (t) {
					emitter.once("log", function (event) {
						t.equal(event.logger, currentLog, "target logger");
						t.equal(isDate(event.date), true, "date");
						t.deepEqual(event.messageTokens, testArgs, "message tokens");
						t.end();
					});
					currentLog.apply(null, testArgs);
				}
			);
			t.end();
		});

		t.test("via nested calls to .getNs(name)", function (t) {
			var currentLog = log.getNs("marko").getNs("barko");

			t.test("which expose", function (t) {
				t.equal(currentLog.level, "debug", "expected level");
				t.equal(currentLog.ns, "marko:barko", "expected namespace");
				t.deepEqual(currentLog.nsTokens, ["marko", "barko"],
					"expected namespace tokens list");
				t.end();
			});

			t.test(
				"which when invoked should emit 'log' events on log.emitter, that expose",
				function (t) {
					emitter.once("log", function (event) {
						t.equal(event.logger, currentLog, "target logger");
						t.equal(isDate(event.date), true, "date");
						t.deepEqual(event.messageTokens, testArgs, "message tokens");
						t.end();
					});
					log.getNs("marko").getNs("barko").apply(null, testArgs);
				}
			);
		});
		t.end();
	});

	t.test("Should expose .hasNs(ns) method that", function (t) {
		t.equal(log.hasNs("fbafaafa"), false, "returns false for non setup ns");
		t.equal(log.hasNs("foo"), true, "returns true for setup ns");
		t.equal(log.hasNs("marko:barko"), true, "returns true for setup nested ns");
		t.equal(log.getNs("marko").hasNs("barko"), true,
			"returns true on nested logger for setup ns");
		t.end();
	});

	t.test("Should expose .getAllNs() method that expose", function (t) {
		t.deepEqual(log.getAllNs(),
			[
				log.getNs("foo"),
				log.getNs("foorkot"),
				log.getNs("getlevel-test"),
				log.getNs("marko")
			],
			"All child namespaces");
		t.end();
	});

	t.test(
		"Should create single (reusable) logger instances per level/name configuration",
		function (t) {
			t.equal(log, log.getLevel("debug"));
			t.notEqual(log, log.getLevel("info"));
			t.equal(log.getLevel("info"), log.getLevel("info"));
			t.equal(log.getLevel("info"), log.getLevel("info").getLevel("info"));
			t.equal(log.getNs("foo"), log.getNs("foo"));
			t.notEqual(log.getNs("foo"), log.getNs("bar"));
			t.notEqual(log.getNs("foo"), log.getNs("foo").getNs("foo"));
			t.end();
		}
	);

	t.test("Should expose known (syslog) levels with predefined properties", function (t) {
		t.equal(log.info, log.getLevel("info"));
		t.equal(log.notice, log.getLevel("notice"));
		t.equal(log.warning, log.getLevel("warning"));
		t.equal(log.error, log.getLevel("error"));
		t.equal(log.critical, log.getLevel("critical"));
		t.equal(log.alert, log.getLevel("alert"));
		t.equal(log.emergency, log.getLevel("emergency"));
		t.end();
	});

	t.equal(log.getLevel("warn"), log.warning, "Should alias 'warn' level to 'warning'");

	t.test("Should provide enable/disable functionality on level/name configuration", function (t) {
		t.equal(log.getNs("enabletest").isEnabled, true, "Should be enabled by default");

		t.equal(log.getNs("enabletest").disable(), log.getNs("enabletest"),
			"disable() should return target logger");
		t.equal(log.getNs("enabletest").isEnabled, false,
			"Should be disabled after `disable()` call");

		t.equal(log.getNs("enabletest").getNs("foo").isEnabled, false,
			"New nested names should inherit setting");

		t.equal(log.getNs("enabletest").enable(), log.getNs("enabletest"),
			"enable() should return target logger");
		t.equal(log.getNs("enabletest").isEnabled, true,
			"Should be enabled after `enable()` call");
		log.getNs("enabletest").enable();
		t.equal(log.getNs("enabletest").isEnabled, true,
			"Trying to set same state again should have no effect");
		log.getNs("enabletest").isEnabled = false;
			t.equal(log.getNs("enabletest").isEnabled, false,
				"It should be possible to change state by direct setting of isEnabled");
		log.getNs("enabletest").isEnabled = true;

		t.equal(log.getNs("enabletest").getNs("foo").isEnabled, true,
			"Existing nested names should inherit setting");

		log.getNs("enabletest").getNs("foo").enable();
		t.equal(log.getNs("enabletest").getNs("foo").isEnabled, true,
			"Setting existing state on child should have no effect");

		log.getNs("enabletest").getNs("foo").disable();
		t.equal(log.getNs("enabletest").getNs("foo").isEnabled, false,
			"Should work on nested names");
		t.equal(log.getNs("enabletest").isEnabled, true,
			"Settings on nested names should not leak to parent loggers");

		log.getNs("enabletest").disable();
		log.getNs("enabletest").enable();
		t.equal(log.getNs("enabletest").getNs("foo").isEnabled, false,
			"Setting on parent should not have effect on child with own setting");

		t.test("Should not emit 'log' events when disabled", function (t) {
			var isEnabled = true, passes = 0;
			emitter.on("log", function self(event) {
				t.equal(isEnabled, true);
				t.equal(event.logger, log);
				t.equal(isDate(event.date), true);
				t.deepEqual(event.messageTokens, testArgs);
				if (++passes === 2) {
					emitter.off("log", self);
					t.end();
				}
			});
			t.equal(log.isEnabled, true);
			log.apply(null, testArgs);

			log.disable();
			isEnabled = false;
			t.equal(log.isEnabled, false);
			log.apply(null, testArgs);

			log.enable();
			isEnabled = true;
			t.equal(log.isEnabled, true);
			log.apply(null, testArgs);
		});
		t.end();
	});

	t.test("Should emit 'init' events when", function (t) {
		t.test("new level logger instance is created", function (t) {
			var currentLog, caughtEvent;
			emitter.once("init", function (event) {
				caughtEvent = event;
			});
			currentLog = log.getLevel("otherlevel");
			t.equal(caughtEvent.logger, currentLog, "Event should expose initialized logger");
			t.end();
	});
		t.test("new name logger instance is created", function (t) {
			var currentLog, caughtEvent;
			emitter.once("init", function (event) {
				caughtEvent = event;
			});
			currentLog = log.getNs("othername");
			t.equal(caughtEvent.logger, currentLog, "Event should expose initialized logger");
			t.end();
		});
		t.test("new nested name logger instance is created", function (t) {
			var isFirst = true;
			emitter.on("init", function self(event) {
				if (isFirst) {
					t.equal(event.logger, log.getNs("echi"), "for top namespace");
					isFirst = false;
					return;
				}
				t.equal(event.logger, log.getNs("echi").getNs("marki"), "for nested namespace");
				emitter.off("init", self);
				t.end();
			});
			log.getNs("echi:marki");
		});
	});

	t.end();
});
