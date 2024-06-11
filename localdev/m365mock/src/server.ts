import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 4040;

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

type Mock = {
  request: {
    method: HttpMethod;
    url: string;
  };
  response: {
    statusCode?: number;
    body?: unknown;
  };
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mocks: Mock[] = [];

try {
  const jsonData = readFileSync(path.join(__dirname, '../m365proxy/mocks.json'), 'utf-8');
  const jsonDataObject = JSON.parse(jsonData);

  if (!Array.isArray(jsonDataObject.mocks)) {
    throw new Error("Invalid JSON file. 'mocks' property is not an array.");
  }

  mocks = jsonDataObject.mocks;
} catch (error) {
  console.error('Error parsing JSON data:', error);
  process.exit(1);
}

mocks.forEach((mock: Mock) => {
  const method = mock.request.method.toLowerCase() as HttpMethod;
  const route = new URL(mock.request.url).pathname;

  app[method](route, async (req: Request, res: Response) => {
    const requestedPath = req.path;
    const requestedQuery = req.query;
    const filteredMocks = mocks.filter((mockFilter: Mock) => {
      const mockUrl = new URL(mockFilter.request.url);
      return (
        mockUrl.pathname === requestedPath &&
        Array.from(mockUrl.searchParams.keys()).every((key) => key in requestedQuery)
      );
    });

    if (filteredMocks.length > 0) {
      const mockResponse = filteredMocks[0];
      res.status(mockResponse.response.statusCode || 200).json(mockResponse.response.body);
    } else {
      res.status(404).send('Mock data not found');
    }
  });
});

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello, M365 Mock Server!');
});

app.listen(port, () => {
  console.log(`M365 Mock Server running at https://localhost:${port}`);
});
