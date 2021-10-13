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

import { errorWithCode } from "@bcgov/common-nodejs-utils";
import { compareNameSpaceQuotaSize } from "../src/db/utils";
import {
  replaceForDescription,
  validateRequiredFields,
} from "../src/libs/utils";

jest.mock("@bcgov/common-nodejs-utils", () => ({
  errorWithCode: jest.fn(),
}));

describe("Utils", () => {
  it("validateRequiredFields works correctly upon missing field(s)", async () => {
    const requiredFields: string[] = [
      "name",
      "description",
      "busOrgId",
      "prioritySystem",
      "userId",
      "namespacePrefix",
      "primaryClusterName",
    ];

    const pojo = {
      name: "Project X",
      description: "This is a cool project.",
      busOrgId: "CITZ",
      prioritySystem: false,
      userId: 4,
    };

    validateRequiredFields(requiredFields, pojo);
    expect(errorWithCode).toHaveBeenCalledWith(
      `Missing required properties: namespacePrefix,primaryClusterName`,
      400
    );
  });

  it("validateRequiredFields works correctly upon empty value in required field(s)", async () => {
    const requiredFields: string[] = [
      "firstName",
      "lastName",
      "email",
      "roleId",
    ];

    const pojo = {
      firstName: "Jane",
      lastName: "Doe",
      email: undefined,
      roleId: "",
    };

    validateRequiredFields(requiredFields, pojo);
    expect(errorWithCode).toHaveBeenCalledWith(
      `Required properties can not be empty: email,roleId`,
      400
    );
  });

  it("replaceForDescription works correctly", async () => {
    const contextJson = {
      profileId: 118,
      displayName: "Project X",
      description: 'test some "double quotes"',
    };

    const result = {
      profileId: 118,
      displayName: "Project X",
      description: "test some  double quotes ",
    };

    expect(replaceForDescription(contextJson)).toEqual(result);
  });

  it("compareNameSpaceQuotaSize works correctly", () => {
    const quotaSizesTest1 = {
      quotaCpuSize: ["small", "small", "small", "small"],
      quotaMemorySize: ["small", "small", "small", "small"],
      quotaStorageSize: ["small", "small", "small", "small"],
    };
    const quotaSizesTest2 = {
      quotaCpuSize: ["small", "small", "large", "small"],
      quotaMemorySize: ["small", "small", "small", "small"],
      quotaStorageSize: ["small", "lagre", "small", "small"],
    };
    const quotaSizesTest3 = {
      quotaCpuSize: ["small"],
      quotaMemorySize: ["small"],
      quotaStorageSize: ["small"],
    };
    const quotaSizesTest4 = {
      quotaCpuSize: [null],
      quotaMemorySize: ["small", "small", "small", "small"],
      quotaStorageSize: [undefined],
    };

    const quotaSizesTest5 = {
      quotaCpuSize: [],
      quotaMemorySize: [],
      quotaStorageSize: [],
    };

    const quotaSizesTest6 = {
      quotaCpuSize: [null, undefined],
      quotaStorageSize: [undefined],
      quotaMemorySize: ["small", "small", "small", "small"],
    };

    const quotaSizesTest7 = {
      quotaCpuSize: [null, undefined],
      quotaStorageSize: [],
      quotaMemorySize: [],
    };
    const quotaSizesTest8 = {
      abcc: [9, 9, 9],
      bca: [1, 1, 1],
    };

    const quotaSizesTest9 = {
      abcc: [9, 8, 9],
      bca: [1, 1, 1],
    };

    expect(compareNameSpaceQuotaSize(quotaSizesTest1)).toEqual(true);
    expect(compareNameSpaceQuotaSize(quotaSizesTest2)).toEqual(false);
    expect(compareNameSpaceQuotaSize(quotaSizesTest3)).toEqual(true);
    expect(compareNameSpaceQuotaSize(quotaSizesTest4)).toEqual(true);
    expect(compareNameSpaceQuotaSize(quotaSizesTest5)).toEqual(true);
    expect(compareNameSpaceQuotaSize(quotaSizesTest6)).toEqual(false);
    expect(compareNameSpaceQuotaSize(quotaSizesTest7)).toEqual(false);
    expect(compareNameSpaceQuotaSize(quotaSizesTest8)).toEqual(true);
    expect(compareNameSpaceQuotaSize(quotaSizesTest9)).toEqual(false);
  });
});
