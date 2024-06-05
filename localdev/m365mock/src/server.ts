import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';

let mocks;

try {
  const jsonData = readFileSync('../m365proxy/mocks.json', 'utf-8');
  const jsonDataObject = JSON.parse(jsonData);

  if (!Array.isArray(jsonDataObject.mocks)) {
    throw new Error("Invalid JSON file. 'mocks' property is not an array.");
  }

  mocks = jsonDataObject.mocks;
} catch (error) {
  console.error('Error parsing JSON data:', error);
  process.exit(1);
}
const app = express();
const port = 4040;

app.get('/v1.0/users*', async (req: Request, res: Response) => {
  const requestedPath = req.path;
  const requestedQuery = req.query;
  const filteredMocks = mocks.filter((mock: any) => {
    return mock.request.url.includes(requestedPath) && mock.request.url.includes(Object.keys(requestedQuery)[0]);
  });

  if (filteredMocks.length > 0) {
    const mockResponse = filteredMocks[0];
    res.json(mockResponse.response.body);
  } else {
    res.status(404).send('Mock data not found');
  }
});

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello, M365 Mock Server!');
});

app.listen(port, () => {
  console.log(`M365 Mock Server running at https://localhost:${port}`);
});