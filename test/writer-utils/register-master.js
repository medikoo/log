"use strict";

var test            = require("tape")
  , requireUncached = require("cjs-module/require-uncached");

test("writerUtils.registerMaster", function (t) {
	var registerMaster;

	requireUncached(require.resolve("../../writer-utils/register-master"), function () {
		registerMaster = require("../../writer-utils/register-master");
	});

	t.test("Should return true on first registration", function (t) {
		t.equal(registerMaster(), true);
		t.end();
	});

	t.test("Should crash on following registration", function (t) {
		t.throws(function () { registerMaster(); }, "Cannot register");
		t.end();
	});
	t.end();
});
