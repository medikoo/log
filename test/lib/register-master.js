"use strict";

var test            = require("tape")
  , requireUncached = require("ncjsm/require-uncached");

test("lib/registerMaster", function (t) {
	var registerMaster;

	requireUncached(require.resolve("../../lib/register-master"), function () {
		registerMaster = require("../../lib/register-master");
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
