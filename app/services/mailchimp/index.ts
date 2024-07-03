// import { createHash } from 'crypto';
// import { IncomingMessage, RequestOptions } from 'http';
// import * as https from 'https';
// import { MAILCHIMP_LIST_ID, MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX } from '@/config';

// import  {client} from '@mailchimp/mailchimp_marketing';
const client = require('@mailchimp/mailchimp_marketing');

const MAILCHIMP_LIST_ID = '';
const MAILCHIMP_API_KEY = '';
const MAILCHIMP_SERVER_PREFIX = '';
// const SEGMENT_ID = ""
// const userEmail = 'test.email@gov.bc.ca';
// const userFname = 'Test';
// const userLname = 'Email';

// const data = JSON.stringify({
//   email_address: userEmail,
//   status: 'subscribed',
//   merge_fields: {
//     FNAME: userFname,
//     LNAME: userLname,
//   },
// });

// const emailHash = createHash('md5').update(userEmail.toLowerCase()).digest('hex');

client.setConfig({
  apiKey: MAILCHIMP_API_KEY,
  server: MAILCHIMP_SERVER_PREFIX,
});

const run = async () => {
  const response = await client.lists.listSegments(MAILCHIMP_LIST_ID);
  console.log('response', response);
};

run();

// client.setConfig({
//   apiKey: MAILCHIMP_API_KEY,
//   server: MAILCHIMP_SERVER_PREFIX,
// });

// const run = async () => {
//   const response = await client.lists.batchSegmentMembers(
//     {},
//     MAILCHIMP_LIST_ID,
//     SEGMENT_ID
//   );
//   console.log(response);
// };

// run();

// run();

// const createOptions: RequestOptions = {
//   hostname: `${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com`,
//   port: 443,
//   path: `/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
//   },
// };

// const updateOptions: RequestOptions = {
//   hostname: `${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com`,
//   port: 443,
//   path: `/3.0/lists/${MAILCHIMP_LIST_ID}/members/${emailHash}`,
//   method: 'PUT',
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
//   },
// };

// const makeRequest = (options: RequestOptions, requestData: string) => {
//   return new Promise((resolve, reject) => {
//     const req = https.request(options, (res: IncomingMessage) => {
//       let body = '';

//       res.on('data', (chunk: any) => {
//         body += chunk;
//       });

//       res.on('end', () => {
//         resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
//       });
//     });

//     req.on('error', (error: Error) => {
//       reject(error);
//     });

//     req.write(requestData);
//     req.end();
//   });
// };

// (async () => {
//   try {
//     const createResponse: any = await makeRequest(createOptions, data);
//     console.log('Create Response:', createResponse);

//     if (createResponse.statusCode === 400 && createResponse.body.title === 'Member Exists') {
//       const updateResponse: any = await makeRequest(updateOptions, data);
//       console.log('Update Response:', updateResponse);
//     } else {
//       console.log('Successfully created member.');
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// })();
