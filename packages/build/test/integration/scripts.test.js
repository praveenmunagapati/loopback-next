// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');

describe('build', () => {
  var cwd = process.cwd();
  var projectDir = path.resolve(__dirname, '../fixtures');

  function cleanup() {
    fs.removeSync(path.join(projectDir, 'tsconfig.json'));
    fs.removeSync(path.join(projectDir, 'dist'));
    fs.removeSync(path.join(projectDir, 'api-docs'));
  }

  before(() => {
    process.chdir(projectDir);
    cleanup();
  });

  after(() => {
    cleanup();
    process.chdir(cwd);
  });

  it('compiles ts files', done => {
    var run = require('../../bin/compile-package');
    var childProcess = run(['node', 'bin/compile-package']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      assert(
        fs.existsSync(path.join(projectDir, 'dist')),
        'dist should have been created'
      );
      assert(
        fs.existsSync(path.join(projectDir, 'tsconfig.json')),
        'tsconfig.json should have been created'
      );
      done();
    });
  });

  it('generates apidocs', done => {
    var run = require('../../bin/generate-apidocs');
    var childProcess = run(['node', 'bin/generate-apidocs']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      assert(
        fs.existsSync(path.join(projectDir, 'api-docs')),
        'api-docs should have been created'
      );
      done();
    });
  });

  it('runs tslint against ts files', done => {
    var run = require('../../bin/run-tslint');
    var childProcess = run(['node', 'bin/run-tslint']);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      done();
    });
  });

  it('runs prettier against ts files', done => {
    var run = require('../../bin/run-prettier');
    var childProcess = run([
      'node',
      'bin/run-prettier',
      '**/src/*.ts',
      '--',
      '-l',
    ]);
    childProcess.on('close', code => {
      assert.equal(code, 0);
      done();
    });
  });
});
