const groupBy = require("lodash.groupby");
const mapValues = require("lodash.mapvalues");
const uniqBy = require("lodash.uniqby");
const { readJson, writeJson } = require("./utils/io.util");
const {
  calculateChiSquareValues,
  createTokenList,
  sliceTopTermsFeatureVectors,
  sortChiSquareValueDescendingly,
} = require("./utils/chi-square.util");

const DATASET_JSON_SAVE_PATH = "./data/input/dataset-sample.json";
const CHI_SQUARE_SAVE_PATH = "./data/output/chi-square-feature-vectors.json";
const FEATURE_VECTOR_TOKENS_SAVE_PATH = "./data/output/fv-tokens.json";
const FEATURE_VECTOR_TOKENS_BY_JOURNAL_SAVE_PATH =
  "./data/output/fv-tokens-by-journal.json";

(async () => {
  const processBegin = Date.now();

  console.time("creating-feature-vectors");

  const jsonData = readJson(DATASET_JSON_SAVE_PATH);

  console.log("done reading json data");

  const tokenList = createTokenList(jsonData);

  console.log("done creating token list");

  //////////////////////////////

  const featureVectors = calculateChiSquareValues(tokenList);

  sortedFeatureVectors = featureVectors.sort(
    (a, b) => b.CHI_SQUARE - a.CHI_SQUARE
  );

  writeJson(CHI_SQUARE_SAVE_PATH, sortedFeatureVectors);

  console.log("done creating feature vectors");
  console.timeEnd("creating-feature-vectors");
  console.log("\n");

  //////////////////////////////

  console.time("grouping-feature-vectors");

  const featureVectorsGroupedByJournalId = groupBy(
    featureVectors,
    (item) => item.JOURNAL_ID
  );

  console.log("done grouping feature vectors");
  console.timeEnd("grouping-feature-vectors");
  console.log("\n");

  //////////////////////////////

  console.time("pick-top-m-feature-vectors");

  const topMFeatureVectors = [];

  for (const key in featureVectorsGroupedByJournalId) {
    const groupedFeatureVectors = featureVectorsGroupedByJournalId[key];
    const uniqueFeatureVectors = uniqBy(
      groupedFeatureVectors,
      (fv) => fv.TOKEN
    );
    const sortedFeatureVectors = sortChiSquareValueDescendingly(
      uniqueFeatureVectors
    );
    const topFeatureVectors = sliceTopTermsFeatureVectors(
      sortedFeatureVectors,
      150
    );

    topMFeatureVectors.push(...topFeatureVectors);
  }

  console.log("done picking top M feature vectors");
  console.timeEnd("pick-top-m-feature-vectors");
  console.log("\n");

  //////////////////////////////

  console.time("filtering-duplicate-feature-vectors");

  const uniqueTopMFeatureVectors = uniqBy(topMFeatureVectors, (fv) => fv.TOKEN);

  console.log("done filtering duplicate feature vectors");
  console.timeEnd("filtering-duplicate-feature-vectors");
  console.log("\n");

  //////////////////////////////

  console.time("saving-feature-vector-tokens-as-json");

  const featureVectorsTokens = uniqueTopMFeatureVectors.map(
    (featureVector) => featureVector.TOKEN
  );

  const featureVectorsTokensByJournal = mapValues(
    groupBy(uniqueTopMFeatureVectors, "JOURNAL_ID"),
    (fvGroupedByTitle) => fvGroupedByTitle.map((fv) => fv.TOKEN)
  );

  writeJson(FEATURE_VECTOR_TOKENS_SAVE_PATH, featureVectorsTokens);
  writeJson(
    FEATURE_VECTOR_TOKENS_BY_JOURNAL_SAVE_PATH,
    featureVectorsTokensByJournal
  );

  console.log("done saving feature vector tokens as .json");
  console.timeEnd("saving-feature-vector-tokens-as-json");
  console.log("\n");

  const processEnd = Date.now();

  console.log(
    "total execution time :",
    (processEnd - processBegin) / 1000,
    "seconds"
  );
})();

/***
 * log large arrays & deep nested objects
 *
 * const util = require("util");
 *
 * console.log(
 *  util.inspect(array, {
 *    maxArrayLength: null,
 *    showHidden: false,
 *    depth: null
 *  })
 * );
 * */
