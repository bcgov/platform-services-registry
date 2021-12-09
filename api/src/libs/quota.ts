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

// Comment out this code becasue under current rule, we allow user to select all available quota size

// import { logger } from "@bcgov/common-nodejs-utils";
// import { NameSpacesQuotaSize } from "../db/model/namespace";
// import { NamespaceQuotaSize } from "../db/model/quota";

/**
 * Currently our rule for quota change is to allow user select any size below current option
 * but only one step larger than current option
 * @param quotaSize the current quota Size
 * @returns all option that user can upgrade/downgrade
 */
// export const getAllowQuotaForEachResource = (
//   quotaSize: QuotaSize = QuotaSize.Small
// ) => {
//   const allQuotaOptions = [QuotaSize.Small, QuotaSize.Medium, QuotaSize.Large];

//   // Incase we have some parameter that is not one of our option, we will use Small quota size as default parameter
//   const position =
//     allQuotaOptions.indexOf(quotaSize) < 0
//       ? 0
//       : allQuotaOptions.indexOf(quotaSize);

//   const lowerBound = allQuotaOptions.slice(0, position);
//   const upperBound = allQuotaOptions[position + 1] || [];

//   return lowerBound.concat(upperBound);
// };

// export const getAllowedQuotaSizes = (
//   currentQuotaSize: NamespaceQuotaSize
// ): NameSpacesQuotaSize => {
//   try {
//     const availableQuotaOptions: NameSpacesQuotaSize = Object.keys(
//       currentQuotaSize
//     ).reduce(
//       (acc: NameSpacesQuotaSize, quotaSize: string) => {
//         acc[quotaSize] = getAllowQuotaForEachResource(
//           currentQuotaSize[quotaSize]
//         );
//         return acc;
//       },
//       {
//         quotaCpuSize: [],
//         quotaMemorySize: [],
//         quotaStorageSize: [],
//         quotaSnapshotSize: [],
//       }
//     );

//     return availableQuotaOptions;
//   } catch (err) {
//     const message = "Unable to get a list of Allowed quota sizes";
//     logger.error(`${message}, err = ${err.message}`);

//     throw err;
//   }
// };

// export default getAllowedQuotaSizes;
