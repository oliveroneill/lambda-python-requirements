const fse = require('fs-extra');
const path = require('path');
const get = require('lodash.get');
const set = require('lodash.set');
const values = require('lodash.values');
const uniqBy = require('lodash.uniqby');
const BbPromise = require('bluebird');
const JSZip = require('jszip');
const { addTree, writeZip } = require('./zipTree');

BbPromise.promisifyAll(fse);

/**
 * Add the vendor helper to the current service tree.
 * @return {Promise}
 */
function addVendorHelper() {
  if (this.options.zip) {
    console.log('Adding Python requirements helper...');

    var src = path.resolve(__dirname, '../unzip_requirements.py');
    var dest = path.join(this.servicePath, 'unzip_requirements.py')
    if (src === dest) {
      return;
    }
    return fse.copyAsync(src, dest);
  }
}

/**
 * Remove the vendor helper from the current service tree.
 * @return {Promise} the promise to remove the vendor helper.
 */
function removeVendorHelper() {
  if (this.options.zip && this.options.cleanupZipHelper) {
    console.log('Removing Python requirements helper...');
    return fse.removeAsync(
      path.join(this.servicePath, 'unzip_requirements.py')
    );
  }
}

/**
 * Zip up lambda/requirements.
 * @return {Promise} the promise to pack requirements.
 */
function packRequirements() {
  if (this.options.zip) {
    console.log('Zipping required Python packages...');
    return addTree(new JSZip(), path.join(this.servicePath, 'lambda/requirements')).then(zip =>
      writeZip(zip, path.join(this.servicePath, 'requirements.zip'))
    );
  }
}

module.exports = { addVendorHelper, removeVendorHelper, packRequirements };
