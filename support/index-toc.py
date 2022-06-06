#!/usr/bin/env python

"""
Generate an HTML TOC for the index markdown file.

We want an `<li>` for each of the given files.
We exclude the bounding `<ul>` and `</ul>` to make
it easier to inline in the HTML template.
"""

import os
import sys
import codecs
import re


#---- mainline

NAME = os.path.basename(__file__)
if NAME.endswith(".pyc"):
    NAME = NAME[:-1]

if len(sys.argv) < 2:
    sys.stderr.write("%s: error: no input files given\n" % NAME)
    sys.exit(1)

for md_path in sys.argv[1:]:
    content = codecs.open(md_path, 'r', 'utf8').read()
    match = re.compile(r'^#+ (.*?)$', re.M).search(content)
    if not match:
        sys.stderr.write("%s: error: could not find title '# ...' in '%s' file\n"
            % (NAME, md_path))
        sys.exit(1)
    html_path = os.path.basename(os.path.splitext(md_path)[0]) + '.html'
    title = match.group(1).strip()
    print(f'<li><a href="{html_path}">{title}</a></li>')

