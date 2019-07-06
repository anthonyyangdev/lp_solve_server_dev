noinst_PROGRAMS  = demo
demo_SOURCES  = demo.c
demo_LDADD    = -L$(top_srcdir) -llpsolve55 @ADDITIONAL_LIBS@
INCLUDES = -I $(top_srcdir) 

check_programs = demo
check_DATA = demo.right
check_SCRIPTS = check_demo
TESTS = $(check_SCRIPTS) 

EXTRA_DIST = $(check_DATA)

check-am:	make-executable
make-executable: check_demo
	chmod +x check_demo

MOSTLYCLEANFILES = *.out

