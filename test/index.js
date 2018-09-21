"use strict";

var test    = require("tape")
  , log     = require("../index")
  , emitter = require("../writer-utils/emitter");

test("(main)", function (t) {
	var testArgs = ["foo", 12, null, {}];

	t.test("Should by default", function (t) {
		t.equal(log.level, "debug", "be at 'debug' level");
		t.equal(log.namespace, null, "point no namespace");
		t.deepEqual(log.namespaceTokens, [], "have empty namespace tokens list");
		t.end();
	});

	t.equal(log.debug, log, "Should expose default 'debug' level at 'debug' property");

	t.test(
		"When invoked should emit 'log' events on log.emitter, where event should expose",
		function (t) {
			emitter.once("log", function (event) {
				t.equal(event.logger, log, "target logger at 'event.logger' property");
				t.deepEqual(event.messageTokens, testArgs, "message tokens");
				t.end();
			});
			log.apply(null, testArgs);
		}
	);

	t.test("Should allow to create loggers of other levels", function (t) {
		var currentLog = log.get("foo").error;
		t.test("which expose", function (t) {
			t.equal(currentLog.level, "error", "expected level");
			t.equal(currentLog.namespace, "foo", "expected namespace");
			t.deepEqual(currentLog.namespaceTokens, ["foo"], "expected namespace tokens list");
			t.equal(currentLog.debug, log.get("foo"), "Other levels in same namespace");
			t.equal(currentLog.error, currentLog, "Current level at it's name property");
			t.end();
		});

		t.test("which when invoked should emit 'log' event on log.emitter that exposes", function (
			t
		) {
			emitter.once("log", function (event) {
				t.equal(event.logger, currentLog, "target logger");
				t.deepEqual(event.messageTokens, testArgs, "message tokens");
				t.end();
			});
			currentLog.apply(null, testArgs);
		});
		t.end();
	});

	t.test("Should expose .isLevelInitialized(level) method that", function (t) {
		t.equal(
			log.isLevelInitialized("foo"), false, "returns false on non setup  not predefined level"
		);
		t.equal(
			log.isLevelInitialized("critical"), false, "returns false on non setup predefined level"
		);
		t.equal(log.isLevelInitialized("error"), true, "returns true on setup predefined level");
		t.equal(log.isLevelInitialized("debug"), true, "return true on self level");
		t.equal(
			log.get("foorkot").isLevelInitialized("error"), false,
			"returns false if there's no setup level logger for given namespace"
		);
		t.end();
	});

	t.test("Should expose .getAllInitializedLevels() method that expose", function (t) {
		t.deepEqual(
			log.getAllInitializedLevels(), [log, log.warning, log.error],
			"All setup levels on top level logger"
		);
		t.deepEqual(
			log.get("getlevel-test").getAllInitializedLevels(), [log.get("getlevel-test")],
			"Only levels setup within given ns scope"
		);
		t.end();
	});

	t.test(
		"Should allow to create namespaced loggers (debug library style) via .get(name)",
		function (t) {
			var currentLog = log.get("marko");
			t.test("which expose", function (t) {
				t.equal(currentLog.level, "debug", "expected level");
				t.equal(currentLog.namespace, "marko", "expected namespace");
				t.deepEqual(
					currentLog.namespaceTokens, ["marko"], "expected namespace tokens list"
				);
				t.end();
			});

			t.test(
				"which when invoked should emit 'log' events on log.emitter, that expose",
				function (t) {
					emitter.once("log", function (event) {
						t.equal(event.logger, currentLog, "target logger");
						t.deepEqual(event.messageTokens, testArgs, "message tokens");
						t.end();
					});
					currentLog.apply(null, testArgs);
				}
			);
			t.end();
		}
	);

	t.throws(
		function () { log.get("marko elo"); }, TypeError, "Should throw on invalid namespace names"
	);

	t.test("Should allow to nest namespaced loggers", function (t) {
		t.test("via colon separated tokens passed to .get(name)", function (t) {
			var currentLog = log.get("marko:barko");

			t.test("which expose", function (t) {
				t.equal(currentLog.level, "debug", "expected level");
				t.equal(currentLog.namespace, "marko:barko", "expected namespace");
				t.deepEqual(
					currentLog.namespaceTokens, ["marko", "barko"], "expected namespace tokens list"
				);
				t.end();
			});

			t.test(
				"which when invoked should emit 'log' events on log.emitter, that expose",
				function (t) {
					emitter.once("log", function (event) {
						t.equal(event.logger, currentLog, "target logger");
						t.deepEqual(event.messageTokens, testArgs, "message tokens");
						t.end();
					});
					currentLog.apply(null, testArgs);
				}
			);
			t.end();
		});

		t.test("via nested calls to .get(name)", function (t) {
			var currentLog = log.get("marko").get("barko");

			t.test("which expose", function (t) {
				t.equal(currentLog.level, "debug", "expected level");
				t.equal(currentLog.namespace, "marko:barko", "expected namespace");
				t.deepEqual(
					currentLog.namespaceTokens, ["marko", "barko"], "expected namespace tokens list"
				);
				t.end();
			});

			t.test(
				"which when invoked should emit 'log' events on log.emitter, that expose",
				function (t) {
					emitter.once("log", function (event) {
						t.equal(event.logger, currentLog, "target logger");
						t.deepEqual(event.messageTokens, testArgs, "message tokens");
						t.end();
					});
					log.get("marko").get("barko").apply(null, testArgs);
				}
			);
		});
		t.end();
	});

	t.test("Should expose .isNamespaceInitialized(ns) method that", function (t) {
		t.equal(log.isNamespaceInitialized("fbafaafa"), false, "returns false for non setup ns");
		t.equal(log.isNamespaceInitialized("foo"), true, "returns true for setup ns");
		t.equal(
			log.isNamespaceInitialized("marko:barko"), true, "returns true for setup nested ns"
		);
		t.equal(
			log.get("marko").isNamespaceInitialized("barko"), true,
			"returns true on nested logger for setup ns"
		);
		t.end();
	});

	t.test("Should expose .getAllInitializedNamespaces() method that expose", function (t) {
		t.deepEqual(
			log.getAllInitializedNamespaces(),
			[log.get("foo"), log.get("foorkot"), log.get("getlevel-test"), log.get("marko")],
			"All child namespaces"
		);
		t.end();
	});

	t.test(
		"Should create single (reusable) logger instances per level/name configuration",
		function (t) {
			t.equal(log, log.debug);
			t.notEqual(log, log.info);
			t.equal(log.info, log.info);
			t.equal(log.info, log.info.info);
			t.equal(log.get("foo"), log.get("foo"));
			t.notEqual(log.get("foo"), log.get("bar"));
			t.notEqual(log.get("foo"), log.get("foo").get("foo"));
			t.end();
		}
	);

	t.equal(log.warn, log.warning, "Should alias 'warn' level to 'warning'");

	t.test("Should provide enable/disable functionality on level/name configuration", function (t) {
		t.equal(log.get("enabletest").isEnabled, true, "Should be enabled by default");

		var restore = log.get("enabletest").disable().restore;
		t.equal(
			typeof restore, "function", "disable() should return object with `restore` function"
		);
		t.equal(
			log.get("enabletest").isEnabled, false, "Should be disabled after `disable()` call"
		);

		t.equal(
			log.get("enabletest").get("foo").isEnabled, false,
			"New nested names should inherit setting"
		);
		restore();
		t.equal(log.get("enabletest").isEnabled, true, "`restore` should bring previous state");

		restore = log.get("enabletest").enable().restore;
		t.equal(
			typeof restore, "function", "enable() should return object with `restore` function"
		);
		t.equal(
			log.get("enabletest").isEnabled, true, "Should remain enabled after `enable()` call"
		);
		log.get("enabletest").enable();
		t.equal(
			log.get("enabletest").isEnabled, true,
			"Trying to set same state again should have no effect"
		);
		restore();
		log.get("enabletest").isEnabled = false;
		t.equal(
			log.get("enabletest").isEnabled, false,
			"It should be possible to change state by direct setting of isEnabled"
		);
		delete log.get("enabletest").isEnabled;

		t.equal(
			log.get("enabletest").get("foo").isEnabled, true,
			"Existing nested names should inherit setting"
		);

		restore = log.get("enabletest").get("foo").disable().restore;
		t.equal(log.get("enabletest").get("foo").isEnabled, false, "Should work on nested names");
		t.equal(
			log.get("enabletest").isEnabled, true,
			"Settings on nested names should not leak to parent loggers"
		);

		var restore2 = log.get("enabletest").enable().restore;
		t.equal(
			log.get("enabletest").get("foo").isEnabled, true,
			"Calling `enable` on parent should affect all children unconditionally"
		);
		restore2();

		t.test("Should emit 'log' events when disabled", function (t) {
			var isEnabled = true, passes = 0;
			emitter.on("log", function self(event) {
				t.equal(isEnabled, isEnabled);
				t.equal(event.logger, log);
				t.deepEqual(event.messageTokens, testArgs);
				if (++passes === 2) {
					emitter.off("log", self);
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
			t.end();
		});
		restore();
		t.end();
	});

	t.test("Should emit 'init' events when", function (t) {
		t.test("new level logger instance is created", function (t) {
			var currentLog, caughtEvent;
			emitter.once("init", function (event) { caughtEvent = event; });
			currentLog = log.critical;
			t.equal(caughtEvent.logger, currentLog, "Event should expose initialized logger");
			t.end();
		});
		t.test("new name logger instance is created", function (t) {
			var currentLog, caughtEvent;
			emitter.once("init", function (event) { caughtEvent = event; });
			currentLog = log.get("othername");
			t.equal(caughtEvent.logger, currentLog, "Event should expose initialized logger");
			t.end();
		});
		t.test("new nested name logger instance is created", function (t) {
			var isFirst = true;
			emitter.on("init", function self(event) {
				if (isFirst) {
					t.equal(event.logger, log.get("echi"), "for top namespace");
					isFirst = false;
					return;
				}
				t.equal(event.logger, log.get("echi").get("marki"), "for nested namespace");
				emitter.off("init", self);
				t.end();
			});
			log.get("echi:marki");
		});
	});

	t.test("Should expose known (syslog) levels", function (t) {
		t.equal(typeof log.info, "function");
		t.equal(typeof log.notice, "function");
		t.equal(typeof log.warning, "function");
		t.equal(typeof log.error, "function");
		t.equal(typeof log.critical, "function");
		t.equal(typeof log.alert, "function");
		t.equal(typeof log.emergency, "function");
		t.end();
	});

	t.test("Should expose level index", function (t) {
		t.equal(log.notice.levelIndex, 2);
		t.equal(log.error.levelIndex, 4);
		t.end();
	});

	t.test("Should expose level root", function (t) {
		t.equal(log.notice.get("foo:bar").levelRoot, log.notice);
		t.equal(log.error.levelRoot, log.error);
		t.equal(log.warning.get("elo").levelRoot, log.warning);
		t.end();
	});

	t.end();
});
