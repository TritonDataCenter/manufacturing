/*
 * Copyright 2014 Joyent, Inc.  All rights reserved.
 */

var path = require('path');
var partsdb = require('../lib/partsdb');
var extsprintf = require('extsprintf');

var fmt = extsprintf.sprintf;

var db;
var p;
var conf = {
	defmfg: 'joyent',
	dbdir: process.argv[2]
};

var w = function () {
	return (process.stdout.write(fmt.apply(fmt, arguments), 'utf-8'));
};

function
dump_tree(p, level)
{
	p.constituents().forEach(function (def) {
		var i;
		var c = def.part;

		for (i = 0; i < 3; i++) {
			if (i === level) {
				w('%4d', def.qty);
			} else {
				w('\t');
			}
		}

		w('\t%12s\n', c.pn().toString());
		dump_tree(c, level + 1);
	});
}

db = partsdb.create(conf);

p = db.find_part(process.argv[3]);
if (p === null) {
	w('%s not found\n', process.argv[3]);
	process.exit(1);
}
w('Part: %s\n', p.pn().toString());
w('Mfgr: %s %s\n', p.mfg().title(), p.mfgpn() !== null ? p.mfgpn() : '');
w('Desc: %s\n', p.desc());
if (p.eol_date() !== null)
	w('EOL: %s\n', p.eol_date().toUTCString());
if (p.alias())
	w('Alias: %s\n', p.alias());
p.refs().forEach(function (r) {
	w('Ref: [%s] %s\n', r.title, r.uri);
});
if (p.constituents().length > 0) {
	w('Contents:\n');
	dump_tree(p, 0);
}
