const fse = require('fs-extra');
const rimraf = require('rimraf');
const path = require('path');
const get = require('lodash.get');
const set = require('lodash.set');
const { spawnSync } = require('child_process');
const { buildImage, getBindPath, getDockerUid } = require('./docker');

/**
 * Install requirements described in requirementsPath to targetFolder
 * @param {string} requirementsPath
 * @param {string} targetFolder
 * @param {Object} serverless
 * @param {string} servicePath
 * @param {Object} options
 * @return {undefined}
 */
function installRequirements(
  requirementsPath,
  targetFolder,
  serverless,
  servicePath,
  options
) {
  // Create target folder if it does not exist
  const targetRequirementsFolder = targetFolder;
  fse.ensureDirSync(targetRequirementsFolder);

  const dotSlsReqs = path.join(targetFolder, 'requirements.txt');
  if (options.usePipenv && fse.existsSync(path.join(servicePath, 'Pipfile'))) {
    generateRequirementsFile(dotSlsReqs, dotSlsReqs, options);
  } else {
    generateRequirementsFile(requirementsPath, dotSlsReqs, options);
  }

  console.log(
    `Installing requirements of ${requirementsPath} in ${targetFolder}...`
  );

  let cmd;
  let cmdOptions;
  let pipCmd = [
    options.pythonBin,
    '-m',
    'pip',
    'install',
    '-t',
    dockerPathForWin(options, targetRequirementsFolder),
    '-r',
    dockerPathForWin(options, dotSlsReqs),
    ...options.pipCmdExtraArgs
  ];
  if (!options.dockerizePip) {
    // Check if pip has Debian's --system option and set it if so
    const pipTestRes = spawnSync(options.pythonBin, [
      '-m',
      'pip',
      'help',
      'install'
    ]);
    if (pipTestRes.error) {
      if (pipTestRes.error.code === 'ENOENT') {
        throw new Error(
          `${options.pythonBin} not found! ` + 'Try the pythonBin option.'
        );
      }
      throw pipTestRes.error;
    }
    if (pipTestRes.stdout.toString().indexOf('--system') >= 0) {
      pipCmd.push('--system');
    }
  }
  if (options.dockerizePip) {
    cmd = 'docker';

    // Build docker image if required
    let dockerImage;
    if (options.dockerFile) {
      console.log(
        `Building custom docker image from ${options.dockerFile}...`
      );
      dockerImage = buildImage(options.dockerFile);
    } else {
      dockerImage = options.dockerImage;
    }
    console.log(`Docker Image: ${dockerImage}`);

    // Prepare bind path depending on os platform
    const bindPath = getBindPath(servicePath);

    cmdOptions = ['run', '--rm', '-v', `"${bindPath}:/var/task:z"`];
    if (options.dockerSsh) {
      // Mount necessary ssh files to work with private repos
      cmdOptions.push(
        '-v',
        `${process.env.HOME}/.ssh/id_rsa:/root/.ssh/id_rsa:z`
      );
      cmdOptions.push(
        '-v',
        `${process.env.HOME}/.ssh/known_hosts:/root/.ssh/known_hosts:z`
      );
      cmdOptions.push('-v', `${process.env.SSH_AUTH_SOCK}:/tmp/ssh_sock:z`);
      cmdOptions.push('-e', 'SSH_AUTH_SOCK=/tmp/ssh_sock');
    }
    if (process.platform === 'linux') {
      // Use same user so requirements folder is not root and so --cache-dir works
      cmdOptions.push('-u', `${process.getuid()}`);
      // const stripCmd = quote([
      //   'find', targetRequirementsFolder,
      //   '-name', '"*.so"',
      //   '-exec', 'strip', '{}', '\;',
      // ]);
      // pipCmd = ['/bin/bash', '-c', '"' + pipCmd + ' && ' + stripCmd + ' && ' + chownCmd + '"'];
    } else {
      // Use same user so --cache-dir works
      cmdOptions.push('-u', getDockerUid(bindPath));
    }
    cmdOptions.push(dockerImage);
    cmdOptions.push(...pipCmd);
  } else {
    cmd = pipCmd[0];
    cmdOptions = pipCmd.slice(1);
  }
  const res = spawnSync(cmd, cmdOptions, { cwd: servicePath, shell: true });
  if (res.error) {
    if (res.error.code === 'ENOENT') {
      if (options.dockerizePip) {
        throw new Error('docker not found! Please install it.');
      }
      throw new Error(
        `${options.pythonBin} not found! Try the pythonBin option.`
      );
    }
    throw res.error;
  }
  if (res.status !== 0) {
    throw new Error(res.stderr);
  }
}

/**
 * convert path from Windows style to Linux style, if needed
 * @param {Object} options
 * @param {string} path
 * @return {string}
 */
function dockerPathForWin(options, path) {
  if (process.platform === 'win32' && options.dockerizePip) {
    return path.replace('\\', '/');
  }
  return path;
}

/** create a filtered requirements.txt without anything from noDeploy
 * @param {string} source requirements
 * @param {string} target requirements where results are written
 * @param {Object} options
 */
function generateRequirementsFile(source, target, options) {
  const noDeploy = new Set(options.noDeploy || []);
  const requirements = fse
    .readFileSync(source, { encoding: 'utf-8' })
    .split(/\r?\n/);
  const filteredRequirements = requirements.filter(req => {
    return !noDeploy.has(req.split(/[=<> \t]/)[0].trim());
  });
  fse.writeFileSync(target, filteredRequirements.join('\n'));
}

/**
 * pip install the requirements to the lambda/requirements directory
 * @return {undefined}
 */
function installAllRequirements() {
  fse.ensureDirSync(path.join(this.servicePath, this.outputDirectory));
  installRequirements(
    this.options.fileName,
    this.outputDirectory,
    this.serverless,
    this.servicePath,
    this.options
  );
}

module.exports = { installAllRequirements };
