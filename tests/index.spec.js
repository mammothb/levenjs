"use strict";

import Chance from "chance";
import levenjs from "../index.js";
import leven from "leven";

const chance = Chance(42);

const numIterations = 100;

const levenshtein = (s1, s2, maxDistance) => {
  maxDistance = typeof maxDistance === "number" ? maxDistance : Infinity;
  return Math.min(maxDistance, leven(s1, s2));
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
    result[i] = 10 + i;
  }
  return result;
};

describe("levenjs", () => {
  it("computes distance correctly for control group", () => {
    [
      { name1: "ABCDE", name2: "FGHIJ", distance: 5 },
      { name1: "AVERY", name2: "GARVEY", distance: 3 },
      { name1: "ADCROFT", name2: "ADDESSI", distance: 5 },
      { name1: "BAIRD", name2: "BAISDEN", distance: 3 },
      { name1: "BOGGAN", name2: "BOGGS", distance: 2 },
      { name1: "CLAYTON", name2: "CLEARY", distance: 5 },
      { name1: "DYBAS", name2: "DYCKMAN", distance: 4 },
      { name1: "EMINETH", name2: "EMMERT", distance: 4 },
      { name1: "GALANTE", name2: "GALICKI", distance: 4 },
      { name1: "HARDIN", name2: "HARDING", distance: 1 },
      { name1: "KEHOE", name2: "KEHR", distance: 2 },
      { name1: "LOWRY", name2: "LUBARSK", distance: 5 },
      { name1: "MAGALLAN", name2: "MAGANA", distance: 3 },
      { name1: "MAYO", name2: "MAYS", distance: 1 },
      { name1: "MOENY", name2: "MOFFETT", distance: 4 },
      { name1: "PARE", name2: "PARENT", distance: 2 },
      { name1: "RAMEY", name2: "RAMFREY", distance: 2 },
      { name1: "ofosid", name2: "daej", distance: 6 },
      { name1: "of", name2: "lisib", distance: 5 },
      { name1: "nuhijoow", name2: "ru", distance: 7 },
      { name1: "w", name2: "4", distance: 1 },
      { name1: "", name2: "", distance: 0 },
      { name1: "", name2: "wat", distance: 3 },
      { name1: "wat", name2: "", distance: 3 },
      { name1: "wat", name2: "wat", distance: 0 },
      { name1: "Ukkonen", name2: "Levenshtein", distance: 8 },
    ].forEach((example) => {
      expect(levenjs(example.name1, example.name2)).toBe(example.distance);
    });
  });

  it("produces same result as Ukkonen", () => {
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
