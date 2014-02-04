#
# This file and its contents are supplied under the terms of the
# Common Development and Distribution License ("CDDL"), version 1.0.
# You may only use this file in accordance with the terms of version
# 1.0 of the CDDL.
#
# A full copy of the text of the CDDL should have accompanied this
# source.  A copy of the CDDL is also available via the Internet at
# http://www.illumos.org/license/CDDL.
#

#
# Copyright 2014 (c) Joyent, Inc.  All rights reserved.
#

PTYHON =	python
MD = 		./support/markdown2.py
MARKDOWN2_TOC =	./support/markdown2-toc.py
INDEX_TOC =	./support/index-toc.py

HEADER =	assets/header.html
TRAILER =	assets/trailer.html
TOC_HEADER =	assets/toc_header.html
TOC_TRAILER =	assets/toc_trailer.html

BOOTSTRAP_MIN =		.min
BOOTSTRAP_TYPES =	css img js
BOOTSTRAP_FILES = \
	css/bootstrap$(BOOTSTRAP_MIN).css \
	img/glyphicons-halflings-white.png \
	img/glyphicons-halflings.png \
	js/bootstrap$(BOOTSTRAP_MIN).js

MDARGS = \
	--extras fenced-code-blocks \
	--extras wiki-tables \
	--extras header-ids \
	--extras link-patterns \
	--link-patterns-file support/link-patterns.txt

IMAGE_FILES = \
	logo.png \

FILES = \
	bom.md \
	index.md

OUTDIR =	build/docs/public
BOOTSTRAP_OUTDIRS = \
	$(BOOTSTRAP_TYPES:%=$(OUTDIR)/bootstrap/%)

OUTFILES = \
	$(FILES:%.md=$(OUTDIR)/%.html) \
	$(IMAGE_FILES:%=$(OUTDIR)/img/%) \
	$(BOOTSTRAP_FILES:%=$(OUTDIR)/bootstrap/%)

docs: all

all: $(OUTDIR) $(BOOTSTRAP_OUTDIRS) $(OUTFILES)

$(OUTDIR):
	mkdir -p "$@"

$(OUTDIR)/img:
	mkdir -p "$@"

$(BOOTSTRAP_OUTDIRS):
	mkdir -p "$@"

$(OUTDIR)/%.html: %.md $(HEADER) $(TRAILER) $(OUTDIR) $(FILES)
	sed '/<!-- vim:[^:]*: -->/d' $(HEADER) > $@
	sed '/<!-- vim:[^:]*: -->/d' $(TOC_HEADER) >> $@
	[[ "$<" == "index.md" ]] \
		&& $(PYTHON) $(INDEX_TOC) $(FILES) >> $@ \
		|| $(PYTHON) $(MARKDOWN2_TOC) $< >> $@
	sed '/<!-- vim:[^:]*: -->/d' $(TOC_TRAILER) >> $@
	$(PYTHON) $(MD) $(MDARGS) $< >> $@
	sed '/<!-- vim:[^:]*: -->/d' $(TRAILER) >> $@

$(OUTDIR)/img/%: assets/% $(OUTDIR)/img
	cp $< $@
	touch $@

$(OUTDIR)/bootstrap/%: assets/bootstrap/% $(BOOTSTRAP_OUTDIRS)
	cp $< $@
	touch $@

bom.md: parts/*/*.json manufacturers.json support/mkbom.js
	echo $@
	pwd
	( support/mkbom.js ) > $@

clean:
	rm -rf build

clobber: clean

FRC: