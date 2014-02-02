#!/usr/bin/env python

"""Emit an HTML toc for the given markdown file.

The emitted HTML does *not* include the `<ul>` prefix and `</ul>`
suffix, which often helps integrating into an HTML template.
"""

import os
import sys

# Expect a markdown2.py in the same dir.
sys.path.insert(0, os.path.dirname(__file__))
import markdown2


#---- mainline

NAME = os.path.basename(__file__)
if NAME.endswith(".pyc"):
    NAME = NAME[:-1]

if len(sys.argv) < 2:
    sys.stderr.write("%s: error: no markdown file given\n" % NAME)
    sys.exit(1)
md_path = sys.argv[1]

html = markdown2.markdown_path(md_path, extras=['toc'])
toc_with_uls = html.toc_html
raw_toc = ''.join(toc_with_uls.splitlines(True)[1:-1])
sys.stdout.write(raw_toc)
