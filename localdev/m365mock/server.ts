import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MsUser } from '@sandbox/types';

const app = express();
const port = 4040;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('__dirname__dirname', __dirname);

const jsonData = readFileSync(path.join(__dirname, '../mock-users.json'), 'utf-8');
const msUsers: MsUser[] = JSON.parse(jsonData);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, M365 Mock Server!');
});

app.get('/v1.0/users/:email/photo/$value', (req: Request, res: Response) => {
  res.status(404).send(null);
});

app.get('/v1.0/users', (req: Request, res: Response) => {
  res.json({ value: msUsers });
});

app.get('/v1.0/users/:upn', (req: Request, res: Response) => {
  const { upn } = req.params;
  const user = msUsers.find(({ userPrincipalName }) => userPrincipalName === upn);
  res.json(user);
});

app.listen(port, () => {
  console.log(`M365 Mock Server running at https://localhost:${port}`);
});
