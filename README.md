levenjs <br>
[![npm version](https://badge.fury.io/js/levenjs.svg)](https://badge.fury.io/js/levenjs)
[![Tests](https://github.com/mammothb/levenjs/actions/workflows/tests.yml/badge.svg)](https://github.com/mammothb/levenjs/actions/workflows/tests.yml)
=============

Fast implementation of the Levenshtein edit distance. The original C# project 
can be found at [SoftWx.Match](https://github.com/softwx/SoftWx.Match).

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

levenjs("distance", "dist", /*maxDistance=*/ 2);  // 2
```

## Benchmark
Benchmarked against [`ukkonen`](https://github.com/sunesimonsen/ukkonen) and the
fastest implementation of Levenshtein edit distance on NPM
[`leven`](https://github.com/sindresorhus/leven).
```
One word
         ukkonen x 429,453 ops/sec ±0.25% (97 runs sampled)
         leven x 660,136 ops/sec ±0.18% (97 runs sampled)
         levenjs x 617,170 ops/sec ±0.16% (99 runs sampled)
Sentence, small difference
         ukkonen x 1,218,868 ops/sec ±0.21% (98 runs sampled)
         leven x 212,308 ops/sec ±0.19% (98 runs sampled)
         levenjs x 214,374 ops/sec ±0.75% (95 runs sampled)
Long text, small difference
         ukkonen x 154,164 ops/sec ±0.25% (95 runs sampled)
         leven x 1,034 ops/sec ±0.16% (98 runs sampled)
         levenjs x 1,028 ops/sec ±0.46% (97 runs sampled)
Long text, many difference
         ukkonen x 576 ops/sec ±0.16% (94 runs sampled)
         leven x 630 ops/sec ±0.11% (97 runs sampled)
         levenjs x 641 ops/sec ±0.20% (96 runs sampled)
Long text, small difference, threshold 10
         ukkonen x 194,398 ops/sec ±0.38% (97 runs sampled)
         leven x 1,035 ops/sec ±0.23% (97 runs sampled)
         levenjs x 18,689 ops/sec ±0.24% (100 runs sampled)
Long text, many difference, threshold 40
         ukkonen x 123,123 ops/sec ±0.18% (99 runs sampled)
         leven x 635 ops/sec ±0.12% (95 runs sampled)
         levenjs x 191,112 ops/sec ±0.15% (96 runs sampled)
```
Other than single word cases, mostly comparable performance with `leven`,
better performance when `maxDistance` is set.
