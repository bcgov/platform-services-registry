import express, { Request, Response, NextFunction } from 'express';
import { readFileSync } from 'fs';

const app = express();
const port = 4040;

interface Mock {
  request: {
    method: string;
    url: string;
  };
  response: {
    statusCode: number;
    body?: any;
  };
}

// const mocks = JSON.parse(readFileSync('./mocks.json', 'utf-8'));

// (mocks as { mocks: Mock[] }).mocks.forEach((mock: Mock) => {
//     console.log('Mock:', mock);
//     app.get(mock.request.url, async (req: Request, res: Response, next: NextFunction) => {
//         console.log('Received request:', req);
//         next();
//     });
// });

// app.get('graph.microsoft.com/v1.0/users', async (req: Request, res: Response) => {
//   res.send({
//     "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users/$entity",
//     "id": "a008b857-36c8-4a17-a79a-518e33effeb1",
//     "onPremisesSamAccountName": "JOHNDOE",
//     "userPrincipalName": "john.doe@gov.bc.ca",
//     "mail": "john.doe@gov.bc.ca",
//     "displayName": "Doe, John CITZ:EX",
//     "givenName": "John",
//     "surname": "Doe",
//     "jobTitle": ""
//   });
// });

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello, M365 Mock Server!');
});

app.listen(port, () => {
  console.log(`M365 Mock Server running at https://localhost:${port}`);
});
