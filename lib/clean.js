const BbPromise = require('bluebird');
const fse = require('fs-extra');
const path = require('path');
const values = require('lodash.values');

BbPromise.promisifyAll(fse);

/**
* clean up package.zip and output directory
* @return {Promise}
*/
function cleanup() {
  const artifacts = [
    this.outputDirectory,
    'package.zip'
  ];

  return BbPromise.all(
    artifacts.map(artifact =>
      fse.removeAsync(path.join(this.servicePath, artifact))
    )
  );
}

/**
* clean up the output directory since the zip will contain what's needed
* @return {Promise}
*/
function postCleanupIfZipped() {
  if (this.options.zip) {
    fse.removeAsync(path.join(this.servicePath, this.outputDirectory))
  }
}

module.exports = { cleanup, postCleanupIfZipped };
