const BbPromise = require('bluebird');
const fse = require('fs-extra');
const glob = require('glob-all');
const get = require('lodash.get');
const set = require('lodash.set');
const path = require('path');
const values = require('lodash.values');
const JSZip = require('jszip');
const { writeZip, zipFile } = require('./zipTree');

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

  console.log("reading...", packagePath);
  return fse
    .readFileAsync(packagePath)
    .then(buffer => JSZip.loadAsync(buffer))
    .then(zip =>
      BbPromise.resolve(
        glob.sync([path.join(requirementsPath, '**')], {
          mark: true,
          dot: true
        })
      )
        .map(file => [file, path.relative(requirementsPath, file)])
        .filter(
          ([file, relativeFile]) =>
            !file.endsWith('/') &&
            !relativeFile.match(/^__pycache__[\\/]/) &&
            !noDeploy.has(relativeFile.split(/([-\\/]|\.py$|\.pyc$)/, 1)[0])
        )
        .map(([file, relativeFile]) => zipFile(zip, relativeFile, fse.readFileAsync(file)))
        .then(() => writeZip(zip, packagePath))
    );
}

/**
 * Remove all modules but the selected module from a package.
 * @param {string} source path to original package
 * @param {string} target path to result package
 * @param {string} module module to keep
 * @return {Promise} the JSZip object written out.
 */
function moveModuleUp(source, target, module) {
  const targetZip = new JSZip();

  return fse
    .readFileAsync(source)
    .then(buffer => JSZip.loadAsync(buffer))
    .then(sourceZip => sourceZip.filter(file => file.startsWith(module + '/')))
    .map(srcZipObj =>
      zipFile(
        targetZip,
        srcZipObj.name.replace(module + '/', ''),
        srcZipObj.async('nodebuffer')
      )
    )
    .then(() => writeZip(targetZip, target));
}

/**
 * Inject requirements into packaged application.
 * @return {Promise} the combined promise for requirements injection.
 */
function injectAllRequirements(funcArtifact) {
  console.log('Injecting required Python packages to package...');

  return injectRequirements(
    this.outputDirectory,
    this.servicePath,
    this.options
  );
}

module.exports = { injectAllRequirements };
