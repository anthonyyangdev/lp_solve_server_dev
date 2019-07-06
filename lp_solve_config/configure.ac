AC_PREREQ(2.52)
AC_INIT([lpsolve],5.5.0.10i,[], [])
AC_CONFIG_SRCDIR(lp_simplex.c)
AC_CANONICAL_HOST
AM_INIT_AUTOMAKE([1.7])
AM_MAINTAINER_MODE
AM_SANITY_CHECK
AC_PROG_RANLIB
AC_PROG_YACC
AC_PROG_LEX

SHARED_LIB=liblpsolve55.so
ADDITIONAL_LIBS="-lc -lm -ldl"
SHARED_FLAGS='-shared -Wl,-Bsymbolic -Wl,-soname,$@'
SO=.so
case $host_os in
  hp*|HP*) 
    DEF=-ldld
    case `uname -m` in
      ia64) SO=.so;;
      *)    SO=.sl;;
    esac
    if test "$GCC" = yes;
      then CCSHARED="-fPIC";
      else CCSHARED="+z";
    fi;;
  cygwin*)
    SO=.dll
    CCSHARED="-DINLINE=static -mno-cygwin -shared -enable-stdcall-fixup -D_USRDLL -DWIN32"
    SHARED_LIB=lpsolve55.dll
    SHARED_FLAGS="./lp_solve.def"
    ;;
  netbsd*) 
    ADDITIONAL_LIBS="-lc -lm -lcompat"
    ;;  
  linux) 
    CCSHARED="-fPIC";;
  apple-darwin) 
    DEF=-ldl -idirafter /usr/include/sys -DINTEGERTIME -Wno-long-double
    ;;
  OpenUNIX*|UnixWare*)
    DEF='-dy -DNOLONGLONG'
    if test "$GCC" = "yes"
      then CCSHARED="-fPIC"
      else CCSHARED="-K PIC"
    fi;;
  SCO_SV*)
    DEF='-dy -DNOLONGLONG'
    if test "$GCC" = "yes"
      then CCSHARED="-fPIC"
      else CCSHARED="-Kpic -belf"
    fi;;
 *)
esac

AC_SUBST(SO)
AC_SUBST(CCSHARED)
AC_SUBST(DEF)
AC_SUBST(SHARED_LIB)
AC_SUBST(SHARED_FLAGS)
AC_SUBST(ADDITIONAL_LIBS)
     
AC_PROG_CC
if test "x$GCC" != "xyes" 
then
  echo "*** non GNU CC compiler detected."
  echo "*** This package has not been tested very well with non GNU compilers"
fi

# We use a diff in regression testing
AC_PATH_PROG(DIFF, diff, no)
DIFF_OPTS=

if test "$DIFF" = no ; then
   AC_PATH_PROG(DIFF, cmp, no)
else 
  # Try for GNU diff options.
  # MSDOG output uses \r\n rather than \n in tests
  for diff_opt in -w --unified ; do 
    if $DIFF $diff_opt ./configure ./configure > /dev/null 2>&1; then
      AC_MSG_RESULT([adding $diff_opt to diff in regression tests])
      DIFF_OPTS="$DIFF_OPTS $diff_opt"
    fi
  done
fi
AC_SUBST(DIFF)
AC_SUBST(DIFF_OPTS)

AC_PROG_INSTALL
AC_CONFIG_FILES([ \
	Makefile \
	demo/Makefile \
        lpsolve55.pc \
	lp_solve/Makefile \
	lp_solve/doc/Makefile \
	lp_solve/doc/en/Makefile \
	lp_solve/doc/en/lp_solve.1
])
AC_CONFIG_FILES([demo/check_demo], [chmod +x demo/check_demo])
AC_CONFIG_FILES([lp_solve/check_lpsolve], [chmod +x lp_solve/check_lpsolve])
AC_OUTPUT

