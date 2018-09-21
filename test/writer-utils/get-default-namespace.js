"use strict";

var test            = require("tape")
  , requireUncached = require("cjs-module/require-uncached");

test("Register master", function (t) {
	var getDefaultNamespace = requireUncached(
		require.resolve("../../writer-utils/get-default-namespace"),
		function () { return require("../../writer-utils/get-default-namespace"); }
	);

	t.test("Preset default namespace is null", function (t) {
		t.equal(getDefaultNamespace(), null);
		t.end();
	});

	t.test("Default namespace should be settable via `set` method", function (t) {
		getDefaultNamespace.set("foo");
		t.equal(getDefaultNamespace(), "foo");
		t.end();
	});
	t.end();
});
