/* Andrew Lutomirski reports that in some unspecified version of lpsolve
   the following will report 5 when -presolvecol is given. He suggests
   that there may also be a problem in said versions when -presolvec is given
   as well.
*/

max: x;
a: x <= 11;
b: x + y <= 5;
x >= 10;
sec x;
