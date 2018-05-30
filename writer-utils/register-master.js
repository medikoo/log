"use strict";

var isMasterRegistered = false;

module.exports = function () {
	if (isMasterRegistered) throw new Error("Cannot register: Master logger already registered");
	return isMasterRegistered = true;
};
