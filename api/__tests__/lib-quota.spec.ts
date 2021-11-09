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

import { NameSpacesQuotaSize } from "../src/db/model/namespace";
import { ProjectQuotaSize, QuotaSize } from "../src/db/model/quota";
import {
  getAllowedQuotaSizes,
  getAllowQuotaForEachResource,
} from "../src/libs/quota";

describe("Quota services", () => {
  it("getAllowedQuotaSizes works correctly", async () => {
    const testCurrentQuotaSize: ProjectQuotaSize = {
      quotaCpuSize: QuotaSize.Small,
      quotaMemorySize: QuotaSize.Medium,
      quotaStorageSize: QuotaSize.Large,
      quotaSnapshotSize: QuotaSize.Small,
    };

    const expectedAllowQuotaSizes: NameSpacesQuotaSize = {
      quotaCpuSize: [QuotaSize.Medium],
      quotaMemorySize: [QuotaSize.Small, QuotaSize.Large],
      quotaStorageSize: [QuotaSize.Small, QuotaSize.Medium],
      quotaSnapshotSize: [QuotaSize.Medium],
    };

    expect(getAllowedQuotaSizes(testCurrentQuotaSize)).toEqual(
      expectedAllowQuotaSizes
    );
  });

  it("getAllowedQuotaSizes works correctly", async () => {
    const testCurrentQuotaSize1 = QuotaSize.Small;
    const testCurrentQuotaSize2 = QuotaSize.Medium;
    const testCurrentQuotaSize3 = QuotaSize.Large;
    const testCurrentQuotaSize5 = undefined;

    const expectedAllowQuotaSizes1 = [QuotaSize.Medium];
    const expectedAllowQuotaSizes2 = [QuotaSize.Small, QuotaSize.Large];
    const expectedAllowQuotaSizes3 = [QuotaSize.Small, QuotaSize.Medium];
    const expectedAllowQuotaSizes5 = [QuotaSize.Medium];

    expect(getAllowQuotaForEachResource(testCurrentQuotaSize1)).toEqual(
      expectedAllowQuotaSizes1
    );
    expect(getAllowQuotaForEachResource(testCurrentQuotaSize2)).toEqual(
      expectedAllowQuotaSizes2
    );
    expect(getAllowQuotaForEachResource(testCurrentQuotaSize3)).toEqual(
      expectedAllowQuotaSizes3
    );
    expect(getAllowQuotaForEachResource(testCurrentQuotaSize5)).toEqual(
      expectedAllowQuotaSizes5
    );
  });
});
