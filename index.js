const s2CharCodes = [];
const char1Costs = [];

const levenjs = (s1, s2, maxDistance) => {
  if (s1 === s2) {
    return 0;
  }

  maxDistance = typeof maxDistance === "number" ? maxDistance : Infinity;

  // If strings of different lengths, ensure shorter string is in s1.
  // This can result in a little faster speed by spending more time spinning
  // just the inner loop during the main processing.
  if (s1.length > s2.length) {
    [s2, s1] = [s1, s2];
  }

  let len1 = s1.length;
  let len2 = s2.length;

  // Trim suffix
  // Note: `~-` is the bitwise way to perform a `- 1` operation
  while (len1 > 0 && s1.charCodeAt(~-len1) === s2.charCodeAt(~-len2)) {
    --len1;
    --len2;
  }

  if (len1 === 0) {
    return len2 < maxDistance ? len2 : maxDistance;
  }

  // Trim prefix
  let offset = 0;
  while (offset < len1 && s1.charCodeAt(offset) === s2.charCodeAt(offset)) {
    ++offset;
  }

  if (offset !== 0) {
    len1 -= offset;
    len2 -= offset;
  }
  if (len1 === 0) {
    return len2 < maxDistance ? len2 : maxDistance;
  }
  for (let i = 0; i < len2; ++i) {
    char1Costs[i] = i + 1;
    s2CharCodes[i] = s2.charCodeAt(offset + i);
  }

  let currentCost = 0;
  for (let i = 0; i < len1; ++i) {
    let aboveCharCost = i;
    let leftCharCost = i;
    const char1 = s1.charCodeAt(offset + i);
    for (let j = 0; j < len2; ++j) {
      currentCost = leftCharCost;
      leftCharCost = char1Costs[j];
      if (char1 !== s2CharCodes[j]) {
        if (aboveCharCost < currentCost) {
          currentCost = aboveCharCost;
        }
        if (leftCharCost < currentCost) {
          currentCost = leftCharCost;
        }
        ++currentCost;
      }
      aboveCharCost = currentCost;
      char1Costs[j] = currentCost;
    }
  }

  return currentCost < maxDistance ? currentCost : maxDistance;
};

export default levenjs;
