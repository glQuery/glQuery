var glQueryMath = (function() {
"use strict";




// Module for setting 3x3 matrix values
this.setMatrix3AxisRotation = function(axis, angle) {
  var
  // Convert rotation to quaternion representation
  length = Math.sqrt(axis[0]*axis[0], axis[1]*axis[1], axis[2]*axis[2]),
  halfAngle = angle * 0.5,
  sinHalfOverLength = Math.sin(halfAngle) / length,
  x = axis[0] * sinHalfOverLength,
  y = axis[1] * sinHalfOverLength,
  z = axis[2] * sinHalfOverLength,
  w = Math.cos(halfAngle),
  // Convert quaternion to matrix representation
  xx = x*x, xy = x*y, xz = x*z, xw = x*w,
  yy = y*y, yw = y*w,
  zz = z*z, zw = z*w;
  return [
    1 - 2 * (yy + zz), 2 * (xy + zw),     2 * (xz - yw),
    2 * (xy - zw),     1 - 2 * (xx + zz), 2 * (zy + xw),
    2 * (xz + yw),     2 * (y*z - xw),    1 - 2 * (xx + yy)];
};

this.setMatrix3Identity = function() {
  return [
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0];
};




// Module for setting 4x4 matrix values
this.setMatrix4AxisRotation = function(axis, angle) {
  var
  // Convert rotation to quaternion representation
  length = Math.sqrt(axis[0]*axis[0], axis[1]*axis[1], axis[2]*axis[2]),
  halfAngle = angle * 0.5,
  sinHalfOverLength = Math.sin(halfAngle) / length,
  x = axis[0] * sinHalfOverLength,
  y = axis[1] * sinHalfOverLength,
  z = axis[2] * sinHalfOverLength,
  w = Math.cos(halfAngle),
  // Convert quaternion to matrix representation
  xx = x*x, xy = x*y, xz = x*z, xw = x*w,
  yy = y*y, yw = y*w,
  zz = z*z, zw = z*w;
  return [
    1 - 2 * (yy + zz), 2 * (xy + zw),     2 * (xz - yw),      0,
    2 * (xy - zw),     1 - 2 * (xx + zz), 2 * (zy + xw),      0,
    2 * (xz + yw),     2 * (y*z - xw),    1 - 2 * (xx + yy),  0,
    0,                 0,                 0,                  1];
};

this.setMatrix4Identity = function() {
  return [
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0];
};



  // Extend glQuery if it is defined
  if (glQuery != null)
    for(key in this)
      if (glQuery[key] == null)
        glQuery[key] = this[key];
  return this;
})();

