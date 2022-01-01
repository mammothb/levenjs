"use strict";

import Benchmark from "benchmark";
import levenjs from "./index.js";
import leven from "leven";
import { distance } from "fastest-levenshtein";

const oneWord = (fn) => {
  fn("a", "b");
  fn("ab", "ac");
  fn("ac", "bc");
  fn("abc", "axc");
  fn("kitten", "sitting");
  fn("xabxcdxxefxgx", "1ab2cd34ef5g6");
  fn("cat", "cow");
  fn("xabxcdxxefxgx", "abcdefg");
  fn("javawasneat", "scalaisgreat");
  fn("example", "samples");
  fn("sturgeon", "urgently");
  fn("levenshtein", "frankenstein");
  fn("distance", "difference");
  fn("因為我是中國人所以我會說中文", "因為我是英國人所以我會說英文");
};

const shortTextSmallDiff = (fn) => {
  fn("Lore Isum is dummy txt!", "Eorem Ifpsum is dummy text.");
};

const shortTextSimilarSmallDiff = (fn) => {
  fn(
    "Lorem Ipsu is imply ummy text.",
    "Lorem Ipsurm ies simplyc dbuammy text."
  );
};

const longTextSmallDiff = (fn) => {
  fn(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, eu placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    "Lorem Ipsum dolor sit amet, consectetur elit adipiscing. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis Vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis."
  );
};

const longTextMax3 = (fn) => {
  fn(
    "Lorem Ipsum dolor sit amet, cnsectetur elite adipiscing. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis Vitae jpsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, deu condimentum turpis scelerisque quis.",
    "Lorem Ipsum dolor sit amet, consectetur elit adipiscing. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis Vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    3
  );
};

const longTextMax20 = (fn) => {
  fn(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, eu placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    "Lorem Ipsum dolor sit amet, consectetur elit adipiscing. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis Vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    20
  );
};

const longTextManyDiff = (fn) => {
  fn(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, eu placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    "Curabitur fringilla eros lacus, et placerat magna pretium in. Suspendisse ut egestas dui. Nam quis sapien eget enim interdum interdum. Phasellus metus ligula, lacinia at tellus eu, iaculis blandit libero. Proin risus sem, ornare a orci et, aliquam rutrum elit. Aenean ac posuere justo, a maximus orci. In molestie nibh quis libero elementum, vel pellentesque metus volutpat. Maecenas non quam felis. Proin congue aliquet mauris laoreet viverra. Fusce auctor sapien a neque varius pellentesque. Nam ut sem neque. Pellentesque bibendum aliquet consectetur. Nam finibus diam non vestibulum maximus. Integer aliquet mattis elit, vitae vehicula erat pulvinar at. Ut placerat viverra aliquam. Nulla vehicula hendrerit justo."
  );
};

const longTextManyDiff40 = (fn) => {
  fn(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, eu placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    "Curabitur fringilla eros lacus, et placerat magna pretium in. Suspendisse ut egestas dui. Nam quis sapien eget enim interdum interdum. Phasellus metus ligula, lacinia at tellus eu, iaculis blandit libero. Proin risus sem, ornare a orci et, aliquam rutrum elit. Aenean ac posuere justo, a maximus orci. In molestie nibh quis libero elementum, vel pellentesque metus volutpat. Maecenas non quam felis. Proin congue aliquet mauris laoreet viverra. Fusce auctor sapien a neque varius pellentesque. Nam ut sem neque. Pellentesque bibendum aliquet consectetur. Nam finibus diam non vestibulum maximus. Integer aliquet mattis elit, vitae vehicula erat pulvinar at. Ut placerat viverra aliquam. Nulla vehicula hendrerit justo. Contrary to popular belief, Lorem Ipsum is not simply random text.",
    40
  );
};

function onStart() {
  console.log(String(this.name));
}

function onCycle(event) {
  console.log(`\t ${String(event.target)}`);
}

const fastestLevenshteinName = "fastest-levenshtein";
const levenName = "leven".padEnd(fastestLevenshteinName.length, " ");
const levenjsName = "levenjs".padEnd(fastestLevenshteinName.length, " ");

Benchmark.Suite("One word")
  .add(levenName, () => {
    oneWord(leven);
  })
  .add(fastestLevenshteinName, () => {
    oneWord(distance);
  })
  .add(levenjsName, () => {
    oneWord(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Short sentence, small difference")
  .add(levenName, () => {
    shortTextSmallDiff(leven);
  })
  .add(fastestLevenshteinName, () => {
    shortTextSmallDiff(distance);
  })
  .add(levenjsName, () => {
    shortTextSmallDiff(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Short sentence, similar prefix and suffix, small difference")
  .add(levenName, () => {
    shortTextSimilarSmallDiff(leven);
  })
  .add(fastestLevenshteinName, () => {
    shortTextSimilarSmallDiff(distance);
  })
  .add(levenjsName, () => {
    shortTextSimilarSmallDiff(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Long text, small difference")
  .add(levenName, () => {
    longTextSmallDiff(leven);
  })
  .add(fastestLevenshteinName, () => {
    longTextSmallDiff(distance);
  })
  .add(levenjsName, () => {
    longTextSmallDiff(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Long text, small difference, threshold 3")
  .add(levenName, () => {
    longTextMax3(leven);
  })
  .add(fastestLevenshteinName, () => {
    longTextMax3(distance);
  })
  .add(levenjsName, () => {
    longTextMax3(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Long text, small difference, threshold 20")
  .add(levenName, () => {
    longTextMax20(leven);
  })
  .add(fastestLevenshteinName, () => {
    longTextMax20(distance);
  })
  .add(levenjsName, () => {
    longTextMax20(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Long text, many difference")
  .add(levenName, () => {
    longTextManyDiff(leven);
  })
  .add(fastestLevenshteinName, () => {
    longTextManyDiff(distance);
  })
  .add(levenjsName, () => {
    longTextManyDiff(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Long text, many difference, threshold 40")
  .add(levenName, () => {
    longTextManyDiff40(leven);
  })
  .add(fastestLevenshteinName, () => {
    longTextManyDiff40(distance);
  })
  .add(levenjsName, () => {
    longTextManyDiff40(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();
