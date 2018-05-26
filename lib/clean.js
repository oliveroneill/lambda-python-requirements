const BbPromise = require('bluebird');
const fse = require('fs-extra');
const path = require('path');
const values = require('lodash.values');

BbPromise.promisifyAll(fse);

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

function postCleanupIfZipped() {
  if (this.options.zip) {
    fse.removeAsync(path.join(this.servicePath, this.outputDirectory))
  }
}

module.exports = { cleanup, postCleanupIfZipped };
