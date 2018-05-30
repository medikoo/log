"use strict";

var test    = require("tape")
  , emitter = require("../../writer-utils/emitter");

test("Emitter", function (t) {
	t.test("Should expose emitter methods", function (t) {
		t.equal(typeof emitter.on, "function");
		t.equal(typeof emitter.off, "function");
		t.end();
	});
	t.end();
});
