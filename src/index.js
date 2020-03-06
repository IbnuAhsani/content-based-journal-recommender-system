const groupBy = require("lodash.groupby");
const mapValues = require("lodash.mapvalues");
const uniqBy = require("lodash.uniqby");
const { calculateTfIdfScores } = require("./utils/tf-idf.util");
const { readCsv, readJson, writeCsv, writeJson } = require("./utils/io.util");
const {
  generateTokens,
  removeDuplicateTokens
} = require("./utils/text-normalization.util");
const {
  calculateChiSquareValues,
  createTokenList,
  sliceTopTermsFeatureVectors,
  sortChiSquareValueDescendingly
} = require("./utils/chi-square.util");

const DATASET_PATH = "./data/input/dataset-sample.csv";
const DATASET_JSON_SAVE_PATH = "./data/output/dataset-sample.json";
const FEATURE_VECTOR_TOKENS_SAVE_PATH = "./data/output/fv-tokens.json";
const TF_IDF_SCORES_SAVE_PATH = "./data/output/fv-tf-idf-scores.csv";

(async () => {
  const processBegin = Date.now();

  // console.time("read-csv");

  // const csvData = await readCsv(DATASET_PATH);

  // console.log("done reading .csv");
  // console.timeEnd("read-csv");
  // console.log("\n");

  // //////////////////////////////

  // console.time("preprocessing-text");

  // for (const row of csvData) {
  //   const { ARTICLE_ABSTRACT } = row;
  //   const tokens = generateTokens(ARTICLE_ABSTRACT);
  //   const tokensDuplicateRemoved = removeDuplicateTokens(tokens);

  //   [row.TOKENS, row.TOKENS_DUPLICATE_REMOVED] = [
  //     tokens,
  //     tokensDuplicateRemoved
  //   ];
  // }

  // console.log("done preprocessing .csv text");
  // console.timeEnd("preprocessing-text");
  // console.log("\n");

  // //////////////////////////////

  // console.time("saving-json");

  // writeJson(DATASET_JSON_SAVE_PATH, csvData);

  // console.log("done saving .json");
  // console.timeEnd("saving-json");
  // console.log("\n");

  //////////////////////////////

  console.time("creating-token-list");

  const jsonData = readJson(DATASET_JSON_SAVE_PATH);
  const tokenList = createTokenList(jsonData);
  const featureVectors = [];

  for (const tokenListRow of tokenList) {
    const chiSquareValues = calculateChiSquareValues(tokenListRow, jsonData);
    const featureVector = { ...tokenListRow, ...chiSquareValues };

    featureVectors.push(featureVector);
  }

  console.log("done creating token list");
  console.timeEnd("creating-token-list");
  console.log("\n");

  //////////////////////////////

  console.time("grouping-feature-vectors");

  const featureVectorsGroupedByJournalId = groupBy(
    featureVectors,
    item => item.JOURNAL_ID
  );

  console.log("done grouping feature vectors");
  console.timeEnd("grouping-feature-vectors");
  console.log("\n");

  //////////////////////////////

  console.time("pick-top-m-feature-vectors");

  const topMFeatureVectors = [];

  for (const key in featureVectorsGroupedByJournalId) {
    const groupedFeatureVectors = featureVectorsGroupedByJournalId[key];
    const uniqueFeatureVectors = uniqBy(groupedFeatureVectors, fv => fv.TOKEN);
    const sortedFeatureVectors = sortChiSquareValueDescendingly(
      uniqueFeatureVectors
    );
    const topFeatureVectors = sliceTopTermsFeatureVectors(
      sortedFeatureVectors,
      100
    );

    topMFeatureVectors.push(...topFeatureVectors);
  }

  console.log("done picking top M feature vectors");
  console.timeEnd("pick-top-m-feature-vectors");
  console.log("\n");

  //////////////////////////////

  console.time("filtering-duplicate-feature-vectors");

  const uniqueTopMFeatureVectors = uniqBy(topMFeatureVectors, fv => fv.TOKEN);

  console.log("done filtering duplicate feature vectors");
  console.timeEnd("filtering-duplicate-feature-vectors");
  console.log("\n");

  //////////////////////////////

  console.time("saving-feature-vector-tokens-as-json");

  const featureVectorsTokens = mapValues(
    groupBy(uniqueTopMFeatureVectors, "JOURNAL_TITLE"),
    fvGroupedByTitle => fvGroupedByTitle.map(fv => fv.TOKEN)
  );

  writeJson(FEATURE_VECTOR_TOKENS_SAVE_PATH, featureVectorsTokens);

  console.log("done saving feature vector tokens as .json");
  console.timeEnd("saving-feature-vector-tokens-as-json");
  console.log("\n");

  //////////////////////////////

  console.time("calculate-tfidf-score");

  const featureVectorsTfidfScores = calculateTfIdfScores(
    uniqueTopMFeatureVectors,
    jsonData
  );

  console.log("done calculating tf-idf scores");
  console.timeEnd("calculate-tfidf-score");
  console.log("\n");

  //////////////////////////////

  console.time("save-tfidf-scores-as-csv");

  writeCsv(TF_IDF_SCORES_SAVE_PATH, featureVectorsTfidfScores);

  console.log("done saving tf-idf scores as .csv");
  console.timeEnd("save-tfidf-scores-as-csv");

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
