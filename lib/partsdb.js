#! /usr/bin/env node

/*
 * Copyright 2014 Joyent, Inc.  All rights reserved.
 */

var fs = require('fs');
var path = require('path');
var read_json = require('./read-json');
var schema = require('./schema');
var extsprintf = require('extsprintf');
var assert = require('assert');
var util = require('util');

var fmt = extsprintf.sprintf;
var w = process.stdout.write.bind(process.stdout);

function
PartNumber()
{
	this._pn_classification = null;
	this._pn_id = null;
	this._pn_dashroll = null;
}

PartNumber.prototype.set = function (str, dashroll)
{
	var self = this;
	var taxa;

	assert.strictEqual(typeof (str), 'string', 'argument must be a string');
	if (typeof (dashroll) !== 'number' && typeof (dashroll) !== 'undefined')
		throw new TypeError('dashroll argument must be a number');

	taxa = str.split('-');

	if (taxa.length < 2 || taxa.length > 3) {
		throw new Error(fmt('invalid part number "%s"', str));
	}

	self._pn_classification = parseInt(taxa[0], 10);
	self._pn_id = parseInt(taxa[1], 10);
	if (taxa.length === 3)
		self._pn_dashroll = parseInt(taxa[2], 10);
	else if (typeof (dashroll) === 'string')
		self._pn_dashroll = parseInt(dashroll, 10);
	else if (typeof (dashroll) === 'number')
		self._pn_dashroll = dashroll;
};

PartNumber.prototype._toString_impl = function (all)
{
	var self = this;
	var str;

	assert.notStrictEqual(self._pn_classification, null,
	    'cannot stringify undefined part number');
	assert.notStrictEqual(self._pn_id, null,
	    'cannot stringify undefined part number');

	str = fmt('%03d-%04d', self._pn_classification, self._pn_id);
	if (all && self._pn_dashroll !== null)
		str = fmt('%s-%02d', str, self._pn_dashroll);

	return (str);
};

PartNumber.prototype.toString = function ()
{
	return (this._toString_impl(true));
};

PartNumber.prototype.rootString = function ()
{
	return (this._toString_impl(false));
};

PartNumber.prototype.dashroll = function ()
{
	var self = this;

	if (self._pn_dashroll === null)
		return (null);

	return (self._pn_dashroll);
};

function
Part()
{
	var self = this;

	self._p_dependencies = [];
	self._p_dependents = [];
	self._p_constituents = [];
	self._p_refs = [];
	self._p_pn = new PartNumber();
	self._p_eol = null;
}

Part.prototype.set = function (obj)
{
	var self = this;

	self._p_pn.set(obj.pn, obj.dashroll);

	if (Array.isArray(obj.constituents)) {
		obj.constituents.forEach(function (def) {
			var cpn = new PartNumber();
			var cdef;

			cpn.set(def.pn);

			cdef = {
				pn: cpn,
				qty: def.qty
			};
			self._p_constituents.push(cdef);
		});
	}

	if (obj.hasOwnProperty('eol'))
		self._p_eol = new Date(obj.eol);

	Object.keys(obj).forEach(function (k) {
		if (k === 'pn' || k === 'dashroll' || k === 'constituents' ||
		    k === 'eol') {
			return;
		}
		self['_p_' + k] = obj[k];
	});

	if (typeof (obj.mfgpn) === 'string')
		self._p_3p = true;
	else
		self._p_3p = false;
};

Part.prototype.is_3p = function ()
{
	var self = this;

	return (self._p_3p);
};

Part.prototype.is_revenue = function ()
{
	var self = this;

	if (self._p_3p)
		return (true);

	assert.strictEqual(typeof (self._p_rev), 'number');

	return (self._p_rev >= 50);
};

Part.prototype.pn = function ()
{
	return (this._p_pn);
};

Part.prototype.desc = function ()
{
	return (this._p_desc);
};

Part.prototype.alias = function ()
{
	return (this._p_alias || null);
};

Part.prototype.mfg = function ()
{
	return (this._p_mfg);
};

Part.prototype.mfgpn = function ()
{
	return (this._p_mfgpn || null);
};

Part.prototype.rev = function ()
{
	return (this._p_rev || null);
};

Part.prototype.refs = function ()
{
	return (this._p_refs);
};

Part.prototype.dependencies = function ()
{
	return (this._p_dependencies);
};

Part.prototype.dependents = function ()
{
	return (this._p_dependents);
};

Part.prototype.constituents = function ()
{
	return (this._p_constituents);
};

Part.prototype.is_eol = function ()
{
	if (this._p_eol === null)
		return (false);

	if (this._p_eol.getTime() < Date.now())
		return (true);

	return (false);
};

Part.prototype.eol_date = function ()
{
	return (this._p_eol);
};

function
add_resources(p, q, a, db)
{
	if (Array.isArray(p._p_resources)) {
		p._p_resources.forEach(function (r) {
			var total = {
				class: r.class,
				type: r.type,
				size: r.size,
				qty: r.qty * q
			};
			a.push(total);
		});
	}
	if (Array.isArray(p._p_constituents)) {
		p._p_constituents.forEach(function (cdef) {
			var cpn = cdef.pn;
			var c = db.find_part(cpn);

			add_resources(c, q * cdef.qty, a, db);
		});
	}
}

function
consolidate_resources(rsrcs)
{
	var crl = [];

	rsrcs.forEach(function (r) {
		if (!crl.some(function (cr) {
			if (cr.class === r.class &&
			    cr.type === r.type &&
			    cr.size === r.size) {
				cr.qty += r.qty;
				return (true);
			}
			return (false);
		})) {
			crl.push(r);
		}
	});

	return (crl);
}

Part.prototype.resources = function (db)
{
	var self = this;
	var rsrcs = [];

	add_resources(self, 1, rsrcs, db);
	rsrcs = consolidate_resources(rsrcs);
	return (rsrcs);
};

function
Mfgr()
{
	this._m_name = null;
	this._m_title = null;
	this._m_refs = [];
}

Mfgr.prototype.set = function (obj)
{
	var self = this;

	self._m_name = obj.name;
	self._m_title = obj.title;

	if (Array.isArray(obj.refs))
		self._m_refs = obj.refs;
};

Mfgr.prototype.name = function ()
{
	return (this._m_name);
};

Mfgr.prototype.title = function ()
{
	return (this._m_title);
};

Mfgr.prototype.refs = function ()
{
	return (this._m_refs);
};

function
PartsDB(arg)
{
	if (typeof (arg) === 'undefined')
		arg = {};

	if (typeof (arg) !== 'object')
		throw new TypeError('arg is not an object');

	this._pdb_defmfg = arg.defmfg || 'joyent';
	this._pdb_mfgrs = {};
	this._pdb_parts = {};
	this._pdb_sorted = [];
	this._pdb_dbroot = null;
}

PartsDB.prototype.find_part = function find_part(pn)
{
	var self = this;
	var root;

	if (typeof (pn) !== 'object') {
		var str = pn;
		pn = new PartNumber();
		pn.set(str);
	}

	root = pn.rootString();

	if (typeof (self._pdb_parts[root]) === 'object')
		return (self._pdb_parts[root]);

	return (null);
};

PartsDB.prototype.find_mfg = function find_mfg(mn)
{
	var self = this;

	if (self._pdb_mfgrs.hasOwnProperty(mn))
		return (self._pdb_mfgrs[mn]);

	return (null);
};

function
check_dependencies(pp, p)
{
	p._p_dependencies.forEach(function (c) {
		if (c === pp) {
			throw new Error(fmt('%s: circular dependency',
			    pp._p_pn.toString()));
		}
		check_dependencies(pp, c);
	});
}

PartsDB.prototype._check_and_populate = function ()
{
	var self = this;

	Object.keys(self._pdb_parts).forEach(function (rpn) {
		var p = self._pdb_parts[rpn];
		var m = self.find_mfg(p._p_mfg);

		assert.notStrictEqual(m, null,
		    fmt('bad manufacturer %s', p._p_mfg));
		p._p_mfg = m;

		p._p_constituents.forEach(function (def) {
			var cpn = def.pn;
			var c = self.find_part(cpn);
			var def_dr, child_dr;

			if (c === null) {
				throw new Error(fmt('part %s depends on ' +
				    'nonexistent %s', rpn, def.pn));
			}

			def_dr = cpn.dashroll();
			child_dr = c._p_pn.dashroll();

			if (def_dr !== child_dr && !p.is_eol()) {
				if (child_dr !== null) {
					throw new Error(fmt('part %s depends ' +
					    'on %s but %s is at dashroll %02d',
					    rpn, cpn.toString(),
					    cpn.rootString(), child_dr));
				}
				throw new Error(fmt('part %s depends on %s ' +
				    'but %s has no dashroll', rpn,
				    cpn.toString(), c._p_pn.rootString()));
			}

			if (c.is_revenue() && !p.is_revenue()) {
				throw new Error(fmt('part %s is at rev %02d ' +
				    'but dependency %s is at rev %02d',
				    rpn, p._p_rev,
				    c._p_pn.toString(), c._p_rev));
			}

			if (c.is_eol() && !p.is_eol()) {
				throw new Error(fmt('part %s is EOL but %s ' +
				    'consumes it anyway', c._p_pn.toString(),
				    p._p_pn.toString()));
			}

			delete(c.pn);
			def.part = c;
			p._p_dependencies.push(c);
			c._p_dependents.push(p);
		});
	});

	Object.keys(self._pdb_parts).forEach(function (rpn) {
		var p = self._pdb_parts[rpn];

		check_dependencies(p, p);
	});

	self._pdb_sorted = Object.keys(self._pdb_parts).sort(function (a, b) {
		if (self._pdb_parts[a]._p_dependencies.indexOf(b) !== -1)
			return (-1);
		if (self._pdb_parts[b]._p_dependencies.indexOf(a) !== -1)
			return (1);
		return (0);
	}).map(function (rpn) {
		return (self._pdb_parts[rpn]);
	});
};

PartsDB.prototype.load = function _load(arg)
{
	var self = this;
	var dirents;
	var mfgs;

	assert.strictEqual(typeof (arg), 'object', 'arg is not an object');
	assert.strictEqual(typeof (arg.dbdir), 'string',
	    'arg.dbroot is not a string');

	self._pdb_dbroot = path.resolve(arg.dbdir);

	mfgs = read_json(self._pdb_dbroot, 'manufacturers.json',
	    schema.sManufacturerArray);
	mfgs.forEach(function (m) {
		var mfgr = new Mfgr();

		mfgr.set(m);
		if (typeof (self._pdb_mfgrs[m.name]) === 'object') {
			throw new Error(fmt('duplicate manufacturer %s',
			    m.name));
		}

		self._pdb_mfgrs[m.name] = mfgr;
	});

	dirents = fs.readdirSync(path.join(self._pdb_dbroot, 'parts'));
	dirents.forEach(function (pnrootn) {
		var subdirs = fs.readdirSync(path.join(self._pdb_dbroot,
		    'parts', pnrootn));

		subdirs.forEach(function (sdn) {
			var part, obj;
			var rpn;

			if (!sdn.match(/\.json$/))
				return;

			obj = read_json(self._pdb_dbroot, 'parts', pnrootn, sdn,
			    schema.sPart);

			if (typeof (obj.mfg) === 'undefined')
				obj.mfg = self._pdb_defmfg;

			part = new Part();
			part.set(obj);

			rpn = part._p_pn.rootString();
			if (typeof (self._pdb_parts[rpn]) !== 'undefined') {
				throw new Error(fmt('duplicate part number %s',
				    rpn));
			}
			self._pdb_parts[rpn] = part;
		});
	});

	self._check_and_populate();
}

PartsDB.prototype.forEachPart = function (f)
{
	this._pdb_sorted.forEach(f);
};

PartsDB.prototype.filterParts = function (f)
{
	return (this._pdb_sorted.filter(f));
};

PartsDB.prototype.someParts = function (f)
{
	return (this._pdb_sorted.some(f));
};

PartsDB.prototype.everyPart = function (f)
{
	return (this._pdb_sorted.every(f));
};

PartsDB.prototype.sortParts = function (f)
{
	var self = this;
	var cmp = undefined;

	if (typeof (f) === 'function') {
		cmp = function (a, b) {
			return (f(self._pdb_parts[a], self._pdb_parts[b]));
		};
	}

	return (Object.keys(self._pdb_parts).sort(cmp).map(function (rpn) {
		return (self._pdb_parts[rpn]);
	}));
};

PartsDB.prototype.forEachManufacturer = function (f)
{
	var self = this;

	Object.keys(self._pdb_mfgrs).forEach(function (mn) {
		f(self._pdb_mfgrs[mn]);
	});
};

PartsDB.prototype.filterManufacturers = function (f)
{
	var self = this;

	return (Object.keys(self._pdb_mfgs).map(function (mn) {
		return (self._pdb_mfgs[mn]);
	}).filter(f));
};

PartsDB.prototype.someManufacturers = function (f)
{
	var self = this;

	return (self._pdb_mfgrs.some(function (mn) {
		return (f(self._pdb.mfgrs[mn]));
	}));
};

PartsDB.prototype.everyManufacturer = function (f)
{
	var self = this;

	return (self._pdb_mfgrs.every(function (mn) {
		return (f(self._pdb.mfgrs[mn]));
	}));
};

function
create(arg)
{
	var db = new PartsDB(arg);
	db.load(arg);

	return (db);
}

module.exports = {
	create: create
};
