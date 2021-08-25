//
// Copyright © 2020 Province of British Columbia
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

import { logger } from "@bcgov/common-nodejs-utils";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import express from "express";
import fs from "fs";
import path from "path";
import { authmware } from "./libs/authmware";
import { router } from "./router";

// Config

const app = express();
const options = {
  inflate: true,
  limit: "204800kb", // 200Mb
  type: "image/*",
};
const docpath = path.join(__dirname, "../", "public/doc/api");
const pubpath = path.join(__dirname, "../", "public");

fs.access(docpath, fs.constants.R_OK, (err) => {
  if (err) {
    logger.warn("API documentation does not exist");
    return;
  }

  app.use("/doc", express.static(docpath));
});

fs.access(pubpath, fs.constants.R_OK, (err) => {
  if (err) {
    logger.warn("Static assets location does not exist");
    return;
  }

  app.use("/", express.static(pubpath));
});

app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(express.raw(options));
app.use(flash());
// app.use('/download', express.static('download'));

// Authentication middleware
authmware(app);

// Server API routes
router(app);

// Error handleing middleware. This needs to be last in or it will
// not get called.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.message);
  const code = err.code ? err.code : 500;
  const message = err.message ? err.message : "Internal Server Error";

  res.status(code).json({ error: message, success: false });
});

export default app;
