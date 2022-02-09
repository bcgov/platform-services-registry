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

import mockAxios from "axios";
import {
  getToken,
  getContactId,
  subscribeUserToMautic,
} from "../src/controllers/communications/helpers";

describe("Subscribe user to communications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockToken = "abc";
  const mockEmail = "test@test.com";
  const mockContactId = "123";

  it("getToken fetches access token", async () => {
    // @ts-ignore
    mockAxios.post.mockResolvedValue({ data: { access_token: mockToken } });

    const token = await getToken();

    expect(token).toBeDefined();
    expect(token).toEqual(mockToken);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });

  it("getContactId fetches contact ID", async () => {
    // @ts-ignore
    mockAxios.get.mockResolvedValue({ data: { contactId: mockContactId } });

    const contactId = await getContactId(mockEmail, mockToken);

    expect(contactId).toBeDefined();
    expect(contactId).toEqual(mockContactId);
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
  });

  it("subscribeUsersToMesseges response status is 200", async () => {
    // @ts-ignore
    mockAxios.post.mockResolvedValue({ status: 200 });

    const response = await subscribeUserToMautic(mockContactId, mockToken);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(mockAxios.post).toHaveBeenCalledTimes(1);
  });
});
