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

import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { archiveProfileNamespace, createNamespace, fetchProfileNamespace, fetchProfileNamespaces, updateProfileNamespace } from '../src/controllers/namespace';

const p0 = path.join(__dirname, 'fixtures/select-namespace.json');
const select = JSON.parse(fs.readFileSync(p0, 'utf8'));

const p1 = path.join(__dirname, 'fixtures/insert-namespace.json');
const insert = JSON.parse(fs.readFileSync(p1, 'utf8'));

const client = {
  query: jest.fn(),
  release: jest.fn(),
}

// jest.mock('nats', () => {
//   return {
//     connect: jest.fn(),
//   };
// });

jest.mock('pg', () => {
  return {
    Pool: jest.fn(() => {
      return {
        connect: jest.fn().mockImplementation(() => {
          return client;
        }),
        query: jest.fn(),
        end: jest.fn(),
      }
    }),
  };
});

class FauxExpress {
  res: Partial<Response> = {
    clearCookie: jest.fn(),
    cookie: jest.fn(),
    json: jest.fn().mockImplementation((param) => {
      this.responseData = param;
      return this.res;
    }),
    status: jest.fn().mockImplementation((code) => {
      this.res.statusCode = code;
      return this.res;
    }),
    statusCode: 200,
    end: jest.fn(),
  }
  req: any;
  responseData: any;
}

describe('Namespace event handlers', () => {
  let ex;

  beforeEach(() => {
    jest.clearAllMocks();

    ex = new FauxExpress();
  });

  it('A Namespace is created', async () => {
    const req = {
      body: insert,
      params: { profileId: 1 },
    };

    const addon = {
      id: 9,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    client.query.mockReturnValueOnce({ rows: [{ ...insert, ...addon }] });

    // @ts-ignore
    await createNamespace(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot({
      id: expect.any(Number),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('A Namespace fails to create', async () => {
    const req = {
      body: insert,
    };

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(createNamespace(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });


  it('All Namespaces are returned', async () => {
    const req = {
      params: { profileId: 1 },
    };
    client.query.mockReturnValueOnce({ rows: select });

    // @ts-ignore
    await fetchProfileNamespaces(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch all Namespaces should throw', async () => {
    const req = {
      params: {},
    };
    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(fetchProfileNamespaces(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('A single Namespace is returned', async () => {
    const req = {
      params: {
        profileId: 1,
        namespaceId: 1,
      },
    };
    client.query.mockReturnValueOnce({ rows: [select[0]] });

    // @ts-ignore
    await fetchProfileNamespace(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).toBeCalled();
  });

  it('Fetch single profile should throw', async () => {
    const req = {
      params: { profileId: 1 },
    };
    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(fetchProfileNamespace(req, ex.res)).rejects.toThrowErrorMatchingSnapshot();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.responseData).toBeUndefined();
  });

  it('A Namespace is updated', async () => {
    const body = JSON.parse(JSON.stringify(insert));
    // const aBody = {
    //   ...body,
    //   id: 9,
    //   createdAt: '2020-05-19T20:02:54.561Z',
    //   updateAt: '2020-05-19T20:02:54.561Z',
    // };
    const req = {
      params: {
        profileId: 1,
        namespaceId: 1,
      },
      body,
    }

    client.query.mockReturnValue({ rows: [body] });

    // @ts-ignore
    await updateProfileNamespace(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.status).toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });

  it('A Namespace fails to update', async () => {
    const body = JSON.parse(JSON.stringify(insert));
    const req = {
      params: {
        profileId: 1,
      },
      body,
    }

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(updateProfileNamespace(req, ex.res)).rejects.toThrow();

    expect(ex.res.status).not.toBeCalled();
    expect(ex.res.json).not.toBeCalled();
  });

  it('A Namespace is archived', async () => {
    const req = {
      params: {
        profileId: 9,
        namespaceId: 9,
      },
    }

    client.query.mockReturnValueOnce({ rows: [{ ...insert, archived: true }] });

    // @ts-ignore
    await archiveProfileNamespace(req, ex.res);

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.responseData).toMatchSnapshot();
    expect(ex.res.json).not.toBeCalled();
    expect(ex.res.end).toBeCalled();
  });

  it('A project fails to archive', async () => {
    const req = {
      params: {
        profileId: 9,
      },
    }

    client.query.mockImplementation(() => { throw new Error() });

    // @ts-ignore
    await expect(archiveProfileNamespace(req, ex.res)).rejects.toThrow();

    expect(client.query.mock.calls).toMatchSnapshot();
    expect(ex.res.statusCode).toMatchSnapshot();
    expect(ex.res.json).not.toBeCalled();
    expect(ex.res.end).not.toBeCalled();
  });
});
