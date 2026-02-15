import { readFileSync } from 'fs';

const files = [
  'app/admin/users/page.tsx',
  'app/admin/kyc/page.tsx', 
  'app/admin/activity/page.tsx',
  'app/admin/page.tsx',
  'app/admin/support/page.tsx',
  'app/admin/chat/page.tsx',
  'app/admin/transactions/page.tsx',
  'app/admin/settings/page.tsx',
  'app/admin/login/page.tsx',
  'app/admin/layout.tsx',
];

for (const file of files) {
  try {
    const content = readFileSync(file, 'utf8');
    const openDivs = (content.match(/<div/g) || []).length;
    const closeDivs = (content.match(/<\/div>/g) || []).length;
    const diff = openDivs - closeDivs;
    const status = diff === 0 ? 'OK' : diff > 0 ? `UNCLOSED (+${diff})` : `EXTRA CLOSE (${diff})`;
    console.log(`${file}: open=${openDivs} close=${closeDivs} ${status}`);
  } catch (e) {
    console.log(`${file}: NOT FOUND`);
  }
}
