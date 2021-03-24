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
import config from '../config';
import DataManager from '../db';
import { BotMessage, Request, RequestEditContacts, RequestEditType } from '../db/model/request';
import { contextForProvisioning, FulfillmentContextAction } from './fulfillment';
import shared from './shared';

const dm = new DataManager(shared.pgPool);
const { RequestModel } = dm;

export const createBotMessageSet = async ( profileId: number, request: Request ): Promise<any> => {
  if (!profileId) {
      throw new Error('Cant get profile id');
  }

  const natsSubject = config.get('nats:subject');
  const natsContext = await createNatsContext(profileId, String(request.editType), request.editObject);
  const clusters = natsContext.namespaces[0].clusters;

  const promises: any = [];
  clusters.forEach(cluster => {
    // create Bot Message record for each cluster project-profile edit
    promises.push(RequestModel.createBotMessage({
      requestId: Number(request.id),
      natsSubject,
      natsContext,
      clusterName: cluster.name,
      receivedCallback: false,
    }));
  })

  await Promise.all(promises);
};

const createNatsContext = async ( profileId: number, requestType: string, requestEditObject: any ): Promise<any> => {
  const context = await contextForProvisioning(profileId, FulfillmentContextAction.Edit);

  if (!context) {
    const errmsg = `No context for ${profileId}`;
    throw new Error(errmsg);
  }

  switch (requestType) {
    case RequestEditType.QuotaSize:
      context.quota = requestEditObject.quota;
      context.quotas = requestEditObject.quotas;
      break;
    case RequestEditType.Contacts:
      Object.values(RequestEditContacts).forEach(contact => {
        context[contact] = requestEditObject[contact];
      });
      break;
    case RequestEditType.ProjectProfile:
      context.description = requestEditObject.description;
      break;
    default:
      const errmsg = `Invalid edit type for request ${requestType}`;
      throw new Error(errmsg);
  }
}

export const fetchBotMessageRequests = async (requestId: number): Promise<BotMessage[]> => {
  try {
      return await RequestModel.findForRequest(requestId);
  } catch (err) {
      const message = `Unable to fetch existing bot message requests for request ${requestId}`;
      logger.error(`${message}, err = ${err.message}`);

      throw err;
  }
};
