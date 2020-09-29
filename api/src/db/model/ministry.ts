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
// Created by Jason Leach on 2020-06-22.
//

import { Pool } from 'pg';
import { CommonFields, Model } from './model';

export interface Ministry extends CommonFields {
    name: string,
}

export default class MinistryModel extends Model {
    table: string = 'ref_bus_org';
    requiredFields: string[] = [
        'name',
    ];
    pool: Pool;

    constructor(pool: any) {
        super();
        this.pool = pool;
    }
}