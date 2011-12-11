# This script is helpful for checking common javascript issue

rm src/*~ -f

# Find all TODO's in the source code
grep "TODO" src/* -r --color

# x == [] is always false since javascript is comparing references rather than values
# Use x.length == 0 instead
#grep "\=\= \[\]" src/* -r --color
#grep "\!\= \[\]" src/* -r --color

# Also search for array = [] since, in my own opinion, array.length = 0 might be
# faster for garbage collection (in certainly cases only - this is just a hint,
# it need not apply everywhere, especially where we want memory to be reclaimed
# and obviously where arrays are initialized. Be carefull not to remove valid 
# cases)
grep "\= \[\]" src/* -r --color

# Search for debugging helpers
grep "console.log" src/* -r --color
grep "alert" src/* -r --color

# slice(0) can be written slice()
grep "slice(0)" src/* -r --color

# Properly capitalize the name 'WebGL'
grep "webgl" src/* -r --color

