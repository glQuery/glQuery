  // Utility functions for working with tags
  // Test whether t0 contains any of the tags in ts1
  var containsAnyTags = function(t0, ts1) {
    // TODO: This function can probably be optimized quite a bit (possibly 
    //       by converting ts1 into a regular expression instead)
    // See also http://ejohn.org/blog/revised-javascript-dictionary-search/
    var ts0 = t0.split(' ');
    for (var i = 0; i < ts0.length; ++i) {
      if (ts0[i] === '') continue;
      for (var j = 0; j < ts1.length; ++j) {
        if (ts0[i] === ts1[j])
          return true;
      }
    }
    return false;
  };
