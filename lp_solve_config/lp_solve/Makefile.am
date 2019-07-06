SUBDIRS = doc
bin_PROGRAMS  = lp_solve
lp_solve_SOURCES  = lp_solve.c
lp_solve_LDADD    = -L$(top_srcdir) -llpsolve55 @ADDITIONAL_LIBS@
DEFINES=-DYY_NEVER_INTERACTIVE -DPARSER_LP -DINVERSE_ACTIVE=INVERSE_LUSOL -DRoleIsExternalInvEngine @DEF@
INCLUDES = -I $(top_srcdir) $(DEFINES)

check_DATA = \
	     $(top_srcdir)/test/e1.lp \
	     $(top_srcdir)/test/ex7.lp \
             $(top_srcdir)/test/colbug.lp \
	     $(top_srcdir)/test/coldombug.lp \
	     $(top_srcdir)/test/presolveqbug.lp \
	     $(top_srcdir)/test/presolveqbug.lp
check_SCRIPTS = check_lpsolve
TESTS = $(check_SCRIPTS) 
