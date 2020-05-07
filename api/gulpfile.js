//
// Code Signing
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
// Created by Jason Leach on 2018-01-10.
//

'use strict';

const gulp = require('gulp');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const child = require('child_process');

let tsp = ts.createProject('tsconfig.json');

gulp.task('clean', () =>
  gulp.src('build', { read: false, allowEmpty: true }).pipe(
    clean({
      force: true,
    })
  )
);

gulp.task('transpile-src', () =>
  tsp
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsp())
    .js.pipe(
      sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: file => {
          return file.cwd + '/src';
        },
      })
    )
    .pipe(gulp.dest('build'))
);

gulp.task('copy-app-config', () => gulp.src('src/config/*.json').pipe(gulp.dest('build/config')));

gulp.task('copy-node-config', () =>
  gulp.src(['package.json', 'package-lock.json']).pipe(gulp.dest('build'))
);

gulp.task('link-env', () => child.spawn('ln', ['-sf', '../.env', './build'], { stdio: 'inherit' }));

gulp.task(
  'default',
  gulp.series(
    'clean',
    gulp.parallel('transpile-src', 'copy-app-config', 'copy-node-config')
  )
);

gulp.task('watch-src-changes', () =>
  gulp.watch(["src/**/*.{ts,tsx}"],
    gulp.parallel('transpile-src', 'copy-app-config',
      'copy-node-config', 'link-env')
  )
);
