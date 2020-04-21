//
// Code Sign
//
// Copyright © 2018 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Created by Jason Leach on 2018-10-20.
//

/* eslint-disable no-unused-vars */

'use strict';

import sb from 'stream-buffers';

const fs = jest.requireActual('fs');
const rs = fs.createReadStream;

function access(path, flag, cb) {
  if (path === 'no-file-access') {
    return cb(new Error('No access to this file - mock'));
  }

  return cb(undefined);
}

function readFile(path, options, cb) {
  if (path === 'no-file') {
    return cb(new Error('No such file - mock'), undefined);
  }

  return cb(undefined, Buffer.from('Hello World', 'utf8'));
}

function createWriteStream(path) {
  const stream = new sb.WritableStreamBuffer({
    initialSize: 100 * 1024 * 10, // start at 1000 kilobytes.
    incrementAmount: 10 * 1024, // grow by 10 kilobytes each time buffer overflows.
  });

  return stream;
}

function createReadStream(path) {
  if (path.includes('uploads')) {
    return undefined;
  }

  return rs(path);
}

fs.readFile = readFile;
fs.access = access;
fs.createWriteStream = createWriteStream;
fs.createReadStream = createReadStream;

module.exports = fs;
