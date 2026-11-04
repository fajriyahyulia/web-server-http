/**
 * Membandingkan dua buah array (isi dan urutan).
 * Mendukung array bersarang (nested).
 * @param {Array} a - Array pertama.
 * @param {Array} b - Array kedua.
 * @returns {boolean} true jika kedua array sama, selain itu false.
 */
function samaArray(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; i++) {
    if (Array.isArray(a[i]) && Array.isArray(b[i])) {
      if (!samaArray(a[i], b[i])) return false;
    } else if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

module.exports = samaArray;

if (require.main === module) {
  console.log(samaArray([1, 2, 3], [1, 2, 3]));   // true
  console.log(samaArray([1, 2, 3], [1, 2, 4]));   // false
  console.log(samaArray([1, 2], [1, 2, 3]));      // false
  console.log(samaArray([1, [2, 3]], [1, [2, 3]])); // true
}
