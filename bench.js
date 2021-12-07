"use strict";

import Benchmark from "benchmark";
import levenjs from "./index.js";
import leven from "leven";
import ukkonen from "ukkonen";

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

const sentenceSmallDiff = (fn) => {
  fn(
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    "Lorem Ipsum is simply clever text of the printing and typesetting industries."
  );
};

const longTextSmallDiff = (fn) => {
  fn(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, eu placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    "Lorem Ipsum dolor sit amet, consectetur elit adipiscing. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis Vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis."
  );
};

const longTextManyDiff = (fn) => {
  fn(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, eu placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    "Curabitur fringilla eros lacus, et placerat magna pretium in. Suspendisse ut egestas dui. Nam quis sapien eget enim interdum interdum. Phasellus metus ligula, lacinia at tellus eu, iaculis blandit libero. Proin risus sem, ornare a orci et, aliquam rutrum elit. Aenean ac posuere justo, a maximus orci. In molestie nibh quis libero elementum, vel pellentesque metus volutpat. Maecenas non quam felis. Proin congue aliquet mauris laoreet viverra. Fusce auctor sapien a neque varius pellentesque. Nam ut sem neque. Pellentesque bibendum aliquet consectetur. Nam finibus diam non vestibulum maximus. Integer aliquet mattis elit, vitae vehicula erat pulvinar at. Ut placerat viverra aliquam. Nulla vehicula hendrerit justo."
  );
};

const longTextMaxDistance = (fn) => {
  fn(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, eu placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    "Lorem Ipsum dolor sit amet, consectetur elit adipiscing. Cras tellus sapien, rhoncus sed bibendum in, facilisis non urna. Cras non mattis tellus, nec facilisis nisi. Proin vel purus eros. Morbi ultrices egestas mi vitae laoreet. Ut feugiat est lorem, a rhoncus mi lacinia vel. Aenean et velit neque. Quisque accumsan mi ligula, placerat lorem elementum ac. Nunc congue, eros eu aliquam commodo, leo orci tristique nulla, eu tempus quam justo eu neque. Nulla purus elit, porttitor ut sollicitudin sed, dictum vel justo. Mauris orci nisi, lacinia dictum augue nec, condimentum suscipit metus. Etiam lacinia pretium luctus. Mauris nulla turpis, suscipit vitae lobortis quis, tempor sed ex. Sed elementum enim eget venenatis mollis. Etiam sed congue neque, id tristique ex. Duis Vitae ipsum nec ligula vulputate ullamcorper. Phasellus fringilla odio turpis, eu condimentum turpis scelerisque quis.",
    20
  );
};

const longTextManyDiffMaxDistance = (fn) => {
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

Benchmark.Suite("One word")
  .add("ukkonen", () => {
    oneWord(ukkonen);
  })
  .add("leven", () => {
    oneWord(leven);
  })
  .add("levenjs", () => {
    oneWord(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Sentence, small difference")
  .add("ukkonen", () => {
    sentenceSmallDiff(ukkonen);
  })
  .add("leven", () => {
    sentenceSmallDiff(leven);
  })
  .add("levenjs", () => {
    sentenceSmallDiff(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Long text, small difference")
  .add("ukkonen", () => {
    longTextSmallDiff(ukkonen);
  })
  .add("leven", () => {
    longTextSmallDiff(leven);
  })
  .add("levenjs", () => {
    longTextSmallDiff(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Long text, many difference")
  .add("ukkonen", () => {
    longTextManyDiff(ukkonen);
  })
  .add("leven", () => {
    longTextManyDiff(leven);
  })
  .add("levenjs", () => {
    longTextManyDiff(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Long text, small difference, threshold 10")
  .add("ukkonen", () => {
    longTextMaxDistance(ukkonen);
  })
  .add("leven", () => {
    longTextMaxDistance(leven);
  })
  .add("levenjs", () => {
    longTextMaxDistance(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();

Benchmark.Suite("Long text, many difference, threshold 40")
  .add("ukkonen", () => {
    longTextManyDiffMaxDistance(ukkonen);
  })
  .add("leven", () => {
    longTextManyDiffMaxDistance(leven);
  })
  .add("levenjs", () => {
    longTextManyDiffMaxDistance(levenjs);
  })
  .on("start", onStart)
  .on("cycle", onCycle)
  .run();
