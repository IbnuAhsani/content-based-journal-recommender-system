const { calculateTfIdfScores } = require("./utils/tf-idf.util");
const { tokensGenerator } = require("./modules/tokensGenerator");
const { writeCsv } = require("./utils/io.util");
const {
  featureVectorsGenerator,
} = require("./modules/featureVectrosGenerator");

const TF_IDF_SCORES_50_SAVE_PATH =
  "./data/output/tf-idf/fv-tf-idf-scores-50.csv";
const TF_IDF_SCORES_100_SAVE_PATH =
  "./data/output/tf-idf/fv-tf-idf-scores-100.csv";
const TF_IDF_SCORES_200_SAVE_PATH =
  "./data/output/tf-idf/fv-tf-idf-scores-200.csv";
const TF_IDF_SCORES_500_SAVE_PATH =
  "./data/output/tf-idf/fv-tf-idf-scores-500.csv";

(async () => {
  const processBegin = Date.now();

  await tokensGenerator();

  //////////////////////////////

  const featureVectorsGeneratorResult = await featureVectorsGenerator();

  const {
    JSON_DATA: jsonData,
    TOP_50_FEATURE_VECTORS: uniqueTop50MFeatureVectors,
    TOP_100_FEATURE_VECTORS: uniqueTop100MFeatureVectors,
    TOP_200_FEATURE_VECTORS: uniqueTop200MFeatureVectors,
    TOP_500_FEATURE_VECTORS: uniqueTop500MFeatureVectors,
  } = featureVectorsGeneratorResult;

  //////////////////////////////

  console.time("calculate-tfidf-score");

  const featureVectorsTop50MTfidfScores = calculateTfIdfScores(
    uniqueTop50MFeatureVectors,
    jsonData
  );

  const featureVectorsTop100MTfidfScores = calculateTfIdfScores(
    uniqueTop100MFeatureVectors,
    jsonData
  );

  const featureVectorsTop200MTfidfScores = calculateTfIdfScores(
    uniqueTop200MFeatureVectors,
    jsonData
  );

  const featureVectorsTop500MTfidfScores = calculateTfIdfScores(
    uniqueTop500MFeatureVectors,
    jsonData
  );

  console.log("done calculating tf-idf scores");
  console.timeEnd("calculate-tfidf-score");
  console.log("\n");

  //////////////////////////////

  console.time("save-tfidf-scores-as-csv");

  writeCsv(TF_IDF_SCORES_50_SAVE_PATH, featureVectorsTop50MTfidfScores);
  writeCsv(TF_IDF_SCORES_100_SAVE_PATH, featureVectorsTop100MTfidfScores);
  writeCsv(TF_IDF_SCORES_200_SAVE_PATH, featureVectorsTop200MTfidfScores);
  writeCsv(TF_IDF_SCORES_500_SAVE_PATH, featureVectorsTop500MTfidfScores);

  console.log("done saving tf-idf scores as .csv");
  console.timeEnd("save-tfidf-scores-as-csv");

  console.log("\n");

  const processEnd = Date.now();

  console.log(
    "total execution time :",
    (processEnd - processBegin) / 60000,
    "minutes"
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
