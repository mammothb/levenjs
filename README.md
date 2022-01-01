levenjs <br>
[![npm version](https://badge.fury.io/js/levenjs.svg)](https://badge.fury.io/js/levenjs)
[![Tests](https://github.com/mammothb/levenjs/actions/workflows/tests.yml/badge.svg)](https://github.com/mammothb/levenjs/actions/workflows/tests.yml)
=============

Fast implementation of the Levenshtein edit distance. References for the various
function can be found in the docstrings [[1](https://github.com/softwx/SoftWx.Match),
[2](https://github.com/maxbachmann/rapidfuzz-cpp),
[3](https://github.com/ka-weihe/fastest-levenshtein)].

## Install
```
npm install levenjs
```

## Usage
```js
import levenjs from "levenjs";

levenjs("distance", "dist");  // 4
```
If you want to limit the maximum edit distance returned.
```js
import levenjs from "levenjs";

levenjs("distance", "dist", /*maxDist=*/ 2);  // 2
```

## Benchmark
Benchmarked against [`leven`](https://github.com/sindresorhus/leven) and
[`fastest-levenshtein`](https://github.com/ka-weihe/fastest-levenshtein).
```
One word
         leven               x 646,822 ops/sec ±0.64% (98 runs sampled)
         fastest-levenshtein x 1,529,761 ops/sec ±0.76% (95 runs sampled)
         levenjs             x 1,331,218 ops/sec ±0.34% (97 runs sampled)
Short sentence, small difference
         leven               x 868,577 ops/sec ±0.63% (90 runs sampled)
         fastest-levenshtein x 6,881,822 ops/sec ±0.48% (97 runs sampled)
         levenjs             x 5,578,840 ops/sec ±0.98% (93 runs sampled)
Short sentence, similar prefix and suffix, small difference
         leven               x 2,242,494 ops/sec ±0.63% (92 runs sampled)
         fastest-levenshtein x 4,920,882 ops/sec ±0.39% (98 runs sampled)
         levenjs             x 6,336,442 ops/sec ±0.57% (92 runs sampled)
Long text, small difference
         leven               x 1,011 ops/sec ±0.67% (95 runs sampled)
         fastest-levenshtein x 10,350 ops/sec ±0.47% (97 runs sampled)
         levenjs             x 10,796 ops/sec ±0.42% (97 runs sampled)
Long text, small difference, threshold 3
         leven               x 894 ops/sec ±0.41% (97 runs sampled)
         fastest-levenshtein x 10,374 ops/sec ±1.31% (96 runs sampled)
         levenjs             x 397,756 ops/sec ±0.52% (97 runs sampled)
Long text, small difference, threshold 20
         leven               x 1,030 ops/sec ±0.43% (97 runs sampled)
         fastest-levenshtein x 10,312 ops/sec ±0.55% (97 runs sampled)
         levenjs             x 17,998 ops/sec ±0.41% (94 runs sampled)
Long text, many difference
         leven               x 622 ops/sec ±0.58% (96 runs sampled)
         fastest-levenshtein x 7,422 ops/sec ±0.43% (98 runs sampled)
         levenjs             x 6,342 ops/sec ±0.28% (99 runs sampled)
Long text, many difference, threshold 40
         leven               x 634 ops/sec ±0.25% (95 runs sampled)
         fastest-levenshtein x 7,879 ops/sec ±0.26% (99 runs sampled)
         levenjs             x 169,151 ops/sec ±0.50% (95 runs sampled)
```
Slightly poorer performance than `fastest-levenshtein` in uncapped cases but
better performance when pre-/post- fix trimming shortens string lengths past
certain break points. Also better performance when a `maxDist` threshold is set.
