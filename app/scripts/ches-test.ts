import { sendEmail } from '@/services/ches/core';

async function main() {
  await sendEmail({ subject: 'Test Email', body: '<div>Test Body</div>', to: ['junmin.1.ahn@gov.bc.ca'] });
}

main().catch((err) => {
  console.error('Error:', err.response?.data || err.message);
});
