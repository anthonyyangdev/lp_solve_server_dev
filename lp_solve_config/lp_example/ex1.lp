/* Simple LP problem in LP format. 

   Note that multiplication between the coefficient and a variable
   name is implied. So 2x1 is the same as 2 * x1, x2 means
   1 * x2, and 4 x2 means 4 * x2.
*/

/* Objective function: Maximize -x1 + 2*x2 */
max: -x1 + 2 x2;

/* The constraint below is given a row name, C1. */
C1: 2x1 + x2 < 5;

-4 x1 + 4 x2 <5;

/* Declare x1 and x2 integer variables. The default is real */
int x1,x2;

