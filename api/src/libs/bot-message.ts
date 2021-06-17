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
import DataManager from '../db';
import { BotMessage } from '../db/model/request';
import { NatsContext } from '../types';
import shared from './shared';

const dm = new DataManager(shared.pgPool);
const { RequestModel, NamespaceModel } = dm;

export const createBotMessageSet = async ( requestId: number, natsSubject: string, natsContext: NatsContext ): Promise<any> => {
  if (!requestId) {
      throw new Error('Cant get profile id');
  }

  const clusters = await NamespaceModel.findClustersForProfile(natsContext.profile_id);

  for (const cluster of clusters) {
    await RequestModel.createBotMessage({
      requestId,
      natsSubject,
      natsContext,
      clusterName: cluster.name,
      receivedCallback: false,
    })
  }
};

export const fetchBotMessageRequests = async (requestId: number): Promise<BotMessage[]> => {
  try {
      return await RequestModel.findActiveBotMessagesByRequestId(requestId);
  } catch (err) {
      const message = `Unable to fetch existing bot message requests for request ${requestId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
  }
};
