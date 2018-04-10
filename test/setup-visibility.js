"use strict";

delete require.cache[require.resolve("../index")];

var test     = require("tape")
  , log      = require("../index")
  , setupEnv = require("../setup-visibility");

test("Setup enviroment", function (t) {
	log.getLevel("debug").getNs("e1:d");
	log.getLevel("debug").getNs("e2:e");
	log.getLevel("info").getNs("e1:d");
	log.getLevel("info").getNs("e2");

	setupEnv({
		debug: ["-*", "e1", "-e1:d", "-e1:dn", "", " e2:e", "e2:n", "n1", "-n1:d", "n2:n"],
		info: ["-e1:d", "-n1:d", "-e2", "-n2:*"],
		notice: ["-*"],
		warning: ["-n1", "-n2:elo"]
	});

	t.test("Should update settings on existing loggers:", function (t) {
		t.equal(log.getLevel("debug").isEnabled, false, "'*' should affect level logger");
		t.equal(
			log.getLevel("debug").getNs("e1").isEnabled, true,
			"Should be possible to override ns logger"
		);
		t.equal(
			log.getLevel("debug").getNs("e1:d").isEnabled, false,
			"Should be possible to override ns setting on overriden nested ns"
		);
		t.equal(
			log.getLevel("debug").getNs("e2").isEnabled, false,
			"Nested override should not affect parent"
		);
		t.equal(
			log.getLevel("debug").getNs("e2:e").isEnabled, true,
			"Should be possible to override ns setting on nested ns"
		);

		t.equal(
			log.getLevel("info").isEnabled, true,
			"No overriden level loggers should remain unaffected"
		);
		t.equal(
			log.getLevel("info").getNs("e1").isEnabled, true,
			"On non overriden level, nested override should not affect parent"
		);
		t.equal(
			log.getLevel("info").getNs("e1:d").isEnabled, false,
			"Should allow nested override on non overriden level"
		);
		t.equal(
			log.getLevel("info").getNs("e2").isEnabled, false,
			"Should allow to override ns, on non overriden level"
		);
		t.end();
	});

	t.test("Should reflect settings on newly configured loggers:", function (t) {
		t.equal(
			log.getLevel("debug").getNs("e2:n").isEnabled, true,
			"Should override nested ns for existing ns parent"
		);
		t.equal(
			log.getLevel("debug").getNs("n1:d").isEnabled, false,
			"Shuld override nested ns on overriden ns"
		);
		t.equal(log.getLevel("debug").getNs("n1").isEnabled, true, "Should override ns");
		t.equal(
			log.getLevel("debug").getNs("n2:n:foo").isEnabled, true,
			"Should override nested ns deep way"
		);
		t.equal(log.getLevel("debug").getNs("n2:n").isEnabled, true, "Should override nested ns");
		t.equal(
			log.getLevel("debug").getNs("n3").isEnabled, false, "Non overriden ns should inherit"
		);
		t.equal(
			log.getLevel("info").getNs("n1:d").isEnabled, false,
			"Should override nested ns on non overriden logger"
		);
		t.equal(
			log.getLevel("info").getNs("n2").isEnabled, false,
			"Should override ns on non overriden logger"
		);
		t.equal(
			log.getLevel("info").getNs("n3").isEnabled, true,
			"Non overriden ns should be unaffected"
		);

		t.equal(
			log.getLevel("notice").getNs("foo:mar").isEnabled, false,
			"Should reflect overridance on overriden newly setup level, deep way"
		);
		t.equal(
			log.getLevel("notice").isEnabled, false,
			"Should reflect overridance on newly setup level"
		);

		t.equal(
			log.getLevel("warning").getNs("n1:foo").isEnabled, false,
			"Should reflect overridance on newly setup level, deep way"
		);
		t.equal(
			log.getLevel("warning").getNs("n1").isEnabled, false,
			"Should reflect overridance on newly setup level"
		);
		t.equal(
			log.getLevel("warning").isEnabled, true,
			"Nested overrides should not affect newly created level"
		);
		t.equal(
			log.getLevel("warning").getNs("n2").isEnabled, true,
			"Deep nested overrides should not affect ns  on newly created level"
		);
		t.equal(
			log.getLevel("warning").getNs("n2:elo").isEnabled, false,
			"Deep nested overrides should be reflected on created level"
		);
		t.end();
	});

	t.equal(log.getLevel("error").isEnabled, true, "Should not affect not configured levels");
	t.end();
});
