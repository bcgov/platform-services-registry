import { sendDeleteRequestEmails } from '@/services/ches/private-cloud/email-handler'; // Adjust the path to your module

const args = process.argv.slice(2);
if (args.length !== 3) {
  console.error('Expected three arguments: functionName, request, and userName');
  process.exit(1);
}

const [functionName, requestArg, userName] = args;

let request;
try {
  request = JSON.parse(requestArg);
} catch (error) {
  console.error('Invalid JSON for request:', error);
  process.exit(1);
}

const functionMap: { [key: string]: any } = {
  sendDeleteRequestEmails,
};

const selectedFunction = functionMap[functionName];

if (!selectedFunction) {
  console.error(`Function ${functionName} not found`);
  process.exit(1);
}

selectedFunction(request, userName)
  .then(() => {
    console.log(`${functionName} executed successfully`);
    process.exit(0);
  })
  .catch((error: any) => {
    console.error(`Error executing ${functionName}:`, error);
    process.exit(1);
  });
