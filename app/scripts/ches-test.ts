import { sendEmail } from '@/services/ches/core';

async function main() {
  await sendEmail({ subject: 'Test Email', body: '<div>Test Body</div>', to: ['<target-email>'] });
}

main().catch((err) => {
  console.error('Error:', err.response?.data || err.message);
});
