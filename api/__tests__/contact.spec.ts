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

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { processContactEdit, requestContactEdit, updateContact } from '../src/controllers/contact';
import FauxExpress from './src/fauxexpress';

const p0 = path.join(__dirname, 'fixtures/select-profile-contacts.json');
const selectContact = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/select-contact-edit-request.json');
const selectContactEditRequest = JSON.parse(fs.readFileSync(p1, 'utf8'));

const client = new Pool().connect();

jest.mock('../src/libs/fulfillment', () => {
  const p2 = path.join(__dirname, 'fixtures/provisioning-context.json');
  const natsContext = JSON.parse(fs.readFileSync(p2, 'utf8'));
  const natsSubject = 'edit';
  return {
    fulfillNamespaceEdit: jest.fn().mockResolvedValue({natsContext, natsSubject}),
  };
});

describe('Contact event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();
    // jest.resetAllMocks();

    ex = new FauxExpress();
  });

  it('A contact is updated', async () => {
    const body = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      githubId: 'john1100',
    };
    const req = {
      params: { contactId: 233 },
      body,
    }

    client.query.mockResolvedValue({ rows: [selectContact[0]] });

    // @ts-ignore
    await updateContact(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('A contact fails to update', async () => {
    const body = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      githubId: 'john1100',
    };
    const req = {
      params: { contactId: 233 },
      body,
    }

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(updateContact(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });

  it('A contact edit request is created', async () => {
    const body = {
      productOwner: {
        roleId: 1,
        id: 233,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        githubId: 'jane1100',
      },
      technicalContact: {
        roleId: 2,
        id: 234,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        githubId: 'john1100',
      },
    };
    const req = {
      params: { profileId: 118 },
      body,
    }

    client.query.mockResolvedValue({
        roleId: 1,
        id: 233,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        githubId: 'jane1100',
    });

    client.query.mockResolvedValue({
      productOwner: {
        userId: 'jane1100',
        provider: 'github',
        email: 'jane.doe@example.ca',
      },
      technicalContact: {
        userId: 'john1100',
        provider: 'github',
        email: 'john.doe@example.com',
      },
    });

    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });
    client.query.mockReturnValueOnce({ rows: [{ count: '0' }] });

    // @ts-ignore
    await requestContactEdit(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.end).toBeCalled();
  });

  it('A contact edit request fails to be created', async () => {
    const body = {
      productOwner: {
        roleId: 1,
        id: 233,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        githubId: 'jane1100',
      },
      technicalContact: {
        roleId: 2,
        id: 234,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        githubId: 'john1100',
      },
    };
    const req = {
      params: { profileId: 118 },
      body,
    }

    client.query.mockResolvedValue({
      productOwner: {
        userId: 'jane1100',
        provider: 'github',
        email: 'jane.doe@example.com',
      },
      technicalContact: {
        userId: 'john1100',
        provider: 'github',
        email: 'john.doe@example.com',
      },
    });

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(requestContactEdit(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.end).not.toBeCalled();
  });

  it('A contact edit request is processed', async () => {
    const req = selectContactEditRequest

    const editedPO = {
      productOwner: {
        roleId: 1,
        id: 233,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        githubId: 'janedoe',
      },
    };

    const editedTC = {
      technicalContact: {
        roleId: 2,
        id: 234,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        githubId: 'john1100',
      },
    };

    client.query.mockResolvedValue({ ...editedPO, ...editedTC});

    client.query.mockResolvedValueOnce({ rows: [{ editedPO }] });
    client.query.mockResolvedValueOnce({ rows: [{ editedPO }] });
    client.query.mockResolvedValueOnce({ rows: [{ editedTC }] });
    client.query.mockResolvedValueOnce({ rows: [{ editedTC }] });

    JSON.parse = jest.fn().mockImplementationOnce(() => {
      return selectContactEditRequest.editObject;
    });

    await processContactEdit(req);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(JSON.parse).toHaveBeenCalledTimes(1);
  });
});
