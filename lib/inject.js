const BbPromise = require('bluebird');
const fse = require('fs-extra');
const glob = require('glob-all');
const get = require('lodash.get');
const set = require('lodash.set');
const path = require('path');
const values = require('lodash.values');
const JSZip = require('jszip');

BbPromise.promisifyAll(fse);

/**
 * Inject requirements into packaged application.
 * @param {string} requirementsPath requirements folder path
 * @param {string} packagePath target package path
 * @param {Object} options our options object
 * @return {Promise} the JSZip object constructed.
 */
function injectRequirements(requirementsPath, packagePath, options) {
  const noDeploy = new Set(options.noDeploy || []);

  return BbPromise.resolve(
      glob.sync([path.join(packagePath, '**'), '!'+path.join(requirementsPath, '**')], {
        mark: true,
        dot: true
      })
    )
      .map(file => [file, path.relative(packagePath, file)])
      .filter(
        ([file, relativeFile]) =>
          !file.endsWith('/') &&
          !relativeFile.match(/^__pycache__[\\/]/) &&
          !relativeFile.match(/^\.cache[\\/]/) &&
          !relativeFile.match(/^\.pytest_cache[\\/]/) &&
          !noDeploy.has(relativeFile.split(/([-\\/]|\.py$|\.pyc$)/, 1)[0])
      )
      .map(([file, relativeFile]) =>
        fse.copy(file, path.join(requirementsPath, relativeFile))
      );
}

/**
 * Inject requirements into packaged application.
 * @return {Promise} the combined promise for requirements injection.
 */
function injectAllRequirements(funcArtifact) {
  console.log('Injecting required Python packages to package...');

  return injectRequirements(
    path.join(this.servicePath, this.outputDirectory),
    this.servicePath,
    this.options
  );
}

module.exports = { injectAllRequirements };
