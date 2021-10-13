//
// Copyright © 2020 Province of British Columbia
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
import DataManager from "../db";
import { ProjectNamespace } from "../db/model/namespace";
import shared from "./shared";

const dm = new DataManager(shared.pgPool);
const { NamespaceModel } = dm;

const createNamespaces = async (
  names: any,
  profileId: number
): Promise<ProjectNamespace[]> => {
  try {
    const nsPromises: ProjectNamespace[] = names.map((name) =>
      NamespaceModel.create({
        name,
        profileId,
      })
    );

    return await Promise.all(nsPromises);
  } catch (err) {
    const message = `Unable to create namespaces for profile ${profileId}`;
    logger.error(`${message}, err = ${err.message}`);

    throw err;
  }
};

export default createNamespaces;
