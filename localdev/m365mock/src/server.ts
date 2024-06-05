import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';

const mocks = JSON.parse(readFileSync('../m365proxy/mocks.json', 'utf-8'));
const app = express();
const port = 4040;

// app.get('/v1.0/$metadata', async (req: Request, res: Response) => {

//   const mockResponse = mocks.mocks.find((mock: any) => {
//     return (
//       mock.request.url === 'https://graph.microsoft.com/v1.0/users?$filter*' &&
//       mock.request.method === 'GET'
//     );
//   });

//   if (mockResponse) {
//     res.json(mockResponse.response.body);
//   } else {
//     res.status(404).send('Mock data not found');
//   }
// });

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello, M365 Mock Server!');
});

app.listen(port, () => {
  console.log(`M365 Mock Server running at https://localhost:${port}`);
});
