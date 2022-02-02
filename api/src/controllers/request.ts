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

import { errorWithCode, logger } from "@bcgov/common-nodejs-utils";
import { Response } from "express";
import { PROFILE_STATUS } from "../constants";
import DataManager from "../db";
import { AccessFlag } from "../libs/authorization";
import { HumanActionType, RequestType } from "../db/model/request";
import { AuthenticatedUser } from "../libs/authmware";
import { fulfillRequest } from "../libs/fulfillment";
import { MessageType, sendProvisioningMessage } from "../libs/messaging";
import { archiveProjectSet, updateProfileStatus } from "../libs/profile";
import shared from "../libs/shared";

const dm = new DataManager(shared.pgPool);

export const fetchHumanActionRequests = async (
  { query }: { query: any },
  res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  const { filter } = query;

  try {
    const filterValue = true;
    // Step 1. fetch all requests with matching filter
    const requests = await RequestModel.findActiveByFilter(filter, filterValue);
    // Step 2. return JSON of project Ids
    res.status(200).json(requests);
  } catch (err) {
    const message = `Unable to fetch requests requiring human action`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};

export const updateRequestHumanAction = async (
  { params, body, user }: { params: any; body: any; user: AuthenticatedUser },
  res: Response
): Promise<void> => {
  const { RequestModel } = dm;
  const { requestId } = params;
  const { type, comment } = body;

  try {
    if (!user.accessFlags.includes(AccessFlag.EditAll)) {
      throw errorWithCode("unauthorized", 401);
    }
    // Step 1. fetch Request
    const request = await RequestModel.findById(requestId);

    // Step 2. create human_action record
    await RequestModel.createHumanAction({
      requestId: request.id,
      type,
      comment,
      userId: user.id,
    });

    await RequestModel.receivedHumanAction(requestId);

    // Step 3.a. If approved: fulfillRequest functionality => create bot_message, send NATS message
    // Step 3.b. if rejected: updateRejectProject => archive ProjectSet, Email PO/TC with comment, complete request;
    if (type === HumanActionType.Approve) {
      await fulfillRequest(request);
      await updateProfileStatus(
        Number(request.profileId),
        PROFILE_STATUS.APPROVED
      );
      return res.status(204).end();
    }

    logger.info(
      `Sending CHES message Project Request Rejected for ${request.profileId}`
    );
    await sendProvisioningMessage(
      request.profileId,
      MessageType.RequestRejected
    );
    logger.info(`CHES message sent for ${request.profileId}`);

    if (request.type === RequestType.Create) {
      await archiveProjectSet(request.profileId);
    }

    if (request.type === RequestType.Edit) {
      await updateProfileStatus(
        Number(request.profileId),
        PROFILE_STATUS.PROVISIONED
      );
    }

    await RequestModel.updateCompletionStatus(requestId);

    return res.status(204).end();
  } catch (err) {
    if (err.code) {
      throw err;
    }

    const message = `Unable to update request ${requestId} with human action`;
    logger.error(`${message}, err = ${err.message}`);

    throw errorWithCode(message, 500);
  }
};
