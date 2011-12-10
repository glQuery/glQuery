# This script is helpful for checking common javascript issue

rm src/*~ -f

# x == [] is always false since javascript is comparing references rather than values
# Use x.length == 0 instead
grep "\=\= \[\]" src/* -r
grep "\!\= \[\]" src/* -r

# Search for debugging helpers
grep "console.log" src/* -r
grep "alert" src/* -r

# slice(0) can be written slice()
grep "slice(0)" src/* -r

