/*
 * Copyright 2014 Joyent, Inc.  All rights reserved.
 */

var sStringNonEmpty = {
	'type': 'string',
	'minLength': 1
};

var sStringRequiredNonEmpty = {
	'type': 'string',
	'required': true,
	'minLength': 1
};

var sPositiveInteger = {
	'type': 'integer',
	'minimum': 1
};

var sPositiveIntegerRequired = {
	'type': 'integer',
	'required': true,
	'minimum': 1
};

var sBasePartNumberRequired = {
	'type': 'string',
	'pattern': /^[1-9][0-9][0-9]-[0-9][0-9][0-9][0-9]$/,
	'required': true
};

var sPartNumberRequired = {
	'type': 'string',
	'pattern': /^[1-9][0-9][0-9]-[0-9][0-9][0-9][0-9](-[0-9][0-9])?$/,
	'required': true
};

var sURIRequired = {
	'type': 'string',
	'format': 'uri',
	'required': true
};

var sRef = {
	'type': 'object',
	'additionalProperties': false,
	'properties': {
		'uri': sURIRequired,
		'title': sStringRequiredNonEmpty
	}
};

var sRefs = {
	'type': 'array',
	'items': sRef
};

var sRefsRequired = {
	'type': 'array',
	'required': true,
	'items': sRef
};

var sEngineeringRev = {
	'type': 'integer',
	'enum': [ 1 ]
};

var sRevenueRev = {
	'type': 'integer',
	'minimum': 50,
	'maximum': 99
};

var sRevRequired = {
	'type': [ sEngineeringRev, sRevenueRev ],
	'required': true
};

var sDate = {
	'type': 'string',
	'format': 'date-time'
};

var sConstituent = {
	'type': 'object',
	'additionalProperties': false,
	'properties': {
		'pn': sPartNumberRequired,
		'qty': sPositiveInteger
	}
};

var sConstituents = {
	'type': 'array',
	'items': sConstituent
};

var sRsrcClass = {
	'type': 'string',
	'enum': [ 'cpu', 'memory', 'storage', 'nic' ]
};

var sResource = {
	'type': 'object',
	'additionalProperties': false,
	'properties': {
		'class': sRsrcClass,
		'type': sStringRequiredNonEmpty,
		'size': sPositiveIntegerRequired,
		'qty': sPositiveIntegerRequired
	}
};

var sResources = {
	'type': 'array',
	'items': sResource
};

var sThirdPartyPart = {
	'type': 'object',
	'additionalProperties': false,
	'properties': {
		'pn': sBasePartNumberRequired,
		'mfg': sStringRequiredNonEmpty,
		'mfgpn': sStringRequiredNonEmpty,
		'desc': sStringRequiredNonEmpty,
		'alias': sStringNonEmpty,
		'resources': sResources,
		'refs': sRefsRequired,
		'eol': sDate
	}
};

var sFirstPartyPart = {
	'type': 'object',
	'additionalProperties': false,
	'properties': {
		'pn': sBasePartNumberRequired,
		'desc': sStringRequiredNonEmpty,
		'alias': sStringNonEmpty,
		'dashroll': sPositiveIntegerRequired,
		'rev': sRevRequired,
		'resources': sResources,
		'refs': sRefs,
		'eol': sDate,
		'constituents': sConstituents
	}
};

var sPart = {
	'type': [ sFirstPartyPart, sThirdPartyPart ]
};

var sManufacturer = {
	'type': 'object',
	'additionalProperties': false,
	'properties': {
		'name': sStringRequiredNonEmpty,
		'title': sStringRequiredNonEmpty,
		'refs': sRefs
	}
};

var sManufacturerArray = {
	'type': 'array',
	'items': sManufacturer
};

exports.sPart = sPart;
exports.sManufacturerArray = sManufacturerArray;
