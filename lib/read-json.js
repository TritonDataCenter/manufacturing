/*
 * Copyright 2014 Joyent, Inc.  All rights reserved.
 */

var fs = require('fs');
var path = require('path');
var jsprim = require('jsprim');
var extsprintf = require('extsprintf');

var fmt = extsprintf.sprintf;

function
read_json(/* ... */)
{
	var args = Array.prototype.slice.call(arguments);
	var schema = null;
	var jp;
	var j;

	if (typeof (args[args.length - 1]) === 'object')
		schema = args.pop();

	jp = path.join.apply(path.join, args);
	try {
		j = JSON.parse(fs.readFileSync(jp));
	} catch (e) {
		throw new Error(fmt('parse error in %s: %s', jp, e.message));
	}

	if (schema !== null) {
		var e = jsprim.validateJsonObject(schema, j);

		if (e !== null) {
			e.file = jp;
			e.message = fmt('%s: %s', jp, e.message);
			throw (e);
		}
	}

	return (j);
}

module.exports = read_json;
