# This script is helpful for checking common javascript issue

rm src/*~ -f

# Find all TODO's in the source code
grep "TODO" src/* -r --color

# x == [] is always false since javascript is comparing references rather than values
# Use x.length == 0 instead
grep "\=\= \[\]" src/* -r --color
grep "\!\= \[\]" src/* -r --color

# Search for debugging helpers
grep "console.log" src/* -r --color
grep "alert" src/* -r --color

# slice(0) can be written slice()
grep "slice(0)" src/* -r --color

# Properly capitalize the name 'WebGL'
grep "webgl" src/* -r --color

