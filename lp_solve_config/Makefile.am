# Make sure to build the top-level directory first. We have to do this
# because the lpsolve55 library which demo and lp_solve depend on is at the
# top-level. It would be a little simpler and cleaner to put the
# libraries in a lib directory.
SUBDIRS =  . demo lp_solve

# pkg-config(1) related rules
pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = lpsolve55.pc 

$(pkgconfig_DATA): config.status

LEXFILE.l= lp_rlp.l
LEXFILE.h= $(LEXFILE.l:.l=.h)
YACCFILE.y= lp_rlp.y

lpsolve55dir=$(includedir)
lpsolve55_HEADERS = \
	declare.h \
	fortify.h \
	ini.h \
	lp_crash.h \
	lp_explicit.h \
	lp_fortify.h \
	lp_Hash.h \
	lpkit.h \
	lp_lib.h \
	lp_matrix.h \
	lp_MDO.h \
	lp_mipbb.h \
	lp_MPS.h \
	lp_presolve.h \
	lp_price.h \
	lp_pricePSE.h \
	lp_report.h \
	lp_rlp.h \
	lp_scale.h \
	lp_simplex.h \
	lp_solveDLL.h \
	lpsolve.h \
	lp_SOS.h \
	lp_types.h \
	lp_utils.h \
	lp_wlp.h \
	ufortify.h \
	yacc_read.h

lib_LIBRARIES = liblpsolve55.a
common_sources = lp_MDO.c \
	$(top_srcdir)/shared/commonlib.c \
	$(top_srcdir)/shared/mmio.c \
	$(top_srcdir)/shared/myblas.c \
	$(top_srcdir)/ini.c \
	$(top_srcdir)/fortify.c \
	$(top_srcdir)/colamd/colamd.c \
	$(YACCFILE.c) \
	$(top_srcdir)/lp_crash.c \
	$(top_srcdir)/bfp/bfp_LUSOL/lp_LUSOL.c \
	$(top_srcdir)/bfp/bfp_LUSOL/LUSOL/lusol.c \
	$(top_srcdir)/lp_Hash.c \
	$(top_srcdir)/lp_lib.c \
	$(top_srcdir)/lp_wlp.c \
	$(top_srcdir)/lp_matrix.c \
	$(top_srcdir)/lp_mipbb.c \
	$(top_srcdir)/lp_MPS.c \
	$(top_srcdir)/lp_params.c \
	$(top_srcdir)/lp_presolve.c \
	$(top_srcdir)/lp_price.c \
	$(top_srcdir)/lp_pricePSE.c \
	$(top_srcdir)/lp_report.c \
        $(top_srcdir)/lp_rlp.c \
	$(top_srcdir)/lp_scale.c \
	$(top_srcdir)/lp_simplex.c \
	$(top_srcdir)/lp_SOS.c \
	$(top_srcdir)/lp_utils.c \
        $(top_srcdir)/yacc_read.c

liblpsolve55_a_SOURCES = $(common_sources) 
#	$(top_srcdir)/$(YACCFILE.y) \
#	$(LEXFILE.h) \
#	$(top_srcdir)/$(LEXFILE.l)

liblpsolve55_dll_sources = $(common_sources)

# $(LEXFILE.h): $(LEXFILE.l)
#	$(LEX) $(LEXFILE.l)
#	sed -e "s/yy/lp_yy/g" lex.yy.c > $(LEXFILE.h)
#	rm -f lex.yy.c

# A problem in MSVC 8 was reported by Andy Lutomirski in regenerating
# the lp_rlp.l If you need to regenerate, you can by uncommenting below
# YACCFILE.c= $(YACCFILE.y:.y=.c)
# $(YACCFILE.c): $(YACCFILE.y) $(LEXFILE.h)
#	$(YACC) $(YACCFILE.y)
#	sed -e "s/yy/lp_yy/g" y.tab.c > $(YACCFILE.c)
#	rm -f y.tab.c

DEFINES=-DYY_NEVER_INTERACTIVE -DPARSER_LP -DINVERSE_ACTIVE=INVERSE_LUSOL -DRoleIsExternalInvEngine @DEF@
INCLUDES=-I$(top_srcdir) -I$(top_srcdir)/shared -I$(top_srcdir)/bfp \
         -I$(top_srcdir)/bfp/bfp_LUSOL -I$(top_srcdir)/bfp/bfp_LUSOL/LUSOL -I$(top_srcdir)/colamd $(DEFINES)

LIBS=@LIBS@

PACKAGE_NAME=@PACKAGE_NAME@
PACKAGE_STRING=@PACKAGE_NAME@-@PACKAGE_VERSION@
CCSHARED=@CCSHARED@
includedir = @includedir@/lpsolve
libdir = @libdir@
SO=@SO@

lpsolve55.dll: $(liblpsolve55_SOURCES)
	$(CC) $(CCSHARED) -s $(INCLUDES) $(CFLAGS) $(DEFINES) $(liblpsolve55_dll_sources) @SHARED_FLAGS@ -o $@

liblpsolve55@SO@: $(liblpsolve55_SOURCES)
	$(CC) $(CCSHARED) -s -c $(INCLUDES) $(CFLAGS) $(DEFINES) $(liblpsolve55_a_SOURCES)
	$(CC) @SHARED_FLAGS@ -o $@ `echo $(SOURCES)|sed s/[.]c/.o/g|sed 's/[^ ]*\///g'` $(LIBS)

install-HEADERS: $(HEADERS)
	test -d $(includedir) || $(mkdir_p) $(includedir)
	@list='$(HEADERS)'; for p in $$list; do \
	  echo " $(INSTALL) $$p $(includedir)/$$f"; \
	  $(INSTALL) $$p $(includedir)/$$f; \
	done

uninstall-HEADERS:
	@set -x; @list=$(HEADERS); for p in $$list; do \
	  echo " rm -f $(includedir)/$$f"; \
	  rm -f "$(includedir)/$$f"; \
	done

install-LIBRARIES: liblpsolve55.a @SHARED_LIB@
	test -d $(libdir) || $(mkdir_p) $(libdir)
	@list='liblpsolve55.a @SHARED_LIB@'; for p in $$list; do \
	  if test -f $$p; then \
	    echo " $(INSTALL) $$p $(libdir)/$$f"; \
	    $(INSTALL) $$p $(libdir)/$$f; \
	  else :; fi; \
	done

# We use a MANIFEST file to store list of distribution files.
dist: 
	tar -cpf- -T MANIFEST | (cd  $(PACKAGE_STRING) && tar -xpf- )
	tar -cjpf $(PACKAGE_STRING).tar.bz2 ./$(PACKAGE_STRING)
	-rm -fr $(PACKAGE_STRING)

DISTCLEANFILES = $(YACCFILE.c)
MOSTLYCLEANFILES = *.o *$(SO)
