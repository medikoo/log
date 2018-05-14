"use strict";

var test            = require("tape")
  , requireUncached = require("cjs-module/require-uncached");

test("Logs visibility setup", function (t) {
	var log, setupEnv;

	requireUncached([require.resolve("../"), require.resolve("../setup-visibility")], function () {
		log = require("../");
		setupEnv = require("../setup-visibility");
	});

	log.debug.getNs("e1:d");
	log.warning.getNs("e2:e");
	log.error.getNs("foo");
	log.alert.getNs("foo");
	log.warning.getNs("e1");

	setupEnv("error", ["e1", "-e1:d", "n1:d", "-n1:d:foo:*"]);

	t.test("Affects already created loggers", function (t) {
		t.equal(log.debug.isEnabled, false, "Disables level logger deep below level threshold");
		t.equal(log.warning.isEnabled, false, "Disables level logger just below threshold");
		t.equal(log.error.isEnabled, true, "Keeps logger at the threshold enabled");
		t.equal(log.alert.isEnabled, true, "Keeps loggers above threshold enabled");

		t.test("Applies debug namespace map for level loggers below threshold", function (t) {
			t.equal(
				log.warning.getNs("e1").isEnabled, true, "Enables directly mentioned namespace"
			);
			t.equal(
				log.warning.getNs("e1:foo").isEnabled, true,
				"Enables children of directly mentioned namespace"
			);
			t.equal(
				log.warning.getNs("e1:d").isEnabled, false,
				"Disables mentioned directly but negated namespace"
			);
			t.equal(
				log.warning.getNs("e1:d:foo").isEnabled, false,
				"Disables children of mentioned directly but negated namespace"
			);
			t.equal(
				log.warning.getNs("n1").isEnabled, false,
				"Parent remains disabled when child is enabled"
			);
			t.equal(
				log.warning.getNs("n1:d").isEnabled, true,
				"Enables directly mentioned deep namespace"
			);
			t.equal(
				log.warning.getNs("n1:d:foo").isEnabled, false,
				"Handles trailing asterisk as an instruction to be applied on parent"
			);
			t.equal(
				log.warning.getNs("e2").isEnabled, false, "Not mentioned namespaces remain disabled"
			);
			t.end();
		});
		t.end();
	});

	t.test("Affects loggers created later:", function (t) {
		t.equal(log.info.isEnabled, false, "Disables level logger deep below level threshold");
		t.equal(log.critical.isEnabled, true, "Keeps loggers above threshold enabled");

		t.test("Applies debug namespace map for level loggers below threshold", function (t) {
			t.equal(log.info.getNs("e1").isEnabled, true, "Enables directly mentioned namespace");
			t.equal(
				log.info.getNs("e1:foo").isEnabled, true,
				"Enables children of directly mentioned namespace"
			);
			t.equal(
				log.info.getNs("e1:d").isEnabled, false,
				"Disables mentioned directly but negated namespace"
			);
			t.equal(
				log.info.getNs("e1:d:foo").isEnabled, false,
				"Disables children of mentioned directly but negated namespace"
			);
			t.equal(
				log.info.getNs("n1").isEnabled, false,
				"Parent remains disabled when child is enabled"
			);
			t.equal(
				log.info.getNs("n1:d").isEnabled, true, "Enables directly mentioned deep namespace"
			);
			t.equal(
				log.info.getNs("n1:d:foo").isEnabled, false,
				"Handles trailing asterisk as an instruction to be applied on parent"
			);
			t.equal(
				log.info.getNs("e2").isEnabled, false, "Not mentioned namespaces remain disabled"
			);
			t.end();
		});
		t.end();
	});

	t.test("Global '*' enables all debug logs", function (t) {
		requireUncached(
			[require.resolve("../"), require.resolve("../setup-visibility")],
			function () {
				log = require("../");
				setupEnv = require("../setup-visibility");
			}
		);

		setupEnv("error", ["*"]);

		t.test("Affects already created loggers", function (t) {
			t.equal(log.debug.isEnabled, true, "Disables level logger deep below level threshold");
			t.end();
		});

		t.test("Affects loggers created later:", function (t) {
			t.equal(log.info.isEnabled, true, "Disables level logger deep below level threshold");
			t.end();
		});
		t.end();
	});

	t.test("Fallbacks to warning level as threshold, if invalid one is provided", function (t) {
		requireUncached(
			[require.resolve("../"), require.resolve("../setup-visibility")],
			function () {
				log = require("../");
				setupEnv = require("../setup-visibility");
			}
		);

		setupEnv("bla", [""]);

		t.equal(log.notice.isEnabled, false);
		t.equal(log.warning.isEnabled, true);
		t.end();
	});

	t.end();
});
