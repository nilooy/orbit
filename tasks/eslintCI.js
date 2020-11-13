// @noflow
/* eslint-disable no-console */
const { ESLint } = require("eslint");
const { Git } = require("@adeira/monorepo-utils");
const path = require("path");
const log = require("fancy-log");

async function eslintCI() {
  const eslint = new ESLint({
    reportUnusedDisableDirectives: "error",
  });

  function shouldLintAll(fileName) {
    return [
      path.basename(__filename),
      "package.json",
      "yarn.lock",
      ".eslintrc",
      ".eslintrc.js",
      ".eslintignore",
      "eslintJS.js",
      "eslintTS.js",
    ].some(f => fileName.endsWith(f));
  }

  const changedFiles = Git.getChangedFiles();

  let filesToLint;

  if (changedFiles.some(shouldLintAll)) {
    log("Some critical files have been changed, running ESLint on all files...");
    filesToLint = ".";
  } else {
    filesToLint = changedFiles.filter(fileName => fileName.match(/\.(jsx?|tsx?|flow)$/));
  }

  const results = await eslint.lintFiles(filesToLint);
  const errorResults = ESLint.getErrorResults(results); // --quiet

  if (results.errorCount > 0) {
    const formatter = await eslint.loadFormatter();
    console.log(formatter(errorResults));
    process.exit(1);
  }
}

module.exports = eslintCI;
