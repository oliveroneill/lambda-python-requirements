const path = require('path');
const JSZip = require('jszip');
const { addTree, writeZip } = require('./zipTree');

/**
 * Zip up lambda/requirements.
 * @return {Promise} the promise to pack requirements.
 */
function packRequirements() {
  if (this.options.zip) {
    console.log('Zipping required Python packages...');
    return addTree(new JSZip(), path.join(this.servicePath, this.outputDirectory)).then(zip =>
      writeZip(zip, path.join(this.servicePath, 'package.zip'))
    );
  }
}

module.exports = { packRequirements };
