import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { M365_URL } from './config.js';
const app = express();
const port = 4040;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mocks = [];
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
const mockMap = new Map();
mocks.forEach((mock) => {
  const url = new URL(mock.request.url.replace('https://graph.microsoft.com', M365_URL));
  const route = `${mock.request.method.toLowerCase()}${url.pathname}`;
  mockMap.set(route, mock);
});
app.all('*', (req, res) => {
  const requestedPath = req.path;
  const requestedMethod = req.method.toLowerCase();
  const routeKey = `${requestedMethod}${requestedPath}`;
  const mock = mockMap.get(routeKey);
  if (mock) {
    res.status(mock.response.statusCode || 200).json(mock.response.body);
  } else {
    res.status(404).send('Mock data not found');
  }
});
app.get('/', (req, res) => {
  res.send('Hello, M365 Mock Server!');
});
app.listen(port, () => {
  console.log(`M365 Mock Server running at https://localhost:${port}`);
});
