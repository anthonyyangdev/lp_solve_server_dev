manfiles = lp_solve.1 
man_MANS = $(manfiles)

EXTRA_DIST = $(manfiles) lp_solve.1.in

mostlyclean-generic:
	-rm -f *~ \#* .*~ .\#*

maintainer-clean-generic:
	-@echo "This command is intended for maintainers to use;"
	-@echo "it deletes files that may require special tools to rebuild."
	-rm -f Makefile.in $(manfiles)
