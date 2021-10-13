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
import {
  addContactToProfile,
  fetchProfileAllowedQuotaSizes,
  fetchProfileContacts,
  fetchProfileEditRequests,
  fetchProfileQuotaSize,
  updateProfileContacts,
  updateProfileQuotaSize
} from "../src/controllers/profile";
import ContactModel from "../src/db/model/contact";
import { QuotaSize } from "../src/db/model/quota";
import RequestModel from "../src/db/model/request";
import { getQuotaSize } from "../src/libs/profile";
import getAllowedQuotaSizes from "../src/libs/quota";
import {
  requestProfileContactsEdit,
  requestProfileQuotaSizeEdit
} from "../src/libs/request";
import FauxExpress from "./src/fauxexpress";

const p0 = path.join(__dirname, "fixtures/select-profile.json");
const selectProfile = JSON.parse(fs.readFileSync(p0, "utf8"));

const p1 = path.join(__dirname, "fixtures/select-profile-contacts.json");
const selectProfilesContacts = JSON.parse(fs.readFileSync(p1, "utf8"));

const p2 = path.join(__dirname, "fixtures/get-request-edit-quota-size.json");
const requestQuotaSize = JSON.parse(fs.readFileSync(p2, "utf8"));

const p3 = path.join(__dirname, "fixtures/get-request-edit-contacts.json");
const requestEditContacts = JSON.parse(fs.readFileSync(p3, "utf8"));

const requests = [requestQuotaSize[0], requestEditContacts[0]];

const p4 = path.join(__dirname, "fixtures/get-authenticated-user.json");
const authenticatedUser = JSON.parse(fs.readFileSync(p4, "utf8"));

const client = new Pool().connect();

jest.mock("../src/libs/profile", () => {
  return {
    getQuotaSize: jest.fn().mockResolvedValue("small"),
    updateProfileStatus: jest.fn(),
  };
});

jest.mock("../src/libs/quota", () => jest.fn().mockReturnValue(["medium"]));

jest.mock("../src/libs/request", () => ({
  requestProjectProfileEdit: jest.fn(),
  requestProfileContactsEdit: jest.fn().mockResolvedValue({ id: 2 }),
  requestProfileQuotaSizeEdit: jest.fn(),
}));

jest.mock("../src/libs/fulfillment", () => {
  return {
    fulfillRequest: jest.fn(),
  };
});
describe("Profile event handlers", () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it("Link a contact to profile successfully", async () => {
    const req = {
      params: { profileId: 4, contactId: 1 },
    };

    client.query.mockReturnValueOnce({ rows: [] });

    await addContactToProfile(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

  it("Link a contact to profile should throw", async () => {
    const req = {
      params: { profileId: 4, contactId: 1 },
    };

    client.query.mockImplementation(() => {
      throw new Error();
    });

    await expect(
      addContactToProfile(req, ex.res)
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it("A profiles contacts are returned", async () => {
    const req = {
      params: { profileId: 1 },
    };

    client.query.mockReturnValueOnce({ rows: selectProfilesContacts });

    await fetchProfileContacts(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it("Fetch single profile contacts should throw", async () => {
    const req = {
      params: { profileId: 1 },
    };
    client.query.mockImplementation(() => {
      throw new Error();
    });

    await expect(
      fetchProfileContacts(req, ex.res)
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it("updates profile contacts with non provisioner-related changes", async () => {
    const body = [
      {
        id: 1,
        firstName: "JaneTEST",
        lastName: "DoeTEST",
        email: "jane@example.com",
        githubId: "jane1100",
        roleId: 1,
      },
      {
        id: 2,
        firstName: "JohnTEST",
        lastName: "DoeTEST",
        email: "john@example.com",
        githubId: "john1100",
        roleId: 2,
      },
    ];

    const req = {
      params: { profileId: 4 },
      body,
      user: authenticatedUser,
    };

    client.query.mockReturnValueOnce({ rows: selectProfilesContacts });
    client.query.mockReturnValueOnce({ rows: [] });

    const update = (ContactModel.prototype.update = jest.fn());

    await updateProfileContacts(req, ex.res);

    expect(update).toHaveBeenCalledTimes(2);
    expect(requestProfileContactsEdit).toHaveBeenCalledTimes(1);
    expect(ex.res.statusCode).toBe(204);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

  it("requests profile contacts edit with provisioner-related changes", async () => {
    const body = [
      {
        id: 1,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        githubId: "jane1100",
        roleId: 1,
      },
      {
        id: 2,
        firstName: "John",
        lastName: "Doe",
        email: "johnTEST@example.com",
        githubId: "john1100",
        roleId: 2,
      },
    ];
    const req = {
      params: { profileId: 4 },
      body,
      user: authenticatedUser,
    };

    client.query.mockReturnValueOnce({ rows: selectProfilesContacts });
    const update = (ContactModel.prototype.update = jest.fn());

    await updateProfileContacts(req, ex.res);

    expect(update).toHaveBeenCalledTimes(0);
    expect(requestProfileContactsEdit).toHaveBeenCalledTimes(1);
    expect(ex.res.statusCode).toBe(202);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

  it("throws an error when updating contact if req body is empty", async () => {
    const req = {
      params: { profileId: 4 },
      body: [],
      user: authenticatedUser,
    };

    await expect(updateProfileContacts(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.end).not.toBeCalled();
  });

  it("returns the profiles quota size", async () => {
    const req = {
      params: { profileId: 4 },
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    await fetchProfileQuotaSize(req, ex.res);

    expect(getQuotaSize).toHaveBeenCalledTimes(1);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it("throws an error when fetch profiles quota size has problem", async () => {
    const req = {
      params: { profileId: 4 },
    };

    client.query.mockImplementation(() => {
      throw new Error();
    });

    await expect(
      fetchProfileQuotaSize(req, ex.res)
    ).rejects.toThrowErrorMatchingSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it("returns a list of quota options for a given profile", async () => {
    const req = {
      params: { profileId: 4 },
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    await fetchProfileAllowedQuotaSizes(req, ex.res);

    expect(getAllowedQuotaSizes).toHaveBeenCalledTimes(1);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it("throws an error when fetching a list of quota options for a given profile has a problem", async () => {
    const req = {
      params: { profileId: 4 },
    };

    client.query.mockImplementation(() => {
      throw new Error();
    });

    await expect(
      fetchProfileAllowedQuotaSizes(req, ex.res)
    ).rejects.toThrowErrorMatchingSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it("Request profile quota size edit successfully", async () => {
    const body = {
      requestedQuotaSize: testRequestQuotaSize,
    };
    const req = {
      params: { profileId: 4 },
      body,
      user: authenticatedUser,
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    await updateProfileQuotaSize(req, ex.res);

    expect(requestProfileQuotaSizeEdit).toHaveBeenCalledTimes(1);
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
  });

  it("throws an error if profile quota size edit request is invalid", async () => {
    const body = {
      requestedQuotaSize: {
        quotaCpuSize: QuotaSize.Large,
        quotaMemorySize: QuotaSize.Large,
        quotaStorageSize: QuotaSize.Large
      }
    };
    const req = {
      params: { profileId: 4 },
      body,
      user: authenticatedUser,
    };

    client.query.mockReturnValueOnce({ rows: selectProfile });

    await expect(
      updateProfileQuotaSize(req, ex.res)
    ).rejects.toThrowErrorMatchingSnapshot();
    expect(requestProfileQuotaSizeEdit).toHaveBeenCalledTimes(0);
    expect(ex.responseData).toBeUndefined();
  });

  it("throws an error if there is a db transaction issue when requesting profile quota size edit", async () => {
    const body = {
      requestedQuotaSize: "medium",
    };
    const req = {
      params: { profileId: 4 },
      body,
      user: authenticatedUser,
    };

    client.query.mockImplementation(() => {
      throw new Error();
    });

    await expect(
      updateProfileQuotaSize(req, ex.res)
    ).rejects.toThrowErrorMatchingSnapshot();

    expect(ex.responseData).toBeUndefined();
  });

  it("Profile edit requests are returned", async () => {
    const req = {
      params: { profileId: 4 },
    };

    RequestModel.prototype.findForProfile = jest
      .fn()
      .mockResolvedValue(requests);

    await fetchProfileEditRequests(req, ex.res);

    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });
});
