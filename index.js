const pmVector = new Uint32Array(0x10000);
const uint32Max = 0x100000000 - 1;
const s2CharCodes = [];
const char1Costs = [];

/**
 * Matrix of all the possible edit sequences for each given maxDist and
 * lenDiff.
 *
 * 01 = DELETE, 10 = INSERT, 11 = REPLACE
 *
 * @see {@link fujimoto2018} for more information.
 */
const opsMatrix = [
  // maxDist=1
  [0x03], // lenDiff=0
  [0x01], // lenDiff=1
  // maxDist=2
  [0x0f, 0x09, 0x06], // lenDiff=0
  [0x0d, 0x07], // lenDiff=1
  [0x05], // lenDiff=2
  // maxDist=3
  [0x3f, 0x39, 0x36, 0x2d, 0x27, 0x1e, 0x1b], // lenDiff=0
  [0x3d, 0x37, 0x25, 0x1f, 0x19, 0x16], // lenDiff=1
  [0x35, 0x1d, 0x17], // lenDiff=2
  [0x15], // lenDiff=3
];

/**
 * Implementation of mbleven by fujimoto2018, handles up to maxDist<4.
 *
 * Reference:
 * RapidFuzz: https://github.com/maxbachmann/rapidfuzz-cpp
 * mbleven: https://github.com/fujimotos/mbleven
 *
 * @param {string} s1 - The first, shorter, string.
 * @param {string} s2 - The other string.
 * @param {number} len1 - Length of `s1` less the common suffix.
 * @param {number} len2 - Length of `s2` less the common suffix.
 * @param {number} offset - Length of common prefix.
 * @param {number} maxDist - Maximum edit distance allowed between the `s1`
 *    and `s2`.
 * @returns {number} The Levenshtein distance between `s1` and `s2.
 */
const fujimoto2018 = (s1, s2, len1, len2, offset, maxDist) => {
  const lenDiff = len2 - len1;
  const possibleOps =
    opsMatrix[(maxDist + maxDist * maxDist) / 2 + lenDiff - 1];
  let cost = maxDist + 1;
  for (let i = 0; i < possibleOps.length; ++i) {
    let ops = possibleOps[i];
    let s1Pos = 0;
    let s2Pos = 0;
    let currCost = 0;
    while (s1Pos < len1 && s2Pos < len2) {
      if (s1.charCodeAt(s1Pos + offset) !== s2.charCodeAt(s2Pos + offset)) {
        ++currCost;
        if (!ops) break;
        if (ops & 1) ++s1Pos;
        if (ops & 2) ++s2Pos;
        ops >>= 2;
      } else {
        ++s1Pos;
        ++s2Pos;
      }
    }
    currCost += len1 - s1Pos + len2 - s2Pos;
    cost = currCost < cost ? currCost : cost;
  }
  return cost > maxDist ? maxDist : cost;
};

/**
 * Implementation of "A Bit-Vector Algorithm for Computing Levenshtein and
 * Damerau Edit Distances" by Hyyro (2003), using computer word size = 32.
 *
 * Reference:
 * RapidFuzz: https://github.com/maxbachmann/rapidfuzz-cpp
 *
 * @param {string} s1 - The first, shorter, string.
 * @param {string} s2 - The other string.
 * @param {number} len1 - Length of `s1` less the common suffix.
 * @param {number} len2 - Length of `s2` less the common suffix.
 * @param {number} offset - Length of common prefix.
 * @param {number} maxDist - Maximum edit distance allowed between the `s1`
 *    and `s2`.
 * @returns {number} The Levenshtein distance between `s1` and `s2.
 */
const hyyro2003 = (s1, s2, len1, len2, offset, maxDist) => {
  // Set up pattern match vector
  let i = len1;
  while (i--) {
    pmVector[s1.charCodeAt(offset + i)] |= 1 << i;
  }

  // vp is set to 1^m. Shifting by bitwidth would be undefined behavior
  let vp = -1;
  let vn = 0;
  let currDist = len1;

  let maxMisses = maxDist + len2 - len1;
  maxMisses = maxMisses < uint32Max ? maxMisses : uint32Max;

  // mask used when computing D[m,j] in the paper 10^(m-1)
  const mask = 1 << (len1 - 1);
  for (let j = 0; j < len2; ++j) {
    // Step 1: Compute d0
    const x = pmVector[s2.charCodeAt(offset + j)] | vn;
    const d0 = (((x & vp) + vp) ^ vp) | x;

    // Step 2: Reuse vn and vp to compute HP and HN respectively)
    vn |= ~(d0 | vp);
    vp &= d0;

    // Step 3: Compute the value D[m,j] with early exit using maxMisses
    if (vn & mask) {
      if (maxMisses < 2) {
        currDist = maxDist;
        break;
      }
      maxMisses -= 2;
      ++currDist;
    } else if (vp & mask) {
      --currDist;
    } else {
      if (maxMisses < 1) {
        currDist = maxDist;
        break;
      }
      --maxMisses;
    }

    // Step 4: Compute vp and vn, vn temporarily holds the value of x first
    vn <<= 1;
    vn |= 1;
    vp <<= 1;
    vp |= ~(d0 | vn);
    vn &= d0;
  }
  // Reset pattern match vector
  i = len1;
  while (i--) {
    pmVector[s1.charCodeAt(offset + i)] = 0;
  }
  return currDist;
};

/**
 * Implementation of block-based algorithm for Levenshtein distance by Myers
 * (1999), using computer word size = 32.
 *
 * TODO: Fix early exit using maxMisses.
 *
 * Reference:
 * RapidFuzz: https://github.com/maxbachmann/rapidfuzz-cpp
 * fastest-levenshtein: https://github.com/ka-weihe/fastest-levenshtein
 *
 * @param {string} s1 - The first, shorter, string.
 * @param {string} s2 - The other string.
 * @param {number} len1 - Length of `s1` less the common suffix.
 * @param {number} len2 - Length of `s2` less the common suffix.
 * @param {number} offset - Length of common prefix.
 * @param {number} maxDist - Maximum edit distance allowed between the `s1`
 *    and `s2`.
 * @returns {number} The Levenshtein distance between `s1` and `s2.
 */
const myers1999Block = (s1, s2, len1, len2, offset, maxDist) => {
  const hSize = Math.ceil(len1 / 32);
  const vSize = Math.ceil(len2 / 32);
  let currDist = len2;
  // let maxMisses = maxDist + len2 - len1;
  // maxMisses = maxMisses < uint32Max ? maxMisses : uint32Max;

  const hpCarrys = [];
  const hnCarrys = [];
  for (let h = 0; h < hSize; ++h) {
    hpCarrys[h] = -1;
    hnCarrys[h] = 0;
  }
  let v = 0;
  for (; v < vSize - 1; ++v) {
    let vp = -1;
    let vn = 0;
    const start = v * 32;
    const stop = start + (32 < len2 ? 32 : len2);
    // Set up pattern match vector
    let j = stop - start;
    while (j--) {
      pmVector[s2.charCodeAt(offset + start + j)] |= 1 << (start + j);
    }
    for (let i = 0; i < len1; ++i) {
      // Step 1: Computing d0
      const hpCarry = (hpCarrys[(i / 32) | 0] >>> i % 32) & 1;
      const hnCarry = (hnCarrys[(i / 32) | 0] >>> i % 32) & 1;

      const x = pmVector[s1.charCodeAt(offset + i)] | hnCarry;
      const d0 = (((x & vp) + vp) ^ vp) | x | vn;

      // Step 2: Reuse vn and vp to compute HP and HN respectively)
      vn |= ~(d0 | vp);
      vp &= d0;
      if ((vn >>> 31) ^ hpCarry) {
        hpCarrys[(i / 32) | 0] ^= 1 << i % 32;
      }
      if ((vp >>> 31) ^ hnCarry) {
        hnCarrys[(i / 32) | 0] ^= 1 << i % 32;
      }
      // Step 4: Computing vp and vn
      vn <<= 1;
      vn |= hpCarry;
      vp <<= 1;
      vp |= hnCarry;
      vp |= ~(d0 | vn);
      vn &= d0;
    }
    // Reset pattern match vector
    j = stop - start;
    while (j--) {
      pmVector[s2.charCodeAt(offset + start + j)] = 0;
    }
  }
  let vp = -1;
  let vn = 0;
  const start = v * 32;
  const stop = start + (32 < len2 - start ? 32 : len2 - start);
  let j = stop - start;
  while (j--) {
    pmVector[s2.charCodeAt(offset + start + j)] |= 1 << (start + j);
  }
  const last = 1 << (len2 - 1) % 32;
  for (let i = 0; i < len1; ++i) {
    // Step 1: Computing d0
    const hpCarry = (hpCarrys[(i / 32) | 0] >>> i % 32) & 1;
    const hnCarry = (hnCarrys[(i / 32) | 0] >>> i % 32) & 1;

    const x = pmVector[s1.charCodeAt(offset + i)] | hnCarry;
    const d0 = (((x & vp) + vp) ^ vp) | x | vn;

    // Step 2: Reuse vn and vp to compute HP and HN respectively)
    vn |= ~(d0 | vp);
    vp &= d0;

    // Step 3: Computing the value of D[m,j] with early exit using maxMisses
    // if (vn & last) {
    //   if (maxMisses < 2) {
    //     currDist = maxDist;
    //     break;
    //   }
    //   maxMisses -= 2;
    //   ++currDist;
    // } else if (vp & last) {
    //   --currDist;
    // } else {
    //   if (maxMisses < 1) {
    //     currDist = maxDist;
    //     break;
    //   }
    //   --maxMisses;
    // }
    if (vn & last) {
      ++currDist;
    } else if (vp & last) {
      --currDist;
    }

    // Step 4: Computing vp and vn
    if ((vn >>> 31) ^ hpCarry) {
      hpCarrys[(i / 32) | 0] ^= 1 << i % 32;
    }
    if ((vp >>> 31) ^ hnCarry) {
      hnCarrys[(i / 32) | 0] ^= 1 << i % 32;
    }
    vn <<= 1;
    vn |= hpCarry;
    vp <<= 1;
    vp |= hnCarry;
    vp |= ~(d0 | vn);
    vn &= d0;
  }
  j = stop - start;
  while (j--) {
    pmVector[s2.charCodeAt(offset + start + j)] = 0;
  }
  return currDist < maxDist ? currDist : maxDist;
};

/**
 * Implementation of optimized Levenshtein algorithm by SoftWx.Match.
 *
 * Reference:
 * SoftWx.Match: https://github.com/softwx/SoftWx.Match
 *
 * @param {string} s1 - The first, shorter, string.
 * @param {string} s2 - The other string.
 * @param {number} len1 - Length of `s1` less the common suffix.
 * @param {number} len2 - Length of `s2` less the common suffix.
 * @param {number} offset - Length of common prefix.
 * @param {number} maxDist - Maximum edit distance allowed between the `s1`
 *    and `s2`.
 * @returns {number} The Levenshtein distance between `s1` and `s2.
 */
const distanceMax = (s1, s2, len1, len2, offset, maxDistance) => {
  for (let i = 0; i < len2; ++i) {
    char1Costs[i] = i < maxDistance ? i + 1 : maxDistance + 1;
    s2CharCodes[i] = s2.charCodeAt(offset + i);
  }
  const lenDiff = len2 - len1;
  const jStartOffset = maxDistance - lenDiff;
  let jStart = 0;
  let jStop = maxDistance;
  let currentCost = 0;
  for (let i = 0; i < len1; ++i) {
    let aboveCharCost = i;
    let leftCharCost = i;
    const char1 = s1.charCodeAt(offset + i);
    if (i > jStartOffset) {
      ++jStart;
    }
    if (jStop < len2) {
      ++jStop;
    }
    for (let j = jStart; j < jStop; ++j) {
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
    if (char1Costs[i + lenDiff] > maxDistance) {
      return maxDistance;
    }
  }
  return currentCost <= maxDistance ? currentCost : maxDistance;
};

/**
 * Returns the Levenshtein distance between two strings.
 *
 * @param {string} s1 - The first string.
 * @param {string} s2 - The other string.
 * @param {int|undefined} maxDist - Maximum edit distance allowed between the
 *    `s1` and `s2`. Can be undefined to indicate no threshold.
 * @returns {number} The Levenshtein distance between `s1` and `s2.
 */
const levenjs = (s1, s2, maxDist) => {
  if (s1 === s2) {
    return 0;
  }

  maxDist = typeof maxDist === "number" ? maxDist : Infinity;

  // Requires s1.length <= s2.length
  if (s1.length > s2.length) {
    [s2, s1] = [s1, s2];
  }

  let len1 = s1.length;
  let len2 = s2.length;

  if (len2 - len1 >= maxDist) {
    return maxDist;
  }

  // Trim suffix
  // Note: `~-` is the bitwise way to perform a `- 1` operation
  while (len1 > 0 && s1.charCodeAt(~-len1) === s2.charCodeAt(~-len2)) {
    --len1;
    --len2;
  }
  if (len1 === 0) {
    return len2 < maxDist ? len2 : maxDist;
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
    return len2;
  }

  if (len2 <= 32) {
    return hyyro2003(s1, s2, len1, len2, offset, maxDist);
  }
  if (maxDist < 4) {
    return fujimoto2018(s1, s2, len1, len2, offset, maxDist);
  }

  return maxDist === Infinity
    ? myers1999Block(s1, s2, len1, len2, offset, maxDist)
    : distanceMax(s1, s2, len1, len2, offset, maxDist);
};

export default levenjs;
