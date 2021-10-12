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

import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { QuotaSize } from "../src/db/model/quota";
import RequestModel, { RequestEditType } from "../src/db/model/request";
import {
  contextForEditing,
  contextForProvisioning,
  fulfillRequest,
} from "../src/libs/fulfillment";

const p1 = path.join(__dirname, "fixtures/select-profile.json");
const profile = JSON.parse(fs.readFileSync(p1, "utf8"));

const p2 = path.join(__dirname, "fixtures/select-profile-contacts.json");
const contacts = JSON.parse(fs.readFileSync(p2, "utf8"));

const p3 = path.join(__dirname, "fixtures/select-project-set-namespaces.json");
const profileClusterNamespaces = JSON.parse(fs.readFileSync(p3, "utf8"));

const p4 = path.join(__dirname, "fixtures/select-quota-small.json");
const quotas = JSON.parse(fs.readFileSync(p4, "utf8"));
const spec = quotas[0].jsonBuildObject;

const p5 = path.join(__dirname, "fixtures/get-requests.json");
const requests = JSON.parse(fs.readFileSync(p5, "utf8"));

const p6 = path.join(
  __dirname,
  "fixtures/get-edit-object-project-profile.json"
);
const profileEditObject = fs.readFileSync(p6, "utf8");

const p7 = path.join(
  __dirname,
  "fixtures/get-edit-object-profile-contacts.json"
);
const contactEditObject = fs.readFileSync(p7, "utf8");

const p9 = path.join(__dirname, "fixtures/get-bot-message-set.json");
const botMessageSet = JSON.parse(fs.readFileSync(p9, "utf8"));

const p10 = path.join(__dirname, "fixtures/select-default-cluster.json");
const profileCluster = JSON.parse(fs.readFileSync(p10, "utf8"));

jest.mock("../src/libs/profile", () => {
  return {
    getQuotaSize: jest.fn().mockResolvedValue(QuotaSize.Small),
  };
});

jest.mock("../src/libs/utils", () => {
  return {
    replaceForDescription: jest.fn().mockReturnValue("nats_stub"),
  };
});

describe("Fulfillment utility", () => {
  const client = new Pool().connect();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fulfill a request", async () => {
    // context for provisioning
    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: contacts });
    client.query.mockReturnValueOnce({ rows: quotas });
    // buildContext
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });
    // createBotMessageSet
    client.query.mockReturnValueOnce({ rows: [{ id: 1, name: "silver" }] });
    // fetchBotMessageRequests
    const fetchBotMessageRequests =
      (RequestModel.prototype.findActiveBotMessagesByRequestId = jest
        .fn()
        .mockResolvedValue(botMessageSet));

    const result = await fulfillRequest(requests[2]);

    expect(result).toBeUndefined();
    expect(fetchBotMessageRequests).toBeCalledTimes(1);
    expect(client.query.mock.calls).toMatchSnapshot();
  });

  it("should create a context for provisioning", async () => {
    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: contacts });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });

    const result = await contextForProvisioning(
      12345,
      profileCluster[0],
      false
    );

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it("should not create a context for provisioning with no contacts", async () => {
    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: [] });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });

    await expect(
      contextForProvisioning(12345, profileCluster[0], false)
    ).rejects.toThrow();
  });

  it("should not create a context for provisioning with failing query", async () => {
    client.query.mockImplementation(() => {
      throw new Error();
    });

    await expect(
      contextForProvisioning(12345, profileCluster[0], false)
    ).rejects.toThrow();
  });

  it("should create a context for a profile edit", async () => {
    const requestEditObject = profileEditObject;
    const requestEditType = RequestEditType.ProjectProfile;

    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: contacts });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });

    const result = await contextForEditing(
      12345,
      requestEditType,
      requestEditObject,
      profileCluster[0]
    );

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it("should create a context for a contact edit", async () => {
    const requestEditObject = contactEditObject;
    const requestEditType = RequestEditType.Contacts;

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: quotas });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });

    const result = await contextForEditing(
      12345,
      requestEditType,
      requestEditObject,
      profileCluster[0]
    );

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it("should create a context for a quota edit", async () => {
    const requestEditObject = {
      quota: QuotaSize.Small,
      quotas: spec,
    };
    const requestEditType = RequestEditType.QuotaSize;
    client.query.mockReturnValueOnce({ rows: profile });

    client.query.mockReturnValueOnce({ rows: contacts });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });

    const result = await contextForEditing(
      12345,
      requestEditType,
      requestEditObject,
      profileCluster[0]
    );

    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it("should throw an error if edit context is missing contacts", async () => {
    const requestEditObject = {
      quota: QuotaSize.Small,
      quotas: spec,
    };
    const requestEditType = RequestEditType.QuotaSize;

    client.query.mockReturnValueOnce({ rows: profile });
    client.query.mockReturnValueOnce({ rows: [] });
    client.query.mockReturnValueOnce({ rows: profileClusterNamespaces });

    await expect(
      contextForEditing(
        12345,
        requestEditType,
        requestEditObject,
        profileCluster[0]
      )
    ).rejects.toThrow();
  });

  it("should throw an error if edit context query fails", async () => {
    const requestEditObject = {
      quota: QuotaSize.Small,
      quotas: spec,
    };
    const requestEditType = RequestEditType.QuotaSize;

    client.query.mockImplementation(() => {
      throw new Error();
    });

    await expect(
      contextForEditing(
        12345,
        requestEditType,
        requestEditObject,
        profileCluster[0]
      )
    ).rejects.toThrow();
  });
});
