<!--
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<!--
    Copyright (c) 2017, Joyent, Inc.
-->

# Allocations

This document serves to summarize various allocations that we've made
which are used as part of SMBIOS and other product naming.

## Products, SKU, Common Name

| SKU | Common Name | Product ID |
|-----|-------------|------------|
| Richmond A | JCP 1101 | 600-0002 |
| Richmond B | JCP 1201 | 600-0004 |
| Richmond C | JCP 1102 | 600-0006 |
| Mantis Shrip Mk. I | JSP 5001 | 600-0007 |
| Tenderloin A | JCP 2101 | 600-0015 |
| Tenderloin B | JCP 2201 | 600-0016 |
| Tenderloin C | JCP 2102 | 600-0017 |
| Mantis Shrimp MK. II | JSP 6001 | 600-0018 |
| Tenderloin A / Reduced Storage | JCP 2101 | 600-0019 |
| Tenderloin C / Reduced Storage | JCP 2102 | 600-0020 |
| Priest River A | JCP 9001 | 600-0021 |
| Priest River C | JCP 9002 | 600-0022 |
| Hallasan A | JCP 3301 | 600-0023 |
| Hallasan C / Reduced Storage | JCP 3302 | 600-0024 |
| Hallasan C | JCP 3302 | 600-0026 |
| Mantis Shrimp Mk. III | JSP 7001 | 600-0025 |
| Hallasan A r2 | JCP 3101 | 600-0027 |
| Hallasan B | JSP 7001 | 600-0028 |
| Hallasan B / Reduced Storage | JCP 3201 | 600-0029 |
| Hallasan C / Reduced Storage r2 | JCP 3102 | 600-0030 |
| Hallasan C r2 | JCP 3102 | 600-0031 |

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
