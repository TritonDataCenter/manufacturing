/*
 * Copyright 2014 Joyent, Inc.  All rights reserved.
 */

var path = require('path');
var partsdb = require('../lib/partsdb');
var extsprintf = require('extsprintf');
var disklayout = require('/usr/node/node_modules/disklayout');

var fmt = extsprintf.sprintf;

var db;
var p, rl;
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

function
dump_rsrc(r)
{
	switch (r.class) {
		case 'nic':
			w('%d x %d Gb %s NIC\n', r.qty, r.size, r.type);
			break;
		case 'cpu':
			w('%d x %d MHz %s CPU\n', r.qty, r.size, r.type);
			break;
		case 'memory':
			w('%d GiB %s\n', r.qty * r.size, r.type);
			break;
		case 'storage':
			w('%d x %d GB %s\n', r.qty, r.size, r.type);
			break;
		default:
			w('%d x %d %s %s\n', r.qty, r.size, r.type, r.class);
			break;
	}
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
rl = p.resources(db);
if (rl.length > 0) {
	var disks = [];
	var dc = 0;
	var layout;

	w('Resources:\n');
	rl.forEach(function (r) {
		dump_rsrc(r);
		if (r.class === 'storage') {
			for (var i = 0; i < r.qty; i++) {
				var d = {
					type: 'SCSI',
					name: 'disk' + (dc++),
					vid: 'VENDOR',
					pid: 'PRODUCT',
					size: r.size * 1000000000,
					removable: false,
					solid_state: (r.type === 'ssd')
				};
				disks.push(d);
			}
		}
	});

	if (disks.length > 0) {
		layout = disklayout.compute(disks);
		w('Usable storage: %d GB\n', layout.capacity / 1000000000);
	}
}
if (p.constituents().length > 0) {
	w('Contents:\n');
	dump_tree(p, 0);
}
