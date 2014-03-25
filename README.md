# Manufacturing Specifications
---

This repository contains Joyent's communications to our hardware
partners defining how compute nodes are to be assembled and configured.

## Part Definition Schema

Every part in the database is defined by a single JSON file.  There are
two high-level classes: OEM parts (all of which have a prefix of 270),
and non-OEM parts.  While both share a common schema, certain aspects of
the schema are applicable only to one or other other.  Therefore each
schema element is described as being mandatory or optional for each part
class.

### Top-level Properties

These properties are valid only at the top level.  They cannot be
changed in a dashroll; therefore, they cannot be present in a change log
(see below).

#### pn

- Status: Mandatory for all parts

The *pn* property is a string specifying the base part number (with
prefix and suffix but without dashroll or revision numbers; see below)
of this part.

#### desc

- Status: Mandatory for all parts

The *desc* property is a string containing a free-form UTF-8 text
description of the part.  This description should be limited to 80
characters or fewer.

#### alias

- Status: Optional

The *alias* property is a string containing a free-form UTF-8 text
alternate name for the part.  This is used for display purposes only and
is useful for providing friendly or casual alternative names for human
use.

#### dashrolls

- Status: Not supported for OEM parts; Mandatory otherwise

The *dashrolls* property is an array of dashroll objects, the schema of
which is described in detail below.

### Generic Properties

These properties are valid at the top level and within a change log (see
below).  If present in a change log, the value of the property will
supersede the existing value, if any, for the dashroll to which the
change log applies and all subsequent dashrolls, unless and until
superseded by the value in a subsequent dashroll's change log.

#### mfg

- Status: Mandatory for OEM parts, Optional otherwise

The *mfg* property is a string containing one of the keywords in
manufacturers.json.  If this property is not present for a part, the
default manufacturer will be assumed.

#### mfgpn

- Status: Mandatory for OEM parts, Not Supported otherwise

The *mfgpn* property is a string containing the original manufacturer's
part number for the part.  This is distinct from the manufacturer using
the part number *pn*.

#### ref

- Status: Optional

The *ref* property describes one or more references describing or
defining the part in greater detail.  The property may be either a
reference object or an array of reference objects.  A reference object
has the following properties:

##### ref.uri

- Status: Mandatory

The *ref.uri* property is a string containing the well-formed URI of the
specification or other reference material.

##### ref.title

- Status: Optional

The *ref.title* property is a string containing a free-form UTF-8
display name to be used when displaying a link to the reference
material.

### Dashrolls and Change Logs

Every non-OEM part has at least one dashroll or change log.  The first
dashroll is numbered 01 and must define the set of constituent parts
forming the part (if any).  Subsequent dashrolls will be numbered in
decimal succession up to a maximum of 99.  The first (and only the
first) dashroll may define the *constituents* property as shown below.

Each dashroll object may contain an optional set of properties the
values of which override the values of the top-level properties
described in "Generic Properties" above.  The value of each such
property overrides the value established at the top level or by a
previous dashroll (if any).

In addition, each dashroll object contains a mandatory change log
object describing the changes to constituent parts or quantities
thereof.  The change log is specified by the *changes* property as shown
below.  This property is not valid in the first change log.  Change logs
are processed cumulatively; each dashroll is defined by the contents of
all previous change logs as described below.

Finally, each dashroll has a revision number.  A part's active dashroll
is the highest-numbered dashroll with a revision number of 50 or
greater.  No dashroll at revision 50 or higher may contain any part not
at revision 50 or higher.  The transition of a part's BOM to rev 50
serves as an indication that the part (or the relevant dashroll of the
part) is ready for revenue shipment.  The revision number is specified
by the *rev* property as described below.

The revision number is incremented any time the part's definition is
changed in ways not visible to consumers (that is, form, fit, or
function or the software analogues).  If a change is made to the form,
fit, or function of hardware or any visible interface provided or
required by software, of a part that is at revision 50 or higher, a new
dashroll is required instead.  Prior to revision 50, any number of
changes may be made to the definition of the part.

#### Change Log Validity and Ordering

A change log must not contain both addition and removal of the same
constituent part.  Only the net change in quantity required should be
reflected in either an *add* or *remove* property for each constituent
part.

The *replace* operation is applied to the existing BOM prior to changes
to the required quantity via *add* or *remove* properties.  Thus, if a
change log contains both an *add* object and a *replace* object
containing the same property name, it is invalid.  In such instance, the
*add* object must contain a property named for the replacement
constituent part specified as that property's value in the *replace*
object.  The same restriction applies to the *remove* object.

Removal of a constituent part that does not exist or is not contained in
the accumulated BOM is not allowed, and a changelog specifying that
removal is invalid.  Similarly, no part that is not a constituent of the
previous dashroll of the specified part may appear as the name of a
property in the *replace* object.

#### dashroll.constituents

- Status: Optional in the first dashroll; Not Supported otherwise

The *dashroll.constituents* property is an object whose properties are
part numbers from within the database, which may be specified at the
dashroll level if the constituent part has at least one dashroll
defined.  The value of each property is an integer indicating the number
of that component part required to build the part.

#### dashroll.rev

- Status: Mandatory

The *dashroll.rev* property is an integer in the range \[1,99\] that
represents the revision level of the dashroll.  See the discussion of
dashrolls and revision numbers above.

#### dashroll.changes

- Status: Optional, unless no Generic Properties are specified in which
  case Mandatory

The *dashroll.changes* property is an object describing the differences
between the current and previous dashroll.  It has at least one of the
properties listed below.

##### dashroll.changes.add

- Status: Optional; see above

The *dashroll.changes.add* property is an object conforming to the same
schema as the *dashroll.constituents* property described above.  For
each property of this object, the quantity of the constituent part
specified by the named property will be increased by that property's
integer value.

##### dashroll.changes.remove

- Status: Optional; see above

The *dashroll.changes.remove* property is an object conforming to the
same schema as the *dashroll.constituents* property described above.
For each property of this object, the quantity of the constituent part
specified by the named property will be reduced by that property's
integer value.  The quantity of a constituent part may not be reduced
below 0.

##### dashroll.changes.replace

- Status: Optional; see above

The *dashroll.changes.replace* property is an object whose properties
are named for the constituent part number, with dashroll if the
constituent part has at least one dashroll, to be replaced.  The value
of each such property is a string specifying the part number of the part
with which it is to be replaced, with dashroll if the replacement part
has at least one dashroll.

Replacement affects only constituent parts listed in this part's
top-level BOM; that is, the list of parts contained in the
*dashroll.constituents* property and modified by subsequent change logs.
It does not affect the constituent parts of those referenced parts or
any other lower-level constituent parts thereof.  The quantity of the
part replaced is unchanged.

When specifying a replacement in which the replacement part's general
function is similar to or the same as the part it is replacing, this
property is to be used in preference to properties in the *add* and
*remove* objects defined above.  However, this property should not be
used to specify the removal of one constituent part from the BOM and the
unrelated addition of some other constituent part.

## Validation of BOMs

BOMs are validated based on the criteria described above.  In addition,
no BOM may contain a part number for which no BOM is available.
Reference properties e.g. *mfg*, may not reference nonexistent entities.
No two BOMs may define the same part (that is, no two JSON BOM files may
contain objects with the same *pn* property value).

Circular dependencies in constituent part chains will be detected and
are not permitted.

Part numbers are checked for validity.  All valid part numbers satisfy
exactly the following regular expression:

```
	/[1-9][0-9][0-9]-[0-9]{4}(-(0[1-9])|([1-9][0-9]))?/
```

All dependencies will be checked to ensure that they satisfy the
revenue-ready constraints described above with respect to revision
levels.

A dependency on a constituent part must explicitly specify a dashroll if
that constituent part has at least one dashroll defined.  All non-OEM
parts must define at least one dashroll.  The specification may call for
a dependency on a constituent part at a dashroll other than the
currently active one; however, the tools will emit a warning if this
condition exists for a dependent dashroll at rev 50 or higher.

BOMs missing Mandatory properties or containing properties listed above
as Not Supported will be rejected.

All changes to this repository must pass BOM validation, as determined
by the `check` target.

## Specifications

It is expected that specifications for many parts will be integrated
into this repository.  Each specification is associated with a root part
number (not a dashroll) so that history can be maintained.  Since,
unlike the BOMs themselves, these specifications are not defined as a
history of changes, any reference to a specification must be made to a
URI providing the revision of the specification applicable to that
dashroll.  Any change to a specification must be accompanied by a new
dashroll (or revision, if appropriate) to the part defined by that
specification.  The simplest way to achieve this is to use the
SHA-specific Github URI in the specification's *ref.uri* property.

Specifications should be written in plain text or Markdown.
