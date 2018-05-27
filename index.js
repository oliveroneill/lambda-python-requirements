#!/usr/bin/env node
"use strict";
/**
 * Command line interface for bundling python dependencies for Lambda
 */

const path = require('path');
const process = require('process');
const { ArgumentParser } = require('argparse');
const BbPromise = require('bluebird');

const {
  packRequirements
} = require('./lib/zip');
const { installAllRequirements } = require('./lib/pip');
const { pipfileToRequirements } = require('./lib/pipenv');
const { cleanup, postCleanupIfZipped } = require('./lib/clean');
const { injectAllRequirements } = require('./lib/inject');

if (require.main === module) {
  var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'A script to bundle Python packages for AWS Lambda'
  });
  parser.addArgument(
    '--usePipenv',
    {
      help: 'Whether this project uses pipenv',
      defaultValue: false,
      nargs: 0
    }
  );
  parser.addArgument(
    '--pipCmdExtraArgs',
    {
      help: 'Extra arguments for pip install',
      defaultValue: []
    }
  );
  parser.addArgument(
    '--dockerizePip',
    {
      help: 'Use a docker container to ensure dependencies are built correctly',
      defaultValue: false,
      nargs: 0
    }
  );
  parser.addArgument(
    '--pythonBin',
    {
      help: 'Location of python',
      defaultValue: 'python'
    }
  );
  parser.addArgument(
    '--dockerImage',
    {
      help: 'Docker image name to create built dependencies from',
      defaultValue: 'lambci/lambda:build-python3.6'
    }
  );
  parser.addArgument(
    [ '-z', '--zip' ],
    {
      help: 'Whether the bundled dependencies should be zipped',
      defaultValue: false,
      nargs: 0
    }
  );
  this.options = parser.parseArgs();
  this.servicePath = process.cwd();
  this.outputDirectory = 'pal';
  // Packages that should not be included in the bundle
  this.options.noDeploy = [
    'boto3',
    'botocore',
    'docutils',
    'jmespath',
    'python-dateutil',
    's3transfer',
    'six',
    'pip',
    'setuptools'
  ];
  this.options.fileName = path.join(this.servicePath, 'requirements.txt');
  return BbPromise.bind(this)
    .then(cleanup)
    .then(pipfileToRequirements)
    .then(installAllRequirements)
    .then(injectAllRequirements)
    .then(packRequirements)
    .then(postCleanupIfZipped);
}
