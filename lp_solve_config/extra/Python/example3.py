from Numeric import *
x = dot(invert(array([[1, 1], [110, 30]])), array([75, 4000]))
print x
P = dot(array([143, 60]), x)
print P
