#!/usr/bin/env node
// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/compile-package <target>

Where <target> is either es2017 or es2015.

========
*/

'use strict';

function run(argv) {
  const utils = require('./utils');
  const path = require('path');
  const fs = require('fs');

  const packageDir = utils.getPackageDir();

  const compilerOpts = argv.slice(2);

  const isTargetSet = utils.isOptionSet(compilerOpts, '--target');
  const isOutDirSet = utils.isOptionSet(compilerOpts, '--outDir');
  const isProjectSet = utils.isOptionSet(compilerOpts, '-p', '--project');

  var target;

  if (!isTargetSet) {
    target = compilerOpts.shift();

    if (!target) {
      target = utils.getCompilationTarget();
    }
  }

  var outDir;

  if (!isOutDirSet) {
    outDir = path.join(packageDir, utils.getDistribution());
  }

  var tsConfigFile;

  if (!isProjectSet) {
    var rootDir = utils.getRootDir();
    tsConfigFile = utils.getConfigFile('tsconfig.build.json', 'tsconfig.json');
    if (tsConfigFile === path.join(rootDir, 'config/tsconfig.build.json')) {
      // No local tsconfig.build.json or tsconfig.json found
      var baseConfigFile = path.join(rootDir, 'config/tsconfig.common.json');
      baseConfigFile = path.relative(packageDir, baseConfigFile);
      // Create tsconfig.json under the package as it's required to parse
      // include/exclude correctly
      tsConfigFile = path.join(packageDir, 'tsconfig.json');
      fs.writeFileSync(
        tsConfigFile,
        JSON.stringify(
          {
            extends: baseConfigFile,
            include: ['src', 'test'],
            exclude: [
              'node_modules/**',
              'packages/*/node_modules/**',
              '**/*.d.ts',
            ],
          },
          null,
          '  '
        )
      );
    }
  }

  const args = [];

  if (tsConfigFile) {
    args.push('-p', tsConfigFile);
  }
  if (target) {
    args.push('--target', target);
  }

  if (outDir) {
    args.push('--outDir', outDir);
  }

  args.push(...compilerOpts);

  return utils.runCLI('typescript/lib/tsc', args);
}

module.exports = run;
if (require.main === module) run(process.argv);
