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
        const quotaSizeNames = Object.values(QuotaSize);
        const allQuotaOptions = [QuotaSize.Small, QuotaSize.Medium, QuotaSize.Large];

        const availableQuotaOptions: NameSpacesQuotaSize = {
            quotaCpuSize: [],
            quotaMemorySize: [],
            quotaStorageSize: [],
        }

        for (const key in currentQuotaSize) {
            if (currentQuotaSize[key]) {
                const num: number = quotaSizeNames.indexOf(currentQuotaSize[key]);
                availableQuotaOptions[key] = allQuotaOptions.slice(
                    0, (num + 2 <= allQuotaOptions.length) ? (num + 2) : allQuotaOptions.length).filter(
                        size => size !== currentQuotaSize[key]
                    );
            }
        }

        return availableQuotaOptions
    } catch (err) {
        const message = `Unable to get a list of Allowed quota sizes`;
        logger.error(`${message}, err = ${err.message}`);

        throw err;
    }
};
