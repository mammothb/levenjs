"use strict";

import Chance from "chance";
import leven from "leven";

import levenjs from "../index.js";

const chance = Chance(42);

const numIterations = 100;

const levenshtein = (s1, s2, maxDist) => {
  maxDist = typeof maxDist === "number" ? maxDist : Infinity;
  return Math.min(maxDist, leven(s1, s2));
};

const edit = () => chance.pickone(["replace", "delete", "insert", "transpose"]);

const editedTexts = (count) => {
  const getEdits = (editCount) => {
    const edits = new Array(editCount);
    for (let i = 0; i < editCount; ++i) {
      edits[i] = edit();
    }
    return edits;
  };

  const result = new Array(count);
  for (let i = 0; i < count; ++i) {
    const edits = getEdits(chance.natural({ max: 100 }));
    const text = chance.paragraph();
    const chars = Array.from(text);
    edits.forEach((op) => {
      const pos = chance.natural() % chars.length;
      switch (op) {
        case "replace":
          chars[pos] = chance.character();
          break;
        case "delete":
          chars.splice(pos, 1);
          break;
        case "insert":
          chars.splice(pos, 0, chance.character());
          break;
        case "transpose":
          if (pos + 1 < chars.length) {
            [chars[pos + 1], chars[pos]] = [chars[pos], chars[pos + 1]];
          }
          break;
      }
    });
    result[i] = { text: text, editedText: chars.join("") };
  }

  return result;
};

const strings = (count) => {
  const result = new Array(count);
  for (let i = 0; i < count; ++i) {
    result[i] = chance.string({ length: chance.natural({ max: 100 }) });
  }
  return result;
};

const thresholds = () => {
  const count = 20;
  const result = new Array(count);
  for (let i = 0; i < count; ++i) {
    result[i] = i;
  }
  return result;
};

describe("levenjs", () => {
  it("computes distance correctly for control group", () => {
    [
      { s1: "ABCDE", s2: "FGHIJ", distance: 5 },
      { s1: "AVERY", s2: "GARVEY", distance: 3 },
      { s1: "ADCROFT", s2: "ADDESSI", distance: 5 },
      { s1: "BAIRD", s2: "BAISDEN", distance: 3 },
      { s1: "BOGGAN", s2: "BOGGS", distance: 2 },
      { s1: "CLAYTON", s2: "CLEARY", distance: 5 },
      { s1: "DYBAS", s2: "DYCKMAN", distance: 4 },
      { s1: "EMINETH", s2: "EMMERT", distance: 4 },
      { s1: "GALANTE", s2: "GALICKI", distance: 4 },
      { s1: "HARDIN", s2: "HARDING", distance: 1 },
      { s1: "KEHOE", s2: "KEHR", distance: 2 },
      { s1: "LOWRY", s2: "LUBARSK", distance: 5 },
      { s1: "MAGALLAN", s2: "MAGANA", distance: 3 },
      { s1: "MAYO", s2: "MAYS", distance: 1 },
      { s1: "MOENY", s2: "MOFFETT", distance: 4 },
      { s1: "PARE", s2: "PARENT", distance: 2 },
      { s1: "RAMEY", s2: "RAMFREY", distance: 2 },
      { s1: "ofosid", s2: "daej", distance: 6 },
      { s1: "of", s2: "lisib", distance: 5 },
      { s1: "nuhijoow", s2: "ru", distance: 7 },
      { s1: "w", s2: "4", distance: 1 },
      { s1: "", s2: "", distance: 0 },
      { s1: "", s2: "wat", distance: 3 },
      { s1: "wat", s2: "", distance: 3 },
      { s1: "wat", s2: "wat", distance: 0 },
      { s1: "Ukkonen", s2: "Levenshtein", distance: 8 },
    ].forEach((sample) => {
      expect(levenjs(sample.s1, sample.s2)).toBe(sample.distance);
    });
  });

  it("produces same result as leven", () => {
    strings(numIterations).forEach((s1) => {
      strings(numIterations).forEach((s2) => {
        expect(levenjs(s1, s2)).toBe(leven(s1, s2));
      });
    });
  });

  it("produces same result as leven for random edits", () => {
    editedTexts(numIterations).forEach((args) => {
      const text = args.text;
      const editedText = args.editedText;
      expect(levenjs(text, editedText)).toBe(leven(text, editedText));
    });
  });

  describe("when given a threshold", () => {
    it("produces same result as leven", () => {
      strings(numIterations).forEach((s1) => {
        strings(numIterations).forEach((s2) => {
          thresholds().forEach((threshold) => {
            expect(levenjs(s1, s2, threshold)).toBe(
              levenshtein(s1, s2, threshold)
            );
          });
        });
      });
    });

    it("produces same result as leven for random edits", () => {
      editedTexts(numIterations).forEach((args) => {
        thresholds().forEach((threshold) => {
          const text = args.text;
          const editedText = args.editedText;
          expect(levenjs(text, editedText, threshold)).toBe(
            levenshtein(text, editedText, threshold)
          );
        });
      });
    });
  });
});
