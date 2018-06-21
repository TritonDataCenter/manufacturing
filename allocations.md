<!--
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<!--
    Copyright (c) 2018, Joyent, Inc.
-->

# Allocations

This document serves to summarize various allocations that we've made
which are used as part of SMBIOS and other product naming.

There are two major revisions of how we name products. The SKUs for
such products have changed. The old scheme is summarized in Appendix A.
While systems have both an Old Product Name and a New Product Name,
systems that only have a new product name are manufactured with that
product name.

First we will have a table that summarizes the Products, Common Name,
and SKUs. This will be followed by an explanation of the scheme.


## Products, SKU, Common Name

| Common Name | Product | Base SKU | Old Product |
|-------------|---------|-----|-------------|
| Richmond A | M10G1 | 600-0002 |JCP 1101 |
| Richmond B | S11G1 | 600-0004 | JCP 1201 |
| Richmond C | M10G1 | 600-0006 | JCP 1102 |
| Mantis Shrip Mk. I | S10G1 | 600-0007 | JSP 5001 |
| Tenderloin A | M10G2 | 600-0015 | JCP 2101 |
| Tenderloin B | S11G2 | 600-0016 | JCP 2201 |
| Tenderloin C | M10G2 | 600-0017 |  JCP 2102 |
| Mantis Shrimp MK. II | S10G2 | 600-0018 | JSP 6001 |
| Tenderloin A / Reduced Storage | M10G2 | 600-0019 | JCP 2101 |
| Tenderloin C / Reduced Storage | M10G2 | 600-0020 | JCP 2102 |
| Priest River A | M11G3 | 600-0021 | JCP 9001 |
| Priest River C | M11G3 | 600-0022 | JCP 9002 |
| Hallasan A | M11G4 | 600-0023 | JCP 3301 |
| Hallasan C / Reduced Storage | M11G4 | 600-0024 | JCP 3302 |
| Hallasan C | M11G4 | 600-0026 |  JCP 3302 |
| Mantis Shrimp Mk. III | S10G4 | 600-0025 | JSP 7001 |
| Hallasan A r2 | M12G4 | 600-0027 | JCP 3101 |
| Hallasan B | S10G4 | 600-0028 | JSP 7001 |
| Hallasan B / Reduced Storage | S10G4 | 600-0029 | JCP 3201 |
| Hallasan C / Reduced Storage r2 | M12G4 | 600-0030 | JCP 3102 |
| Hallasan C r2 | M12G4 | 600-0031 | JCP 3102 |
| Jirisan A | M12G5 | 600-0032 | - |
| Jirisan B | S12G5 | 600-0033 | - |
| Jirisan C (12) | M12G5 | 600-0034 | - |
| Jirisan C (24) | M12G5 | 600-0035 | - |
| Mantis Shrimp Mk. IV | S10G5 | 600-0036 | - |

### Explanation of Product and SKUs

Each system that we manufacture has two different means of
identification. The first is the Product and the second is the SKU.

#### Product

The product is used to relate the hardware systems into a general class
of system. This is used to encapsulate the type of chassis and system
board. For example, it is used to encode the type of processors, the
type of storage backplanes, etc.

Today we have three different lines of systems that we care about (two
of which are being manufactured at this time):

1. General purpose compute platforms - The M series
2. Platforms intended for Storage - The S series
3. Platforms intended for use with accelerators - The X series

Associated with each line is a two digit value that indicates a product.
Each line has its own stream of values. The last part of these values
are used to represent generations. The generations are as follows:

| Generation | Processor |
|------------|-----------|
| G1 | Sandy Bridge |
| G2 | Ivy Bridge |
| G3 | Haswell |
| G4 | Broadwell |
| G5 | Skylake |

AMD EPYC processors would likely overlap with either G5 or G6 systems if
they enter the manufacturing system.

##### Mainline Products

| Product | System |
|---------|--------|
| M10G1 | SMCI CSE-213A-R740LPB, SMCI X9DRD-7JLN4F, Sandy Bridge |
| M10G2 | SMCI CSE-213A-R740LPB, SMCI X9DRD-7JLN4F, Sandy Bridge |
| M11G3 | Dell R730, Haswell |
| M11G4 | Dell R730, Broadwell |
| M12G4 | SMCI SSG-2028R-ACR24L, Broadwell |
| M12G5 | SMCI 2029P-ACR24L, Skylake |

##### Storage Products

| Product | System |
|---------|--------|
| S10G1 | SMCI SSG-6047R-E1R36L, Sandy Bridge |
| S10G2 | SMCI CSE-847E16-R1K28LPB, SMCI X9DRD-7JLN4F, Ivy Bridge |
| S10G4 | SMCI SSG-6048R-E1CR36L, Broadwell |
| S10G5 | SMCI SSG-6049P-E1CR36L, Skylake |
| S11G1 | SMCI SSG-6027R-E1R12L, Sandy Bridge |
| S11G2 | SMCI CSE-826BE16-R920LPB, SMCI X9DRD-7JLN4F, Ivy Bridge |
| S12G5 | SMCI 6029P-E1CR12L, Skylake |

#### SKU

The SKU is then used to encode a specific bill of materials. A SKU
exists for each system with its own purpose that needs to coexist. Each
SKU has an associated revision or dash roll. That revision is appended
as a zero padded three digit number to the base SKU. This is used to
represent changes to the specific bill of materials for that system.
If the quantity or part number for a DIMM changes, that would involve a
change of the revision.

To get the starting full SKU for any of the Base SKUs listed above,
append `-001` to the Base SKU.

## Appendix A: Original Product Scheme

This section describes how the original product scheme was put together.

### Notes on JCP Line

The x000 digit indicates the hardware generation. 1 is for Sandy Bridge.
2 is for Ivy Bridge. 3 is for Broadwell. The Haswell generation used the
value of 9.

The 0x00 digit is used to indicate the storage technology and backplane.
1 is used for a passive backplane that accepts 2.5" drives (SFF). 2 is
used for an active backplane, based on SAS expanders, that accepts 3.5"
drives (LFF). 3 is used for an active backplane, based on SAS expanders,
that accepts 2.5" drives (SFF).

The 00x0 digit is unused.

The 000x digit is used to indicate the type of drives in use. A 1
indicates rotating media (HDD). A 2 indicates solid state drives (SSD).

### Notes on JSP line

The x000 indicates the hardware generation. 5 is for Sandy Bridge. 2 is
for Ivy Bridge. 3 is for Broadwell. There was no Haswell generation
system.
