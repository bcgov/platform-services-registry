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

'use strict';

import { logger } from '@bcgov/common-nodejs-utils';
import { NameSpacesQuotaSize, ProjectQuotaSize } from '../db/model/namespace';
import { QuotaSize } from '../db/model/quota';

export const getAllowedQuotaSizes = (currentQuotaSize: ProjectQuotaSize): NameSpacesQuotaSize => {
    try {
        const allQuotaOptions = [QuotaSize.Small, QuotaSize.Medium, QuotaSize.Large];

        const availableQuotaOptions: NameSpacesQuotaSize = {
            quotaCpuSize: [],
            quotaMemorySize: [],
            quotaStorageSize: [],
        }

        /**
         * Currently our rule for quota change is to allow user select any size below current option
         * but only one step larger than current option
         * @param quotaSize the current quota Size
         * @returns all option that user can upgrade/downgrade
         */
        const getAllowQuotaForEachResource = (quotaSize: QuotaSize) => {
            const position = allQuotaOptions.indexOf(quotaSize);
            const lowerBound = allQuotaOptions.slice(
                0, position)
            const upperBound = allQuotaOptions[position + 1] || []

            return lowerBound.concat(upperBound)
        }

        for (const key in currentQuotaSize) {
            if (currentQuotaSize[key]) {
                availableQuotaOptions[key] = getAllowQuotaForEachResource(currentQuotaSize[key])
            }
        }

        return availableQuotaOptions
    } catch (err) {
        const message = `Unable to get a list of Allowed quota sizes`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};
