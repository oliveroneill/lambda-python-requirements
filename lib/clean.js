const BbPromise = require('bluebird');
const fse = require('fs-extra');
const path = require('path');
const values = require('lodash.values');

BbPromise.promisifyAll(fse);

/**
 * clean up requirements.zip and unzip_requirements.py
 * @return {Promise}
 */
function cleanup() {
  const artifacts = [];
  if (this.options.zip) {
    artifacts.push('requirements.zip');
  }

  return BbPromise.all(
    artifacts.map(artifact =>
      fse.removeAsync(path.join(this.servicePath, artifact))
    )
  );
}

/**
 * clean up lambda/ directory
 * @return {Promise}
 */
function cleanupLambdaDirectory() {
  return BbPromise.all(
    fse.removeAsync(path.join(this.servicePath, "lambda/"))
  );
}

module.exports = { cleanup, cleanupLambdaDirectory };
