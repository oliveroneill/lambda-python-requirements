#!/usr/bin/env node
"use strict";
/**
 * Command line interface for bundling python dependencies for Lambda
 */

const path = require('path');
const process = require('process');
const { ArgumentParser } = require('argparse');

const {
  packRequirements
} = require('./lib/zip');
const { installAllRequirements } = require('./lib/pip');
const { pipfileToRequirements } = require('./lib/pipenv');
const { cleanup, cleanupLambdaDirectory } = require('./lib/clean');

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
  // Cleanup any old requirements
  cleanup.bind(this)();
  pipfileToRequirements.bind(this)();
  installAllRequirements.bind(this)();
  packRequirements.bind(this)();
  if (this.options.zip) {
    // Clean up temporary directories if we're using zip option
    // If not, the lambda directory is the output
    cleanupLambdaDirectory.bind(this)();
  }
}
